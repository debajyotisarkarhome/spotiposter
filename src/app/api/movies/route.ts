import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.OMDB_API_KEY || "trilogy";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    if (action === "search") {
      const term = searchParams.get("term") || "";
      const res = await fetch(
        `https://www.omdbapi.com/?s=${encodeURIComponent(term)}&type=movie&apikey=${API_KEY}`
      );
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "lookup") {
      const id = searchParams.get("id") || "";
      const res = await fetch(
        `https://www.omdbapi.com/?i=${encodeURIComponent(id)}&plot=full&apikey=${API_KEY}`
      );
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "OMDb API error" }, { status: 500 });
  }
}
