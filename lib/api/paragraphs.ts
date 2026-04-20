export interface ApiParagraph {
  id: string;
  title: string;
  text: string;
  /** easy | medium | hard | expert */
  category: string;
  createdAt: string;
}

export async function fetchParagraphsApi(): Promise<ApiParagraph[]> {
  const res = await fetch("/api/paragraphs", { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Failed to load paragraphs"
    );
  }
  const data = (await res.json()) as ApiParagraph[];
  return data.map((p) => ({
    ...p,
    category: typeof p.category === "string" ? p.category : "medium",
  }));
}

export async function createParagraphApi(input: {
  title: string;
  text: string;
  category: string;
}): Promise<ApiParagraph> {
  const res = await fetch("/api/paragraphs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Failed to create paragraph"
    );
  }
  return res.json();
}

export async function updateParagraphApi(
  id: string,
  input: { title: string; text: string; category: string }
): Promise<ApiParagraph> {
  const res = await fetch(`/api/paragraphs/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
    };
    const parts = [body.error, body.details].filter(Boolean);
    throw new Error(
      parts.length > 0 ? parts.join(": ") : "Failed to update paragraph"
    );
  }
  return res.json();
}

export async function deleteParagraphApi(id: string): Promise<void> {
  const res = await fetch(`/api/paragraphs/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Failed to delete paragraph"
    );
  }
}


