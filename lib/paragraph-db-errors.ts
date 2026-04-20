import { Prisma } from "@prisma/client";

/** True when the DB was not migrated and has no `Paragraph.category` column. */
export function isMissingParagraphCategoryColumn(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2022") {
      const col = String(
        (err.meta as { column?: unknown } | undefined)?.column ?? "",
      );
      return col.toLowerCase().includes("category");
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  return (
    /column .*category.*does not exist/i.test(msg) ||
    /does not exist.*\bcategory\b/i.test(msg) ||
    /no such column.*category/i.test(msg)
  );
}

/**
 * True when we must omit `category` from Prisma calls:
 * - DB has no `category` column, or
 * - Generated client is out of date (`Unknown argument \`category\``, etc.).
 */
export function shouldOmitParagraphCategoryInPrisma(err: unknown): boolean {
  if (isMissingParagraphCategoryColumn(err)) return true;
  if (err instanceof Prisma.PrismaClientValidationError) {
    return /Unknown argument [`']category[`']|Unknown field [`']category[`']/i.test(
      err.message,
    );
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /Unknown argument [`']category[`']|Unknown field [`']category[`']/i.test(
    msg,
  );
}
