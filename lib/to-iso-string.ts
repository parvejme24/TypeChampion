/** Serialize Prisma/DB dates for JSON APIs without throwing. */
export function toIsoString(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  const d = new Date(value as string | number);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return new Date(0).toISOString();
}
