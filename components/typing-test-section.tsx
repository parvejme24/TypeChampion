"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { getRandomParagraph } from "@/lib/paragraphs";

const TIME_OPTIONS = [30, 60] as const;

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
  const [paragraph] = useState(() => getRandomParagraph());
  const [duration, setDuration] = useState<number>(30);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputValueRef = useRef(input);
  inputValueRef.current = input;

  const stopTest = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setStarted(false);
    const elapsedSec = startTime != null ? (Date.now() - startTime) / 1000 : 0;
    const stats = computeStats(paragraph, inputValueRef.current, elapsedSec);
    onComplete({ ...stats, durationSeconds: duration });
  }, [paragraph, startTime, duration, onComplete]);

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
    setInput("");
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
  for (let i = 0; i < Math.min(input.length, paragraph.length); i++) {
    if (input[i] === paragraph[i]) correctCount++;
  }
  const liveAccuracy =
    totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;

  return (
    <section className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex gap-4">
          {TIME_OPTIONS.map((sec) => (
            <Button
              key={sec}
              size="sm"
              variant={duration === sec ? "solid" : "bordered"}
              color="primary"
              onPress={() => !started && setDuration(sec)}
              isDisabled={started}
            >
              {sec}s
            </Button>
          ))}
        </div>
        {started && (
          <Button size="sm" variant="flat" color="default" onPress={handleReset}>
            Reset
          </Button>
        )}
      </div>

      <div
        className="p-4 rounded-lg bg-default-100 dark:bg-default-50/50 text-default-700 dark:text-default-600 mb-4 min-h-[120px] leading-relaxed"
        aria-hidden="true"
      >
        {paragraph.split("").map((char, i) => {
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
          if (!started && e.key !== "Tab") {
            handleStart();
          }
        }}
        disabled={!started}
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
