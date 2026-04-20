"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { TypingTestSection, type TypingStats } from "@/components/typing-test-section";
import { ResultModal } from "@/components/result-modal";
import { saveScoreApi } from "@/lib/api/leaderboard";

export default function TypingTestPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const [resultStats, setResultStats] = useState<TypingStats | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [testKey, setTestKey] = useState(0);

  const handleSaveScore = useCallback(async (stats: TypingStats) => {
    await saveScoreApi({
      wpm: stats.wpm,
      rawWpm: stats.rawWpm,
      consistency: stats.consistency,
      accuracy: stats.accuracy,
      correctChars: stats.correctChars,
      wrongChars: stats.wrongChars,
      totalChars: stats.totalChars,
      durationSeconds: stats.durationSeconds,
      paragraphId: stats.paragraphId,
      paragraphTitle: stats.paragraphTitle,
      paragraphText: stats.paragraphText,
      typedText: stats.typedText,
    });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    queryClient.invalidateQueries({ queryKey: ["my-practice"] });
  }, [queryClient]);

  const handleTestComplete = useCallback((stats: TypingStats) => {
    setResultStats(stats);
    setResultModalOpen(true);
  }, []);

  const handleTestReset = useCallback(() => {
    setResultModalOpen(false);
    setResultStats(null);
    setTestKey((k) => k + 1);
  }, []);

  const handleTryAgain = useCallback(() => {
    setResultModalOpen(false);
    setResultStats(null);
    setTestKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
          Typing test
        </h1>
        <p className="mt-2 text-default-500 text-sm leading-relaxed">
          Choose a passage and time, then press{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-default-200 bg-default-100 text-default-700 text-xs font-sans">
            Space
          </kbd>{" "}
          to start. Results save when you are signed in.
        </p>
      </header>

      <TypingTestSection
        key={testKey}
        onComplete={handleTestComplete}
        onReset={handleTestReset}
      />

      <ResultModal
        isOpen={resultModalOpen}
        onClose={handleTryAgain}
        stats={resultStats}
        isLoggedIn={status === "authenticated"}
        userName={session?.user?.name ?? null}
        userEmail={session?.user?.email ?? null}
        onSaveScore={handleSaveScore}
      />
    </div>
  );
}
