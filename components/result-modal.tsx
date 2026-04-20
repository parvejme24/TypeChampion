"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { CertificateView } from "@/components/certificate-view";
import type { TypingStats } from "./typing-test-section";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TypingStats | null;
  isLoggedIn?: boolean;
  userName?: string | null;
  userEmail?: string | null;
  onSaveScore?: (stats: TypingStats) => Promise<void>;
}

function formatDurationLabel(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = seconds / 60;
  return Number.isInteger(minutes)
    ? `${minutes} min`
    : `${minutes.toFixed(1)} min`;
}

export function ResultModal({
  isOpen,
  onClose,
  stats,
  isLoggedIn = false,
  userName,
  userEmail,
  onSaveScore,
}: ResultModalProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Auto-save when logged in and modal opens
  useEffect(() => {
    if (!isOpen || !isLoggedIn || !stats || !onSaveScore || saved || saving) return;
    let cancelled = false;
    setSaving(true);
    onSaveScore(stats)
      .then(() => {
        if (!cancelled) setSaved(true);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[ResultModal] Save score failed", err);
          toast.error("Could not save score. It will not appear in My Typed List.");
        }
      })
      .finally(() => {
        if (!cancelled) setSaving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, isLoggedIn, stats, onSaveScore, saved, saving]);

  if (!stats) return null;

  const displayName = userName?.trim() || "User";
  const displayEmail = userEmail?.trim() || "";

  if (showCertificate) {
    return (
      <Modal
        isOpen
        onOpenChange={(open: boolean) => {
          if (!open) setShowCertificate(false);
        }}
        placement="center"
        size="full"
        classNames={{ base: "max-w-[210mm]", wrapper: "items-start pt-8" }}
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center">
            <span>Certificate</span>
            <Button size="sm" variant="flat" onPress={() => setShowCertificate(false)}>
              Close
            </Button>
          </ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[calc(100vh-120px)]">
            <CertificateView
              userName={displayName}
              userEmail={displayEmail}
              stats={stats}
              onPrint={() => setShowCertificate(false)}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
      onClose={onClose}
      placement="center"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <span className="text-xl font-semibold">Typing Result</span>
          <p className="text-sm font-normal text-default-500">
            {stats.paragraphTitle ? `Paragraph: ${stats.paragraphTitle}` : "Test complete"}
          </p>
        </ModalHeader>
        <ModalBody className="gap-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[120px] p-5 rounded-xl bg-primary-50 dark:bg-primary-500/15 border border-primary-200 dark:border-primary-500/30">
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider">WPM</p>
              <p className="text-3xl font-bold text-primary mt-1">{stats.wpm}</p>
            </div>
            <div className="flex-1 min-w-[120px] p-5 rounded-xl bg-default-100 dark:bg-default-50/50 border border-default-200">
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider">Accuracy</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.accuracy}%</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-default-600">
            <span>
              Correct: <strong className="text-success-600 dark:text-success-500">{stats.correctChars}</strong>
            </span>
            <span>
              Wrong: <strong className="text-danger-600 dark:text-danger-500">{stats.wrongChars}</strong>
            </span>
            <span>
              Total: <strong className="text-foreground">{stats.totalChars}</strong> chars
            </span>
            {stats.durationSeconds != null && (
              <span>
                Duration:{" "}
                <strong className="text-foreground">
                  {formatDurationLabel(stats.durationSeconds)}
                </strong>
              </span>
            )}
          </div>
          {isLoggedIn && (saved || saving) && (
            <p className="text-sm text-success-600 dark:text-success-500">
              {saving ? "Saving…" : "Score saved automatically. Use the button below to download your certificate."}
            </p>
          )}
          {!isLoggedIn && (
            <p className="text-sm text-warning-600 dark:text-warning-500">
              Sign in to save this result to <strong>My Typed List</strong> and view it later.
            </p>
          )}
        </ModalBody>
        <ModalFooter className="flex-wrap gap-2">
          <Button
            color="primary"
            variant="flat"
            onPress={() => setShowCertificate(true)}
          >
            View / Download Certificate
          </Button>
          <Button color="primary" onPress={onClose}>
            Try again
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
