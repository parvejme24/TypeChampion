"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { fetchParagraphsApi, createParagraphApi, type ApiParagraph } from "@/lib/api/paragraphs";

const paragraphKeys = {
  all: ["paragraphs"] as const,
};

export default function AdminParagraphsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const { data: paragraphs, isLoading, error } = useQuery({
    queryKey: paragraphKeys.all,
    queryFn: fetchParagraphsApi,
    enabled: status === "authenticated",
  });

  const createParagraph = useMutation({
    mutationFn: ({ title, text }: { title: string; text: string }) =>
      createParagraphApi({ title, text }),
    onSuccess: () => {
      setTitle("");
      setText("");
      queryClient.invalidateQueries({ queryKey: paragraphKeys.all });
    },
  });

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  const role = (session?.user as { dbUser?: { role?: string } })?.dbUser?.role;
  const isAdminUser = role === "admin";

  if (!isAdminUser) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-danger">Forbidden. Admin access required.</p>
        <Button variant="flat" onPress={() => router.push("/")}>
          Back to home
        </Button>
      </div>
    );
  }

  const list = paragraphs ?? [];

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-8 px-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
          <h1 className="text-2xl font-semibold">Paragraphs</h1>
          <p className="text-sm text-default-500">
            Create and manage typing paragraphs used in the test.
          </p>
        </CardHeader>
        <CardBody className="px-6 pb-6 pt-2 space-y-4">
          <div className="grid gap-3">
            <Input
              label="Title"
              labelPlacement="outside"
              placeholder="e.g. Warm-up paragraph"
              size="sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="Text"
              labelPlacement="outside"
              minRows={4}
              placeholder="Enter the paragraph text the user will type..."
              size="sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                color="primary"
                size="sm"
                isDisabled={!title.trim() || !text.trim() || createParagraph.isPending}
                onPress={() =>
                  createParagraph.mutate({ title: title.trim(), text: text.trim() })
                }
              >
                {createParagraph.isPending ? "Creating..." : "Create paragraph"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold">Existing paragraphs</h2>
        </CardHeader>
        <CardBody className="px-6 pb-6 pt-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <p className="text-danger text-sm">
              {error instanceof Error ? error.message : "Failed to load paragraphs"}
            </p>
          ) : list.length === 0 ? (
            <p className="text-default-500 text-sm">No paragraphs yet.</p>
          ) : (
            <div className="space-y-4">
              {list.map((p: ApiParagraph) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-default-100 dark:border-default-50 p-4"
                >
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {p.title}
                  </p>
                  <p className="text-xs text-default-400 mb-2">
                    {new Date(p.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-default-600 line-clamp-3 whitespace-pre-wrap">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

