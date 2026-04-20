export const PARAGRAPH_CATEGORY_IDS = ["easy", "medium", "hard", "expert"] as const;

export type ParagraphCategoryId = (typeof PARAGRAPH_CATEGORY_IDS)[number];

export const PARAGRAPH_CATEGORY_LABELS: Record<ParagraphCategoryId, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
};

export function parseParagraphCategory(value: unknown): ParagraphCategoryId {
  const s = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (PARAGRAPH_CATEGORY_IDS.includes(s as ParagraphCategoryId)) {
    return s as ParagraphCategoryId;
  }
  return "medium";
}

export function paragraphCategoryRank(id: string): number {
  const i = PARAGRAPH_CATEGORY_IDS.indexOf(id as ParagraphCategoryId);
  return i >= 0 ? i : 999;
}

/** HeroUI Chip `color` for each category */
export const PARAGRAPH_CATEGORY_CHIP_COLOR: Record<
  ParagraphCategoryId,
  "success" | "primary" | "warning" | "danger" | "secondary"
> = {
  easy: "success",
  medium: "primary",
  hard: "danger",
  expert: "secondary",
};
