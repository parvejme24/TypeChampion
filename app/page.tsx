"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { HeroSection } from "@/components/hero-section";
import { TypingTestSection, type TypingStats } from "@/components/typing-test-section";
import { ResultModal } from "@/components/result-modal";
import { saveScoreApi } from "@/lib/api/leaderboard";

export default function HomePage() {
  const { status } = useSession();
  const queryClient = useQueryClient();
  const [showTest, setShowTest] = useState(false);
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
    });
    queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
  }, [queryClient]);

  const handleStartTyping = useCallback(() => {
    setShowTest(true);
    setResultStats(null);
    setResultModalOpen(false);
    setTestKey((k) => k + 1);
  }, []);

  const handleTestComplete = useCallback((stats: TypingStats) => {
    setResultStats(stats);
    setResultModalOpen(true);
  }, []);

  const handleTestReset = useCallback(() => {
    setResultModalOpen(false);
    setResultStats(null);
    setShowTest(false);
  }, []);

  const handleModalClose = useCallback(() => {
    setResultModalOpen(false);
    setResultStats(null);
    setShowTest(false);
  }, []);

  const handleTryAgain = useCallback(() => {
    setResultModalOpen(false);
    setResultStats(null);
    setTestKey((k) => k + 1);
    setShowTest(true);
  }, []);

  return (
    <div className="flex flex-col flex-1">
      {!showTest ? (
        <HeroSection onStartTyping={handleStartTyping} />
      ) : (
        <TypingTestSection
          key={testKey}
          onComplete={handleTestComplete}
          onReset={handleTestReset}
        />
      )}

      <ResultModal
        isOpen={resultModalOpen}
        onClose={handleTryAgain}
        stats={resultStats}
        isLoggedIn={status === "authenticated"}
        onSaveScore={handleSaveScore}
      />
    </div>
  );
}
