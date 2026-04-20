import prisma from "./prisma";
import {
  parseParagraphCategory,
  type ParagraphCategoryId,
} from "./paragraph-categories";
import {
  isMissingParagraphCategoryColumn,
  shouldOmitParagraphCategoryInPrisma,
} from "./paragraph-db-errors";

/** Ensures `category` is stored when Prisma client could not set it in the typed `update`/`create`. */
async function persistParagraphCategoryRaw(
  id: number,
  category: ParagraphCategoryId,
): Promise<void> {
  try {
    await prisma.$executeRaw`
      UPDATE "Paragraph"
      SET "category" = ${category}
      WHERE "id" = ${id}
    `;
  } catch {
    /* no `category` column yet, or DB error — typed path already did what it could */
  }
}

export interface DbParagraph {
  id: number;
  title: string;
  text: string;
  category: ParagraphCategoryId;
  isActive: boolean;
  createdAt: Date;
  createdByEmail?: string;
}

export async function createParagraph(input: {
  title: string;
  text: string;
  category: ParagraphCategoryId;
  createdByEmail?: string;
}): Promise<DbParagraph> {
  const baseData = {
    title: input.title.trim(),
    text: input.text.trim(),
    isActive: true,
    createdByEmail: input.createdByEmail ?? null,
  };

  try {
    const paragraph = await prisma.paragraph.create({
      data: {
        ...baseData,
        category: input.category,
      },
    });

    await persistParagraphCategoryRaw(paragraph.id, input.category);

    return {
      id: paragraph.id,
      title: paragraph.title,
      text: paragraph.text,
      category: paragraph.category as ParagraphCategoryId,
      isActive: paragraph.isActive,
      createdAt: paragraph.createdAt,
      createdByEmail: paragraph.createdByEmail ?? undefined,
    };
  } catch (err) {
    if (!shouldOmitParagraphCategoryInPrisma(err)) throw err;
    const paragraph = await prisma.paragraph.create({
      data: baseData,
    });
    await persistParagraphCategoryRaw(paragraph.id, input.category);
    return {
      id: paragraph.id,
      title: paragraph.title,
      text: paragraph.text,
      category: input.category,
      isActive: paragraph.isActive,
      createdAt: paragraph.createdAt,
      createdByEmail: paragraph.createdByEmail ?? undefined,
    };
  }
}

export async function getActiveParagraphs(): Promise<DbParagraph[]> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        id: number;
        title: string;
        text: string;
        category: string | null;
        isActive: boolean;
        createdAt: Date;
        createdByEmail: string | null;
      }>
    >`
      SELECT id, title, text, "category", "isActive", "createdAt", "createdByEmail"
      FROM "Paragraph"
      WHERE "isActive" = true
      ORDER BY "createdAt" DESC
    `;

    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      text: p.text,
      category: parseParagraphCategory(p.category),
      isActive: p.isActive,
      createdAt: p.createdAt,
      createdByEmail: p.createdByEmail ?? undefined,
    }));
  } catch (err) {
    if (!isMissingParagraphCategoryColumn(err)) throw err;
    const rows = await prisma.$queryRaw<
      Array<{
        id: number;
        title: string;
        text: string;
        isActive: boolean;
        createdAt: Date;
        createdByEmail: string | null;
      }>
    >`
      SELECT id, title, text, "isActive", "createdAt", "createdByEmail"
      FROM "Paragraph"
      WHERE "isActive" = true
      ORDER BY "createdAt" DESC
    `;
    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      text: p.text,
      category: "medium" as ParagraphCategoryId,
      isActive: p.isActive,
      createdAt: p.createdAt,
      createdByEmail: p.createdByEmail ?? undefined,
    }));
  }
}

export async function updateParagraph(input: {
  id: number;
  title: string;
  text: string;
  category: ParagraphCategoryId;
}): Promise<DbParagraph> {
  const dataWithCategory = {
    title: input.title.trim(),
    text: input.text.trim(),
    category: input.category,
  };
  const dataLegacy = {
    title: input.title.trim(),
    text: input.text.trim(),
  };
  const selectScalars = {
    id: true,
    title: true,
    text: true,
    isActive: true,
    createdAt: true,
    createdByEmail: true,
  } as const;

  let paragraph: {
    id: number;
    title: string;
    text: string;
    isActive: boolean;
    createdAt: Date;
    createdByEmail: string | null;
  };

  try {
    paragraph = await prisma.paragraph.update({
      where: { id: input.id },
      data: dataWithCategory,
      select: selectScalars,
    });
  } catch (err) {
    if (!shouldOmitParagraphCategoryInPrisma(err)) throw err;
    paragraph = await prisma.paragraph.update({
      where: { id: input.id },
      data: dataLegacy,
      select: selectScalars,
    });
  }

  await persistParagraphCategoryRaw(input.id, input.category);

  return {
    id: paragraph.id,
    title: paragraph.title,
    text: paragraph.text,
    category: input.category,
    isActive: paragraph.isActive,
    createdAt: paragraph.createdAt,
    createdByEmail: paragraph.createdByEmail ?? undefined,
  };
}

export async function deleteParagraph(id: number): Promise<void> {
  await prisma.paragraph.delete({
    where: { id },
  });
}


