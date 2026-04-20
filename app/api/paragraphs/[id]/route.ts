import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { isAdmin } from "@/lib/auth-helpers";
import { updateParagraph, deleteParagraph } from "@/lib/db-paragraphs";
import { parseParagraphCategory } from "@/lib/paragraph-categories";
import { toIsoString } from "@/lib/to-iso-string";

function parseId(paramId: string): number | null {
  const n = Number(paramId);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function jsonError(
  status: number,
  error: string,
  details?: string,
): NextResponse {
  const body: { error: string; details?: string } = { error };
  if (details) body.details = details;
  return NextResponse.json(body, { status });
}

async function handleParagraphUpdate(req: Request, params: Promise<{ id: string }>) {
  if (!(await isAdmin())) {
    return jsonError(403, "Forbidden: admin only");
  }

  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) {
    return jsonError(400, "Invalid id");
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError(400, "Invalid JSON body");
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const category = parseParagraphCategory(body.category);

  if (!title || !text) {
    return jsonError(400, "Title and text are required");
  }

  try {
    const paragraph = await updateParagraph({
      id: parsedId,
      title,
      text,
      category,
    });

    return NextResponse.json(
      {
        id: paragraph.id.toString(),
        title: paragraph.title,
        text: paragraph.text,
        category: paragraph.category,
        createdAt: toIsoString(paragraph.createdAt),
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err) {
    console.error("[API paragraphs update]", err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return jsonError(
          404,
          "Paragraph not found",
          "No row with this id exists (it may have been deleted).",
        );
      }
      return jsonError(
        500,
        "Failed to update paragraph",
        process.env.NODE_ENV === "development" ? err.message : undefined,
      );
    }

    const details = err instanceof Error ? err.message : String(err);
    const hint =
      /column .*category|Unknown column|does not exist/i.test(details)
        ? "Database may be missing the `category` column. Run: npx prisma migrate deploy"
        : undefined;

    return jsonError(
      500,
      "Failed to update paragraph",
      process.env.NODE_ENV === "development"
        ? [details, hint].filter(Boolean).join(" — ")
        : hint,
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleParagraphUpdate(req, context.params);
}

/** Same behavior as PATCH; some proxies mishandle PATCH with a body. */
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleParagraphUpdate(req, context.params);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return jsonError(403, "Forbidden: admin only");
  }

  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) {
    return jsonError(400, "Invalid id");
  }

  try {
    await deleteParagraph(parsedId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API paragraphs DELETE]", err);
    return jsonError(500, "Failed to delete paragraph");
  }
}
