"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NextLink from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Tabs, Tab } from "@heroui/tabs";
import {
  fetchLeaderboardApi,
  type LeaderboardEntry,
} from "@/lib/api/leaderboard";
import { motion } from "framer-motion";

type TimeFilter = "all" | "today" | "weekly";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: "short",
  });
}

function RankBadge({ rank }: { rank: number }) {
  if (rank > 3) {
    return (
      <span className="text-default-400 font-semibold tabular-nums w-8 text-center">
        #{rank}
      </span>
    );
  }
  const medals = ["🥇", "🥈", "🥉"];
  const colors = ["warning", "default", "secondary"] as const;
  return (
    <Chip
      size="sm"
      variant="flat"
      color={colors[rank - 1]}
      className="min-w-10 justify-center"
    >
      {medals[rank - 1]} #{rank}
    </Chip>
  );
}

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const {
    data: scores,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leaderboard", timeFilter],
    queryFn: () => fetchLeaderboardApi(50, timeFilter),
  });

  const list = scores ?? [];

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Leaderboard Header */}
      <section className="bg-gradient-to-b from-primary-100/50 to-transparent dark:from-primary-500/10 dark:to-transparent border-b border-default-200 dark:border-default-100">
        <div className="max-w-4xl mx-auto px-4 py-10 text-center flex flex-col items-center gap-4">
          <img
            src="/leaderboard.png"
            alt="Leaderboard icon"
            className="w-16 h-16 md:w-20 md:h-20"
            draggable={false}
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Global Typing Leaderboard
            </h1>
            <p className="text-default-500 text-lg">
              Top typists by best WPM. Take a test and save your score to appear
              here.
            </p>
          </div>
          <Button
            as={NextLink}
            href="/typing-test"
            color="primary"
            variant="flat"
            size="lg"
            className="mt-4 font-medium"
          >
            Take a typing test
          </Button>
        </div>
      </section>

      {/* Filters + Table */}
      <div className="container mx-auto w-full py-10">
        <Card className="border border-default-200 dark:border-default-100 overflow-hidden">
          <CardBody className="p-0">
            {/* Time-based filters */}
            <div className="border-b border-default-200 dark:border-default-100 px-4 pt-4 pb-0 bg-default-100/60 dark:bg-default-50/10">
              <p className="text-xs font-medium text-default-500 uppercase tracking-wider mb-3">
                Time period
              </p>
              <Tabs
                selectedKey={timeFilter}
                onSelectionChange={(k) =>
                  setTimeFilter((k as TimeFilter) ?? "all")
                }
                variant="underlined"
                classNames={{ tabList: "gap-4" }}
              >
                <Tab key="all" title="All time" />
                <Tab key="weekly" title="Weekly" />
                <Tab key="today" title="Today" />
              </Tabs>
            </div>

            {isLoading && !scores ? (
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4 py-16 px-4 text-center">
                <p className="text-danger">
                  {error instanceof Error
                    ? error.message
                    : "Failed to load leaderboard"}
                </p>
                <p className="text-sm text-default-500">
                  The database may be disconnected. Check the footer status.
                </p>
                <Button variant="flat" onPress={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center gap-6 py-16 px-4 text-center">
                <div className="rounded-full bg-default-100 dark:bg-default-50 p-6">
                  <span className="text-4xl">🏆</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    No scores yet
                  </h2>
                  <p className="text-default-500 max-w-sm">
                    {timeFilter === "all"
                      ? "Be the first to appear on the leaderboard. Complete a typing test, sign in, and save your score."
                      : timeFilter === "today"
                        ? "No scores saved today yet. Complete a test and save your score to appear here."
                        : "No scores in the last 7 days. Complete a test and save your score to appear here."}
                  </p>
                </div>
                <Button as={NextLink} href="/typing-test" color="primary" size="lg">
                  Start typing test
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-default-200 dark:border-default-100 bg-default-50/50 dark:bg-default-100/5">
                      <th className="text-left py-4 px-4 font-semibold text-foreground w-24">
                        Rank
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground">
                        User
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-foreground w-28">
                        Best WPM
                      </th>
                      <th className="text-right py-4 px-4 font-semibold text-foreground w-24">
                        Accuracy
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((entry: LeaderboardEntry, index: number) => (
                      <motion.tr
                        key={`${entry.userEmail}-${entry.id}`}
                        className="border-b border-default-100 dark:border-default-50 hover:bg-default-50/50 dark:hover:bg-default-100/5 transition-colors"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <td className="py-4 px-4">
                          <RankBadge rank={index + 1} />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={entry.userName || entry.userEmail}
                              size="sm"
                              className="flex-shrink-0"
                              showFallback
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {entry.userName || "Anonymous"}
                              </p>
                              <p className="text-xs text-default-400 truncate max-w-[180px]">
                                {entry.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-primary text-lg tabular-nums">
                            {entry.wpm}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Chip size="sm" variant="flat" color="success">
                            {entry.accuracy}%
                          </Chip>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>

        {list.length > 0 && (
          <p className="text-center text-sm text-default-400 mt-6">
            Best score per user. Sorted by WPM. Top {list.length} for{" "}
            {timeFilter === "today"
              ? "today"
              : timeFilter === "weekly"
                ? "the past 7 days"
                : "all time"}
            .
          </p>
        )}
      </div>
    </div>
  );
}
