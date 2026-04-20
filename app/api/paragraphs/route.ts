import { NextResponse } from "next/server";
import { getActiveParagraphs, createParagraph } from "@/lib/db-paragraphs";
import { isAdmin } from "@/lib/auth-helpers";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { parseParagraphCategory } from "@/lib/paragraph-categories";
import { toIsoString } from "@/lib/to-iso-string";

export async function GET() {
  try {
    const paragraphs = await getActiveParagraphs();
    return NextResponse.json(
      paragraphs.map((p) => ({
        id: p.id.toString(),
        title: p.title,
        text: p.text,
        category: p.category,
        createdAt: toIsoString(p.createdAt),
      })),
      {
        headers: { "Cache-Control": "no-store, must-revalidate" },
      },
    );
  } catch (err) {
    console.error("[API paragraphs GET]", err);
    return NextResponse.json(
      { error: "Failed to load paragraphs" },
      { status: 503 }
    );
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { error: "Forbidden: admin only" },
      { status: 403 }
    );
  }
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const category = parseParagraphCategory(body.category);
    if (!title || !text) {
      return NextResponse.json(
        { error: "Title and text are required" },
        { status: 400 }
      );
    }
    const paragraph = await createParagraph({
      title,
      text,
      category,
      createdByEmail: session?.user?.email ?? undefined,
    });
    return NextResponse.json(
      {
        id: paragraph.id.toString(),
        title: paragraph.title,
        text: paragraph.text,
        category: paragraph.category,
        createdAt: toIsoString(paragraph.createdAt),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[API paragraphs POST]", err);
    return NextResponse.json(
      { error: "Failed to create paragraph" },
      { status: 500 }
    );
  }
}

