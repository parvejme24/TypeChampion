import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-helpers";
import { updateParagraph, deleteParagraph } from "@/lib/db-paragraphs";

function parseId(paramId: string): number | null {
  const n = Number(paramId);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Forbidden: admin only" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!title || !text) {
    return NextResponse.json(
      { error: "Title and text are required" },
      { status: 400 }
    );
  }

  try {
    const paragraph = await updateParagraph({
      id: parsedId,
      title,
      text,
    });

    return NextResponse.json({
      id: paragraph.id.toString(),
      title: paragraph.title,
      text: paragraph.text,
      createdAt: paragraph.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[API paragraphs PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update paragraph" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Forbidden: admin only" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const parsedId = parseId(id);
  if (!parsedId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    await deleteParagraph(parsedId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API paragraphs DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete paragraph" },
      { status: 500 }
    );
  }
}

