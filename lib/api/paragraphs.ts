export interface ApiParagraph {
  id: string;
  title: string;
  text: string;
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
  return res.json();
}

export async function createParagraphApi(input: {
  title: string;
  text: string;
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
  input: { title: string; text: string }
): Promise<ApiParagraph> {
  const res = await fetch(`/api/paragraphs/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? "Failed to update paragraph"
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


