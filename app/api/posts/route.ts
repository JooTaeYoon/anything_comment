import { NextResponse } from "next/server";

import { ensureBoardsTable, sql } from "@/lib/db";

type BoardRow = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export async function GET() {
  try {
    await ensureBoardsTable();

    const boards = (await sql`
      SELECT id, title, content, created_at
      FROM boards
      ORDER BY created_at DESC, id DESC
    `) as BoardRow[];

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Failed to fetch boards:", error);

    return NextResponse.json(
      { message: "게시글을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!title || !content) {
      return NextResponse.json(
        { message: "제목과 내용을 모두 입력해주세요." },
        { status: 400 },
      );
    }

    await ensureBoardsTable();

    const [board] = (await sql`
      INSERT INTO boards (title, content)
      VALUES (${title}, ${content})
      RETURNING id, title, content, created_at
    `) as BoardRow[];

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("Failed to create board:", error);

    return NextResponse.json(
      { message: "게시글을 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}
