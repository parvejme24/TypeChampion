"use client";

import { useState, type ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Skeleton } from "@heroui/skeleton";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { toast } from "sonner";
import {
  fetchParagraphsApi,
  createParagraphApi,
  updateParagraphApi,
  deleteParagraphApi,
  type ApiParagraph,
} from "@/lib/api/paragraphs";
import { EditIcon, DeleteIcon } from "@/components/icons";

const paragraphKeys = {
  all: ["paragraphs"] as const,
};

export default function AdminParagraphsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingText, setEditingText] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewParagraph, setViewParagraph] = useState<ApiParagraph | null>(null);
  // successMessage/errorMessage were removed; toasts are used instead

  const {
    data: paragraphs,
    isLoading,
    error,
  } = useQuery({
    queryKey: paragraphKeys.all,
    queryFn: fetchParagraphsApi,
    enabled: status === "authenticated",
  });

  const createParagraph = useMutation({
    mutationFn: ({ title, text }: { title: string; text: string }) =>
      createParagraphApi({ title, text }),
    onSuccess: (created) => {
      setTitle("");
      setText("");
      queryClient.invalidateQueries({ queryKey: paragraphKeys.all });
      toast.success(
        created.title
          ? `Paragraph "${created.title}" created successfully.`
          : "Paragraph created successfully."
      );
    },
    onError: (err) => {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create paragraph. Please try again.";
      toast.error(message);
    },
  });

  const updateParagraph = useMutation({
    mutationFn: (input: { id: string; title: string; text: string }) =>
      updateParagraphApi(input.id, { title: input.title, text: input.text }),
    onSuccess: (updated) => {
      toast.success(
        updated.title
          ? `Paragraph "${updated.title}" updated successfully.`
          : "Paragraph updated successfully."
      );
      setEditingId(null);
      setEditingTitle("");
      setEditingText("");
      queryClient.invalidateQueries({ queryKey: paragraphKeys.all });
    },
    onError: (err) => {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update paragraph. Please try again.";
      toast.error(message);
    },
  });

  const deleteParagraph = useMutation({
    mutationFn: (id: string) => deleteParagraphApi(id),
    onSuccess: () => {
      toast.success("Paragraph deleted successfully.");
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: paragraphKeys.all });
    },
    onError: (err) => {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete paragraph. Please try again.";
      toast.error(message);
    },
  });

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex-1 w-full max-w-6xl mx-auto space-y-6 mb-14">
        <Card>
          <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-lg mt-2" />
          </CardHeader>
          <CardBody className="px-6 pb-6 pt-2 space-y-4">
            <div className="grid gap-3">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="flex justify-end">
                <Skeleton className="h-8 w-32 rounded-lg" />
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
            <Skeleton className="h-5 w-40 rounded-lg" />
          </CardHeader>
          <CardBody className="px-6 pb-6 pt-2">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-default-100 dark:border-default-50 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 rounded-lg" />
                      <Skeleton className="h-3 w-24 rounded-lg" />
                      <Skeleton className="h-4 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                      <Skeleton className="h-4 w-20 rounded-lg" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
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
    <div className="flex-1 w-full max-w-6xl mx-auto space-y-6 mb-14">
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
            <Textarea
              label="Text"
              labelPlacement="outside"
              minRows={4}
              placeholder="Enter the paragraph text the user will type..."
              size="sm"
              value={text}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                color="primary"
                size="sm"
                isDisabled={
                  !title.trim() || !text.trim() || createParagraph.isPending
                }
                onPress={() =>
                  createParagraph.mutate({
                    title: title.trim(),
                    text: text.trim(),
                  })
                }
              >
                {createParagraph.isPending ? "Creating..." : "Create paragraph"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card className="">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
          <h2 className="text-lg font-semibold">Existing paragraphs</h2>
        </CardHeader>
        <CardBody className="px-6 pb-6 pt-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-default-100 dark:border-default-50 p-4 flex flex-col gap-3"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32 rounded-lg" />
                      <Skeleton className="h-3 w-24 rounded-lg" />
                      <Skeleton className="h-4 w-full rounded-lg" />
                      <Skeleton className="h-4 w-4/5 rounded-lg" />
                      <Skeleton className="h-4 w-20 rounded-lg" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-8 w-8 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-danger text-sm">
              {error instanceof Error
                ? error.message
                : "Failed to load paragraphs"}
            </p>
          ) : list.length === 0 ? (
            <p className="text-default-500 text-sm">No paragraphs yet.</p>
          ) : (
            <div className="space-y-4">
              {list.map((p: ApiParagraph) => {
                const isEditing = editingId === p.id;
                return (
                  <div
                    key={p.id}
                    className="rounded-lg border border-default-100 dark:border-default-50 p-4 flex flex-col gap-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <>
                            <Input
                              label="Title"
                              size="sm"
                              labelPlacement="outside"
                              value={editingTitle}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTitle(e.target.value)}
                            />
                            <Textarea
                              className="mt-3"
                              label="Text"
                              size="sm"
                              labelPlacement="outside"
                              minRows={3}
                              value={editingText}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEditingText(e.target.value)}
                            />
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-foreground mb-1">
                              {p.title}
                            </p>
                            <p className="text-xs text-default-400 mb-2">
                              {new Date(p.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-default-600 line-clamp-2 whitespace-pre-wrap">
                              {p.text}
                            </p>
                            <Button
                              size="sm"
                              variant="light"
                              color="primary"
                              className="mt-1 min-w-0 p-0 h-auto font-normal"
                              onPress={() => setViewParagraph(p)}
                            >
                              See more
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-stretch md:items-end">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              onPress={() => {
                                setEditingId(null);
                                setEditingTitle("");
                                setEditingText("");
                              }}
                              isDisabled={updateParagraph.isPending}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              color="primary"
                              isDisabled={
                                updateParagraph.isPending ||
                                !editingTitle.trim() ||
                                !editingText.trim()
                              }
                              onPress={() =>
                                updateParagraph.mutate({
                                  id: p.id,
                                  title: editingTitle.trim(),
                                  text: editingText.trim(),
                                })
                              }
                            >
                              {updateParagraph.isPending ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="flat"
                              isIconOnly
                              aria-label="Edit paragraph"
                              onPress={() => {
                                setEditingId(p.id);
                                setEditingTitle(p.title);
                                setEditingText(p.text);
                              }}
                            >
                              <EditIcon size={18} />
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              isIconOnly
                              aria-label="Delete paragraph"
                              onPress={() => setDeleteId(p.id)}
                              isDisabled={deleteParagraph.isPending}
                            >
                              <DeleteIcon size={18} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {deleteId && (
                <div className="fixed inset-0 z-40 flex items-end justify-end pointer-events-none">
                  <div className="pointer-events-auto m-4 max-w-sm w-full rounded-lg border border-default-200 dark:border-default-100 bg-background shadow-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">
                      Delete paragraph?
                    </p>
                    <p className="text-xs text-default-500">
                      This action cannot be undone. Are you sure you want to permanently
                      remove this paragraph?
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setDeleteId(null)}
                        isDisabled={deleteParagraph.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onPress={() => deleteParagraph.mutate(deleteId)}
                        isDisabled={deleteParagraph.isPending}
                      >
                        {deleteParagraph.isPending ? "Deleting..." : "Yes, delete"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <Modal
                isOpen={!!viewParagraph}
                onClose={() => setViewParagraph(null)}
                size="2xl"
                scrollBehavior="inside"
                backdrop="blur"
              >
                <ModalContent>
                  <ModalHeader className="flex flex-col gap-1">
                    {viewParagraph?.title}
                    <span className="text-xs font-normal text-default-400">
                      {viewParagraph
                        ? new Date(viewParagraph.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </ModalHeader>
                  <ModalBody>
                    <p className="text-sm text-default-600 whitespace-pre-wrap">
                      {viewParagraph?.text ?? ""}
                    </p>
                  </ModalBody>
                  <ModalFooter>
                    <Button
                      color="primary"
                      variant="flat"
                      onPress={() => setViewParagraph(null)}
                    >
                      Close
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
