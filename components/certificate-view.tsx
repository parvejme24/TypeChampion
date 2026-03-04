"use client";

import { useRef } from "react";
import type { TypingStats } from "./typing-test-section";

const APP_NAME = "TypeChampion";

interface CertificateViewProps {
  userName: string;
  userEmail: string;
  stats: TypingStats;
  onPrint?: () => void;
}

/** Renders paragraph text with mistakes highlighted (correct=green, wrong=red underline) */
function ParagraphWithMistakes({
  paragraphText,
  typedText,
}: {
  paragraphText: string;
  typedText: string;
}) {
  type Segment = { char: string; isTyped: boolean; isCorrect: boolean };
  const segments: Segment[] = [];

  const maxLen = Math.max(paragraphText.length, typedText.length);
  for (let i = 0; i < maxLen; i++) {
    const expected = paragraphText[i] ?? "";
    const actual = typedText[i];

    // Extra characters typed beyond the paragraph
    if (!expected && actual !== undefined) {
      segments.push({
        char: actual,
        isTyped: true,
        isCorrect: false,
      });
      continue;
    }

    if (!expected) continue;

    const isTyped = actual !== undefined;
    const isCorrect = isTyped && actual === expected;

    segments.push({
      char: expected,
      isTyped,
      isCorrect,
    });
  }

  return (
    <div className="text-left text-sm leading-relaxed break-words">
      {segments.map((seg, i) => {
        const baseChar = seg.char === " " ? "\u00A0" : seg.char;
        let cls = "";
        if (seg.isTyped && seg.isCorrect) {
          cls = "text-emerald-600 font-bold";
        } else if (seg.isTyped && !seg.isCorrect) {
          cls = "text-red-600 underline decoration-red-600 font-bold";
        }
        return (
          <span key={i} className={cls}>
            {baseChar}
          </span>
        );
      })}
    </div>
  );
}

export function CertificateView({
  userName,
  userEmail,
  stats,
  onPrint,
}: CertificateViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const paragraphText = stats.paragraphText ?? "";
  const typedText = stats.typedText ?? "";
  const durationMin = stats.durationSeconds
    ? (stats.durationSeconds / 60).toFixed(1)
    : "—";

  return (
    <div className="flex flex-col items-center w-full">
      <button
        type="button"
        onClick={() => {
          onPrint?.();
          window.print();
        }}
        className="mb-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium print:hidden"
      >
        Download certificate (PDF)
      </button>
      <div
        ref={printRef}
        className="certificate-print bg-white text-black w-[210mm] min-h-[297mm] p-8 box-border shadow-lg print:shadow-none print:p-12"
        style={{ aspectRatio: "210/297" }}
      >
        <div className="flex flex-col h-full">
          <header className="border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-sm text-gray-600 mt-1">Typing Test Certificate</p>
          </header>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{userName}</p>
            </div>
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium break-all">{userEmail}</p>
            </div>
          </div>

          {stats.paragraphTitle && (
            <div className="mb-2">
              <p className="text-gray-500 text-sm">Paragraph</p>
              <p className="font-medium">{stats.paragraphTitle}</p>
            </div>
          )}

          <div className="flex gap-8 mb-4 flex-wrap">
            <div>
              <p className="text-gray-500 text-xs">WPM</p>
              <p className="text-2xl font-bold">{stats.wpm}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Accuracy</p>
              <p className="text-2xl font-bold">{stats.accuracy}%</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Duration</p>
              <p className="text-xl font-semibold">{durationMin} min</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Correct / Wrong / Total</p>
              <p className="text-lg font-semibold">
                {stats.correctChars} / {stats.wrongChars} / {stats.totalChars} chars
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-gray-500 text-xs mb-2">Text with mistakes highlighted (red = error)</p>
            <div className="rounded border border-gray-300 p-3 bg-gray-50 min-h-[120px] max-h-[280px] overflow-y-auto">
              <ParagraphWithMistakes
                paragraphText={paragraphText}
                typedText={typedText}
              />
            </div>
          </div>

          <footer className="mt-auto pt-8 border-t border-gray-200 text-center text-xs text-gray-500">
            {APP_NAME} — {new Date().toLocaleDateString()}
          </footer>
        </div>
      </div>
    </div>
  );
}
