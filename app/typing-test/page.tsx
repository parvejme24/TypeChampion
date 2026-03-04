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
    <div className="flex flex-col flex-1">
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
