import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const album = req.nextUrl.searchParams.get("album");
  const artist = req.nextUrl.searchParams.get("artist");

  if (!album || !artist) {
    return NextResponse.json({ error: "album and artist params required" }, { status: 400 });
  }

  try {
    const query = `${artist} ${album}`;
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=5`
    );
    const data = await res.json();

    if (!data.results?.length) {
      return NextResponse.json({ url: null });
    }

    // Try to find an exact match by album name
    const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const match =
      data.results.find(
        (r: { collectionName?: string }) =>
          normalise(r.collectionName ?? "") === normalise(album)
      ) || data.results[0];

    // Replace 100x100bb with 3000x3000bb for max resolution
    const artworkUrl = (match.artworkUrl100 as string)?.replace(
      "100x100bb",
      "3000x3000bb"
    );

    return NextResponse.json({ url: artworkUrl || null });
  } catch {
    return NextResponse.json({ url: null });
  }
}
