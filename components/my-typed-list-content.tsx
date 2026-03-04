"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import NextLink from "next/link";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";
import { fetchMyPracticeApi, type PracticeEntry } from "@/lib/api/leaderboard";
import { CertificateView } from "@/components/certificate-view";
import type { TypingStats } from "@/components/typing-test-section";

function groupByParagraph(entries: PracticeEntry[]) {
  const map = new Map<
    string,
    {
      title: string;
      practices: PracticeEntry[];
      bestWpm: number;
      bestAccuracy: number;
    }
  >();
  for (const p of entries) {
    const key = p.paragraphTitle ?? `Paragraph #${p.paragraphId ?? "?"}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        title: key,
        practices: [p],
        bestWpm: p.wpm,
        bestAccuracy: p.accuracy,
      });
    } else {
      existing.practices.push(p);
      existing.bestWpm = Math.max(existing.bestWpm, p.wpm);
      existing.bestAccuracy = Math.max(existing.bestAccuracy, p.accuracy);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.practices[0]?.createdAt ?? 0).getTime() -
      new Date(a.practices[0]?.createdAt ?? 0).getTime(),
  );
}

function entryToStats(p: PracticeEntry): TypingStats {
  return {
    wpm: p.wpm,
    accuracy: p.accuracy,
    correctChars: p.correctChars,
    wrongChars: p.wrongChars,
    totalChars: p.totalChars,
    durationSeconds: p.durationSeconds,
    paragraphId: p.paragraphId,
    paragraphTitle: p.paragraphTitle ?? undefined,
    paragraphText: p.paragraphText ?? undefined,
    typedText: p.typedText ?? undefined,
  };
}

export function MyTypedListContent() {
  const { data: session } = useSession();
  const [certificateEntry, setCertificateEntry] =
    useState<PracticeEntry | null>(null);

  const {
    data: list,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-practice"],
    queryFn: fetchMyPracticeApi,
  });

  if (isLoading) {
    return (
      <div className="container  mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Typed List</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="rounded-xl h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container  mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Typed List</h1>
        <p className="text-danger-500">Failed to load your typed list.</p>
      </div>
    );
  }

  const grouped = groupByParagraph(list ?? []);
  const userName = session?.user?.name ?? session?.user?.email ?? "User";
  const userEmail = session?.user?.email ?? "";

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Typed List</h1>
      </div>
      <p className="text-default-500 text-sm mb-6">
        Paragraphs you have typed. Each attempt is saved automatically. Use{" "}
        <strong>View certificate</strong> to download your certificate for that
        attempt.
      </p>

      {grouped.length === 0 ? (
        <Card className="border border-dashed border-default-300">
          <CardBody className="text-center py-12">
            <p className="text-default-500">No typed list yet.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <Card key={group.title} className="border border-default-200">
              <CardHeader className="flex flex-col gap-2 pb-2">
                <p className="text-xs font-medium text-default-500 uppercase tracking-wider">
                  Paragraph you typed
                </p>
                <h2 className="text-xl font-semibold text-foreground">
                  {group.title}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="flat" color="primary">
                    Best WPM: {group.bestWpm}
                  </Chip>
                  <Chip size="sm" variant="flat" color="secondary">
                    Best accuracy: {group.bestAccuracy}%
                  </Chip>
                  <Chip size="sm" variant="flat">
                    {group.practices.length} attempt
                    {group.practices.length !== 1 ? "s" : ""}
                  </Chip>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <ul className="space-y-3">
                  {group.practices.map((p) => (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-default-100 last:border-0"
                    >
                      <span className="text-sm text-default-600">
                        {new Date(p.createdAt).toLocaleString()} — WPM:{" "}
                        <strong className="text-foreground">{p.wpm}</strong>,
                        Accuracy:{" "}
                        <strong className="text-foreground">
                          {p.accuracy}%
                        </strong>
                        {p.durationSeconds != null && (
                          <span className="text-default-500">
                            {" "}
                            ({p.durationSeconds / 60} min)
                          </span>
                        )}
                      </span>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => setCertificateEntry(p)}
                      >
                        View certificate
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!certificateEntry}
        onOpenChange={(open: boolean) => {
          if (!open) setCertificateEntry(null);
        }}
        placement="center"
        size="full"
        classNames={{ base: "max-w-[210mm]", wrapper: "items-start pt-8" }}
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center">
            <span>Certificate</span>
            <Button
              size="sm"
              variant="flat"
              onPress={() => setCertificateEntry(null)}
            >
              Close
            </Button>
          </ModalHeader>
          <ModalBody className="overflow-y-auto max-h-[calc(100vh-120px)]">
            {certificateEntry && (
              <CertificateView
                userName={userName}
                userEmail={userEmail}
                stats={entryToStats(certificateEntry)}
                onPrint={() => setCertificateEntry(null)}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
