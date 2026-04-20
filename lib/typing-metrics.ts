/** Gross WPM from all typed characters (standard 5 chars = 1 word). */
export function computeRawWpm(
  typedCharCount: number,
  elapsedSeconds: number,
): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(typedCharCount / 5 / minutes);
}

/**
 * 0–100 from per-second WPM samples: lower variance vs mean → higher score.
 */
export function computeConsistencyFromWpmSamples(samples: number[]): number {
  if (samples.length < 2) return 100;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean <= 0) return 100;
  const variance =
    samples.reduce((s, x) => s + (x - mean) ** 2, 0) / samples.length;
  const stdev = Math.sqrt(variance);
  const cv = stdev / mean;
  return Math.round(100 * Math.max(0, Math.min(1, 1 - cv * 2)));
}
