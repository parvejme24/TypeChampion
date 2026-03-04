"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { useQuery } from "@tanstack/react-query";
import { fetchParagraphsApi, type ApiParagraph } from "@/lib/api/paragraphs";

export interface TypingStats {
  wpm: number;
  accuracy: number;
  correctChars: number;
  wrongChars: number;
  totalChars: number;
  durationSeconds?: number;
}

interface TypingTestSectionProps {
  onComplete: (stats: TypingStats) => void;
  onReset: () => void;
}

function computeStats(
  paragraph: string,
  typed: string,
  elapsedSeconds: number,
): TypingStats {
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
  const totalTyped = correctChars + wrongChars;
  const accuracy =
    totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
  return {
    wpm,
    accuracy,
    correctChars,
    wrongChars,
    totalChars,
  };
}

export function TypingTestSection({ onComplete, onReset }: TypingTestSectionProps) {
  const { data: paragraphs } = useQuery({
    queryKey: ["paragraphs"],
    queryFn: fetchParagraphsApi,
  });
  const paragraphList = (paragraphs ?? []) as ApiParagraph[];
  const [selectedParagraphId, setSelectedParagraphId] = useState<string | null>(
    null,
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

  const currentParagraph: ApiParagraph | null =
    paragraphList.find((p) => p.id === selectedParagraphId) ??
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
    const stats = computeStats(paragraphText, inputValueRef.current, elapsedSec);
    onComplete({ ...stats, durationSeconds: duration });
  }, [paragraphText, startTime, duration, onComplete]);

  useEffect(() => {
    if (!started || startTime == null) return;
    intervalRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTime) / 1000;
      setElapsed(Math.floor(elapsedSec));
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

  return (
    <section className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-default-500 uppercase tracking-wider mb-1">
              Paragraph
            </label>
            {paragraphList.length === 0 ? (
              <p className="text-sm text-default-500">
                No paragraphs configured yet. Ask an admin to add some.
              </p>
            ) : (
              <Tabs
                selectedKey={currentParagraph?.id}
                onSelectionChange={(key) =>
                  !started && setSelectedParagraphId(String(key))
                }
                variant="underlined"
                classNames={{
                  tabList: "w-full overflow-x-auto",
                  tab: "whitespace-nowrap",
                }}
              >
                {paragraphList.map((p) => (
                  <Tab key={p.id} title={p.title || "Paragraph"} />
                ))}
              </Tabs>
            )}
          </div>
          <div className="w-full md:w-56">
            <label className="block text-xs font-medium text-default-500 uppercase tracking-wider mb-1">
              Time
            </label>
            <Tabs
              selectedKey={
                duration === 60
                  ? "1"
                  : duration === 120
                    ? "2"
                    : duration === 300
                      ? "5"
                      : duration === 600
                        ? "10"
                        : "custom"
              }
              onSelectionChange={(key) => {
                if (started) return;
                const k = String(key);
                if (k === "1") setDuration(60);
                else if (k === "2") setDuration(120);
                else if (k === "5") setDuration(300);
                else if (k === "10") setDuration(600);
              }}
              variant="underlined"
              classNames={{ tabList: "gap-2" }}
            >
              <Tab key="1" title="1 min" />
              <Tab key="2" title="2 min" />
              <Tab key="5" title="5 min" />
              <Tab key="10" title="10 min" />
              <Tab
                key="custom"
                title={
                  <span className="flex items-center gap-1">
                    Custom
                    <span className="text-xs text-default-400">
                      ({Math.round(duration / 60)}m)
                    </span>
                  </span>
                }
              />
            </Tabs>
            <div className="mt-2">
              <input
                type="number"
                min={0.5}
                max={60}
                step={0.5}
                value={Number((duration / 60).toFixed(1))}
                onChange={(e) => {
                  if (started) return;
                  const v = Number(e.target.value);
                  if (!Number.isFinite(v)) return;
                  const clamped = Math.max(0.5, Math.min(60, v));
                  setDuration(Math.round(clamped * 60));
                }}
                className="w-full px-3 py-2 rounded-lg border border-default-200 dark:border-default-100 bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
        {started && (
          <div className="flex justify-end">
            <Button size="sm" variant="flat" color="default" onPress={handleReset}>
              Reset
            </Button>
          </div>
        )}
      </div>

      <div
        className="p-4 rounded-lg bg-default-100 dark:bg-default-50/50 text-default-700 dark:text-default-600 mb-4 min-h-[120px] leading-relaxed"
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
        className="w-full min-h-[120px] p-4 rounded-lg border-2 border-default-200 dark:border-default-100 bg-background text-foreground resize-none focus:outline-none focus:border-primary transition-colors font-mono text-base leading-relaxed"
        placeholder="Start typing here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (!started && e.key === " ") {
            handleStart();
          }
        }}
        spellCheck={false}
      />

      {started && (
        <div className="flex flex-wrap gap-6 mt-4 text-sm">
          <span className="text-default-600">
            Time left: <strong className="text-foreground">{timeLeft}s</strong>
          </span>
          <span className="text-default-600">
            WPM: <strong className="text-foreground">{liveWpm}</strong>
          </span>
          <span className="text-default-600">
            Accuracy: <strong className="text-foreground">{liveAccuracy}%</strong>
          </span>
        </div>
      )}
    </section>
  );
}
