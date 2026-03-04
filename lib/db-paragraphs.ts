import prisma from "./prisma";

export interface DbParagraph {
  id: number;
  title: string;
  text: string;
  isActive: boolean;
  createdAt: Date;
  createdByEmail?: string;
}

export async function createParagraph(input: {
  title: string;
  text: string;
  createdByEmail?: string;
}): Promise<DbParagraph> {
  const paragraph = await prisma.paragraph.create({
    data: {
      title: input.title.trim(),
      text: input.text.trim(),
      isActive: true,
      createdByEmail: input.createdByEmail ?? null,
    },
  });

  return {
    id: paragraph.id,
    title: paragraph.title,
    text: paragraph.text,
    isActive: paragraph.isActive,
    createdAt: paragraph.createdAt,
    createdByEmail: paragraph.createdByEmail ?? undefined,
  };
}

export async function getActiveParagraphs(): Promise<DbParagraph[]> {
  const paragraphs = await prisma.paragraph.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return paragraphs.map((p) => ({
    id: p.id,
    title: p.title,
    text: p.text,
    isActive: p.isActive,
    createdAt: p.createdAt,
    createdByEmail: p.createdByEmail ?? undefined,
  }));
}

export async function updateParagraph(input: {
  id: number;
  title: string;
  text: string;
}): Promise<DbParagraph> {
  const paragraph = await prisma.paragraph.update({
    where: { id: input.id },
    data: {
      title: input.title.trim(),
      text: input.text.trim(),
    },
  });

  return {
    id: paragraph.id,
    title: paragraph.title,
    text: paragraph.text,
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


