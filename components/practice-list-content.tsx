"use client";

import { useQuery } from "@tanstack/react-query";
import NextLink from "next/link";
import { fetchMyPracticeApi, type PracticeEntry } from "@/lib/api/leaderboard";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import { Chip } from "@heroui/chip";

function groupByParagraph(entries: PracticeEntry[]) {
  const map = new Map<
    string,
    { title: string; practices: PracticeEntry[]; bestWpm: number; bestAccuracy: number }
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
      new Date(a.practices[0]?.createdAt ?? 0).getTime()
  );
}

export function PracticeListContent() {
  const { data: list, isLoading, error } = useQuery({
    queryKey: ["my-practice"],
    queryFn: fetchMyPracticeApi,
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Practice</h1>
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
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Practice</h1>
        <p className="text-danger-500">Failed to load practice history.</p>
      </div>
    );
  }

  const grouped = groupByParagraph(list ?? []);

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">My Practice</h1>
        <Button as={NextLink} href="/typing-test" color="primary" size="sm">
          Take a typing test
        </Button>
      </div>
      <p className="text-default-500 text-sm mb-6">
        Your practice progress per paragraph. Scores are saved automatically when you are logged in.
      </p>

      {grouped.length === 0 ? (
        <Card className="border border-dashed border-default-300">
          <CardBody className="text-center py-12">
            <p className="text-default-500 mb-4">No practice history yet.</p>
            <Button as={NextLink} href="/typing-test" color="primary">
              Start typing test
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <Card key={group.title} className="border border-default-200">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2">
                <h2 className="text-lg font-semibold truncate">{group.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <Chip size="sm" variant="flat" color="primary">
                    Best WPM: {group.bestWpm}
                  </Chip>
                  <Chip size="sm" variant="flat" color="secondary">
                    Best accuracy: {group.bestAccuracy}%
                  </Chip>
                  <Chip size="sm" variant="flat">
                    {group.practices.length} practice{group.practices.length !== 1 ? "s" : ""}
                  </Chip>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <ul className="space-y-1 text-sm text-default-600">
                  {group.practices.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex flex-wrap gap-4">
                      <span>
                        {new Date(p.createdAt).toLocaleString()} — WPM:{" "}
                        <strong className="text-foreground">{p.wpm}</strong>, Accuracy:{" "}
                        <strong className="text-foreground">{p.accuracy}%</strong>
                        {p.durationSeconds != null && (
                          <> ({p.durationSeconds / 60} min)</>
                        )}
                      </span>
                    </li>
                  ))}
                  {group.practices.length > 5 && (
                    <li className="text-default-500">
                      +{group.practices.length - 5} more
                    </li>
                  )}
                </ul>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
