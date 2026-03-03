"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import type { TypingStats } from "./typing-test-section";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: TypingStats | null;
  isLoggedIn?: boolean;
  onSaveScore?: (stats: TypingStats) => Promise<void>;
}

export function ResultModal({
  isOpen,
  onClose,
  stats,
  isLoggedIn = false,
  onSaveScore,
}: ResultModalProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!stats || !onSaveScore || saving || saved) return;
    setSaving(true);
    try {
      await onSaveScore(stats);
      setSaved(true);
    } catch {
      // Error could be shown via toast
    } finally {
      setSaving(false);
    }
  };

  if (!stats) return null;

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
          Test complete
        </ModalHeader>
        <ModalBody className="gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-500/10">
              <p className="text-sm text-default-500">WPM</p>
              <p className="text-2xl font-bold text-primary">{stats.wpm}</p>
            </div>
            <div className="p-4 rounded-lg bg-default-100">
              <p className="text-sm text-default-500">Accuracy</p>
              <p className="text-2xl font-bold">{stats.accuracy}%</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span>
              Correct: <strong className="text-success-600">{stats.correctChars}</strong>
            </span>
            <span>
              Wrong: <strong className="text-danger-600">{stats.wrongChars}</strong>
            </span>
            <span className="text-default-500">
              Total: {stats.totalChars} chars
            </span>
          </div>
        </ModalBody>
        <ModalFooter>
          {isLoggedIn && onSaveScore && (
            <Button
              color="primary"
              variant="flat"
              onPress={handleSave}
              isDisabled={saving || saved}
              startContent={saving ? <Spinner size="sm" /> : null}
            >
              {saved ? "Saved!" : saving ? "Saving…" : "Save score"}
            </Button>
          )}
          <Button color="primary" onPress={onClose}>
            Try again
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
