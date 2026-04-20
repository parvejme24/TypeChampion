"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchParagraphsApi, type ApiParagraph } from "@/lib/api/paragraphs";
import {
  PARAGRAPH_CATEGORY_IDS,
  paragraphCategoryRank,
  PARAGRAPH_CATEGORY_LABELS,
  parseParagraphCategory,
  type ParagraphCategoryId,
} from "@/lib/paragraph-categories";
import {
  computeConsistencyFromWpmSamples,
  computeRawWpm,
} from "@/lib/typing-metrics";

export interface TypingStats {
  wpm: number;
  rawWpm: number;
  consistency: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalChars: number;
  /** When the test ended (ISO), for certificates and history */
  completedAt?: string;
  durationSeconds?: number;
  paragraphId?: number;
  paragraphTitle?: string;
  paragraphText?: string;
  typedText?: string;
}

interface TypingTestSectionProps {
  onComplete: (stats: TypingStats) => void;
  onReset: () => void;
}

/** Preset test lengths shown as tabs (seconds, ascending). */
const TIME_PRESET_SECONDS = [30, 60, 120, 300, 600] as const;

function computeStats(
  paragraph: string,
  typed: string,
  elapsedSeconds: number,
): Omit<
  TypingStats,
  | "paragraphId"
  | "paragraphTitle"
  | "paragraphText"
  | "typedText"
  | "completedAt"
> {
  const totalChars = paragraph.length;
  let correctChars = 0;
  let wrongChars = 0;
  const len = Math.min(typed.length, paragraph.length);
  for (let i = 0; i < len; i++) {
    if (typed[i] === paragraph[i]) correctChars++;
    else wrongChars++;
  }
  if (typed.length > paragraph.length) {
    wrongChars += typed.length - paragraph.length;
  }
  const wordsTyped = typed.trim().split(/\s+/).filter(Boolean).length;
  const minutes = elapsedSeconds / 60;
  const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
  const rawWpm = computeRawWpm(typed.length, elapsedSeconds);
  const totalTyped = correctChars + wrongChars;
  const accuracy =
    totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  return {
    wpm,
    rawWpm,
    consistency: 0,
    accuracy,
    correctChars,
    wrongChars,
    totalChars,
  };
}

export function TypingTestSection({
  onComplete,
  onReset,
}: TypingTestSectionProps) {
  const { data: paragraphs } = useQuery({
    queryKey: ["paragraphs"],
    queryFn: fetchParagraphsApi,
  });
  const paragraphList = useMemo(() => {
    const list = (paragraphs ?? []) as ApiParagraph[];
    return [...list].sort((a, b) => {
      const ra = paragraphCategoryRank(a.category ?? "medium");
      const rb = paragraphCategoryRank(b.category ?? "medium");
      if (ra !== rb) return ra - rb;
      return (a.title || "").localeCompare(b.title || "", undefined, {
        sensitivity: "base",
      });
    });
  }, [paragraphs]);

  const countByCategory = useMemo(() => {
    const m = new Map<ParagraphCategoryId, number>();
    for (const id of PARAGRAPH_CATEGORY_IDS) m.set(id, 0);
    for (const p of paragraphList) {
      const c = parseParagraphCategory(p.category);
      m.set(c, (m.get(c) ?? 0) + 1);
    }
    return m;
  }, [paragraphList]);

  const categoriesWithContent = useMemo(
    () =>
      PARAGRAPH_CATEGORY_IDS.filter(
        (id) => (countByCategory.get(id) ?? 0) > 0,
      ),
    [countByCategory],
  );

  const [selectedCategory, setSelectedCategory] =
    useState<ParagraphCategoryId>("easy");
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(
    null,
  );

  const paragraphsInCategory = useMemo(
    () =>
      paragraphList.filter(
        (p) => parseParagraphCategory(p.category) === selectedCategory,
      ),
    [paragraphList, selectedCategory],
  );

  const [duration, setDuration] = useState<number>(60); // seconds
  const [timeLeft, setTimeLeft] = useState(duration);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputValueRef = useRef(input);
  inputValueRef.current = input;
  const wpmSamplesRef = useRef<number[]>([]);
  const lastLoggedSecondRef = useRef(-1);
  const [liveConsistency, setLiveConsistency] = useState(100);

  useEffect(() => {
    if (categoriesWithContent.length === 0) return;
    if (!categoriesWithContent.includes(selectedCategory)) {
      const next =
        PARAGRAPH_CATEGORY_IDS.find((id) =>
          categoriesWithContent.includes(id),
        ) ?? categoriesWithContent[0];
      setSelectedCategory(next);
    }
  }, [categoriesWithContent, selectedCategory]);

  useEffect(() => {
    if (started) return;
    if (paragraphsInCategory.length === 0) return;
    if (!paragraphsInCategory.some((p) => p.id === selectedParagraphId)) {
      setSelectedParagraphId(paragraphsInCategory[0].id);
    }
  }, [paragraphsInCategory, selectedParagraphId, started]);

  const currentParagraph: ApiParagraph | null =
    paragraphsInCategory.find((p) => p.id === selectedParagraphId) ??
    paragraphsInCategory[0] ??
    paragraphList[0] ??
    null;
  const paragraphText =
    currentParagraph?.text ??
    "The quick brown fox jumps over the lazy dog. Practice every day to improve your typing speed and accuracy.";

  const stopTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStarted(false);
    const elapsedSec = startTime != null ? (Date.now() - startTime) / 1000 : 0;
    const base = computeStats(
      paragraphText,
      inputValueRef.current,
      elapsedSec,
    );
    const consistency = computeConsistencyFromWpmSamples(
      wpmSamplesRef.current,
    );
    onComplete({
      ...base,
      consistency,
      completedAt: new Date().toISOString(),
      durationSeconds: duration,
      paragraphId: currentParagraph ? Number(currentParagraph.id) : undefined,
      paragraphTitle: currentParagraph?.title,
      paragraphText,
      typedText: inputValueRef.current,
    });
  }, [paragraphText, startTime, duration, onComplete, currentParagraph]);

  useEffect(() => {
    if (!started || startTime == null) return;
    intervalRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      setElapsed(Math.floor(elapsedSec));
      const sec = Math.floor(elapsedSec);
      if (sec > lastLoggedSecondRef.current) {
        lastLoggedSecondRef.current = sec;
        const words = inputValueRef.current
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        const min = elapsedSec / 60;
        const sampleWpm = min > 0 ? Math.round(words / min) : 0;
        wpmSamplesRef.current.push(sampleWpm);
        setLiveConsistency(
          computeConsistencyFromWpmSamples(wpmSamplesRef.current),
        );
      }
      const remaining = Math.max(0, duration - elapsedSec);
      setTimeLeft(Math.ceil(remaining));
      if (remaining <= 0) {
        stopTest();
      }
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, startTime, duration, stopTest]);

  const handleStart = () => {
    wpmSamplesRef.current = [];
    lastLoggedSecondRef.current = -1;
    setLiveConsistency(100);
    setTimeLeft(duration);
    setElapsed(0);
    setStartTime(Date.now());
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleReset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    wpmSamplesRef.current = [];
    lastLoggedSecondRef.current = -1;
    setLiveConsistency(100);
    setStarted(false);
    setInput("");
    setTimeLeft(duration);
    setStartTime(null);
    setElapsed(0);
    onReset();
  };

  const wordsTyped = input.trim().split(/\s+/).filter(Boolean).length;
  const minutes = elapsed / 60;
  const liveWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
  const totalTyped = input.length;
  let correctCount = 0;
  for (let i = 0; i < Math.min(input.length, paragraphText.length); i++) {
    if (input[i] === paragraphText[i]) correctCount++;
  }
  const liveAccuracy =
    totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;
  const liveRawWpm =
    elapsed > 0 ? computeRawWpm(input.length, elapsed) : 0;

  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
  };

  return (
    <section className={`w-full relative ${started ? "pt-14" : ""}`}>
      {started && (
        <div
          className="fixed top-0 inset-x-0 z-50 border-b border-default-200/80 dark:border-default-100/60 bg-background/90 dark:bg-background/90 backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-3xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-baseline gap-2 tabular-nums">
              <span className="text-default-500 text-xs font-medium">Time</span>
              <span className="text-lg font-semibold text-foreground tracking-tight">
                {formatTimeLeft(timeLeft)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-default-600 tabular-nums">
                <span>
                  <span className="text-default-400 text-xs mr-1.5">WPM</span>
                  <span className="font-medium text-foreground">{liveWpm}</span>
                </span>
                <span>
                  <span className="text-default-400 text-xs mr-1.5">Raw</span>
                  <span className="font-medium text-foreground">{liveRawWpm}</span>
                </span>
                <span>
                  <span className="text-default-400 text-xs mr-1.5">Acc</span>
                  <span className="font-medium text-foreground">{liveAccuracy}%</span>
                </span>
                <span>
                  <span className="text-default-400 text-xs mr-1.5">Cons</span>
                  <span className="font-medium text-foreground">{liveConsistency}%</span>
                </span>
              </div>
              <Button
                size="sm"
                variant="light"
                className="text-default-500 min-w-0 h-8"
                onPress={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 mb-5">
        {!started ? (
        <div className="rounded-xl border border-default-200 dark:border-default-100 bg-default-50/40 dark:bg-default-50/10 p-4 sm:p-5">
          <p className="text-sm font-medium text-foreground mb-4">Test setup</p>

          {paragraphList.length === 0 ? (
            <p className="text-sm text-default-500">
              No paragraphs configured yet. Ask an admin to add some.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs text-default-500 mb-2">Difficulty</p>
                <div
                  className="flex flex-wrap gap-1.5"
                  role="tablist"
                  aria-label="Difficulty"
                >
                  {categoriesWithContent.map((cat) => {
                    const n = countByCategory.get(cat) ?? 0;
                    const selected = selectedCategory === cat;
                    return (
                      <Button
                        key={cat}
                        role="tab"
                        aria-selected={selected}
                        size="sm"
                        radius="md"
                        variant={selected ? "flat" : "light"}
                        color={selected ? "primary" : "default"}
                        className="font-normal min-w-0"
                        isDisabled={started}
                        onPress={() => {
                          if (started) return;
                          setSelectedCategory(cat);
                        }}
                      >
                        {PARAGRAPH_CATEGORY_LABELS[cat]}{" "}
                        <span className="text-default-400 tabular-nums text-xs">
                          {n}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-xs text-default-500 mb-2">Passage</p>
                {paragraphsInCategory.length === 0 ? (
                  <p className="text-sm text-default-500">
                    No paragraphs in this difficulty yet.
                  </p>
                ) : (
                  <div
                    className="flex flex-wrap gap-1.5"
                    role="tablist"
                    aria-label="Passages"
                  >
                    {paragraphsInCategory.map((p) => {
                      const selected = currentParagraph?.id === p.id;
                      return (
                        <Button
                          key={p.id}
                          role="tab"
                          aria-selected={selected}
                          size="sm"
                          radius="md"
                          variant={selected ? "flat" : "light"}
                          color={selected ? "primary" : "default"}
                          className="font-normal min-w-0 max-w-full h-auto py-1.5"
                          isDisabled={started}
                          onPress={() => {
                            if (started) return;
                            setSelectedParagraphId(p.id);
                          }}
                        >
                          <span className="truncate max-w-[min(280px,82vw)] block text-left">
                            {p.title || "Paragraph"}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-1 border-t border-default-200/60 dark:border-default-100/40">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-default-500 mb-2">Duration</p>
                  <div
                    className="flex flex-wrap gap-1.5"
                    role="tablist"
                    aria-label="Test duration"
                  >
                    {TIME_PRESET_SECONDS.map((sec) => {
                      const selected = duration === sec;
                      return (
                        <Button
                          key={String(sec)}
                          role="tab"
                          aria-selected={selected}
                          size="sm"
                          radius="md"
                          variant={selected ? "flat" : "light"}
                          color={selected ? "primary" : "default"}
                          className="font-normal tabular-nums"
                          isDisabled={started}
                          onPress={() => {
                            if (started) return;
                            setDuration(sec);
                          }}
                        >
                          {sec}s
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div className="w-full sm:w-28 shrink-0">
                  <label
                    htmlFor="typing-duration-seconds"
                    className="text-xs text-default-500 mb-2 block"
                  >
                    Custom (sec)
                  </label>
                  <input
                    id="typing-duration-seconds"
                    type="number"
                    min={1}
                    max={3600}
                    step={1}
                    value={duration}
                    onChange={(e) => {
                      if (started) return;
                      const v = Number(e.target.value);
                      if (!Number.isFinite(v)) return;
                      const clamped = Math.max(1, Math.min(3600, Math.round(v)));
                      setDuration(clamped);
                    }}
                    disabled={started}
                    className="w-full px-3 py-2 rounded-lg border border-default-200 dark:border-default-100 bg-background text-foreground text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary disabled:opacity-50"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        ) : null}
      </div>

      <div
        className="p-4 sm:p-5 rounded-xl bg-default-50/60 dark:bg-default-50/10 text-default-800 dark:text-default-500 mb-3 min-h-[120px] leading-relaxed border border-default-200 dark:border-default-100"
        aria-hidden="true"
      >
        {paragraphText.split("").map((char: string, i: number) => {
          const typed = input[i];
          const isCorrect = typed !== undefined ? typed === char : null;
          return (
            <span
              key={i}
              className={
                isCorrect === true
                  ? "text-success-600 dark:text-success-500"
                  : isCorrect === false
                    ? "text-danger-600 dark:text-danger-500 underline"
                    : ""
              }
            >
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        ref={inputRef}
        aria-label="Typing input"
        className="w-full min-h-[140px] p-4 sm:p-5 rounded-xl border border-default-200 dark:border-default-100 bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow font-mono text-[15px] sm:text-base leading-relaxed"
        placeholder="Press Space to start, then type here…"
        value={input}
        onChange={(e) => {
          if (!started) return;
          setInput(e.target.value);
        }}
        onPaste={(e) => {
          if (!started) e.preventDefault();
        }}
        onKeyDown={(e) => {
          if (started) return;
          if (e.key === " " || e.code === "Space") {
            e.preventDefault();
            if (e.repeat) return;
            handleStart();
            return;
          }
          if (e.key === "Tab") return;
          e.preventDefault();
        }}
        spellCheck={false}
      />

      {!started && (
        <p className="mt-3 text-xs text-default-400">
          Click the typing area, then press Space to start the timer and begin.
        </p>
      )}
    </section>
  );
}
