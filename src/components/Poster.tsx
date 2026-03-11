import { useRef } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useColors } from "@/hooks/useColors";
import type { SpotifyAlbum } from "@/lib/spotify";

interface PosterProps {
  album: SpotifyAlbum;
}

function formatAlbumType(type: string) {
  const map: Record<string, string> = {
    album: "STUDIO ALBUM",
    single: "SINGLE",
    compilation: "COMPILATION",
    ep: "EP",
  };
  return map[type.toLowerCase()] || type.toUpperCase();
}

export default function Poster({ album }: PosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const imageUrl = album.images[0]?.url;
  const colors = useColors(imageUrl);

  const year = album.release_date?.slice(0, 4);
  const artistName = album.artists.map((a) => a.name).join(", ");
  const tracks = album.tracks.items;
  const spotifyCode = `https://scannables.scdn.co/uri/plain/png/f0ebe3/black/640/${album.uri}`;

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, {
        pixelRatio: 3,
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = `${album.name.replace(/[^a-zA-Z0-9]/g, "_")}_poster.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* The poster */}
      <div
        ref={posterRef}
        className="relative flex flex-col"
        style={{
          width: 640,
          minHeight: 900,
          backgroundColor: "#f0ebe3",
          fontFamily: "'Inter', sans-serif",
          color: "#1a1a1a",
        }}
      >
        {/* Album art section */}
        <div style={{ padding: "24px 24px 0 24px" }}>
          <div className="relative">
            <img
              src={imageUrl}
              alt={album.name}
              crossOrigin="anonymous"
              style={{
                width: "100%",
                aspectRatio: "1",
                objectFit: "cover",
                display: "block",
              }}
            />
            {/* Track list overlay on bottom of image */}
            <div
              className="absolute left-0 right-0 bottom-0"
              style={{
                background:
                  "linear-gradient(transparent, rgba(0,0,0,0.65) 30%)",
                padding: "40px 20px 16px",
              }}
            >
              {tracks.slice(0, 8).map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-2"
                  style={{
                    fontSize: 11,
                    lineHeight: "20px",
                    color: "#fff",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ minWidth: 18, fontWeight: 700 }}>
                    {track.track_number}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.4)",
                    }}
                  />
                  <span>{track.name}</span>
                </div>
              ))}
              {tracks.length > 8 && (
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.6)",
                    marginTop: 4,
                    textAlign: "right",
                  }}
                >
                  +{tracks.length - 8} more
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom metadata section */}
        <div style={{ padding: "24px 24px 20px" }}>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1.1,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {album.name}
          </h2>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.8,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <div>{album.label}</div>
            <div>
              {year} &bull; {formatAlbumType(album.album_type)}
            </div>
            <div>BY {artistName.toUpperCase()}</div>
            {album.copyrights?.[0] && (
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                {album.copyrights[0].text}
              </div>
            )}
          </div>
        </div>

        {/* Footer: color palette + spotify code */}
        <div
          className="flex items-end justify-between"
          style={{
            padding: "0 24px 24px",
            marginTop: "auto",
          }}
        >
          {/* Color palette swatches */}
          <div className="flex" style={{ gap: 0 }}>
            {(colors || ["#ccc", "#aaa", "#888", "#666", "#444"]).map(
              (c, i) => (
                <div
                  key={i}
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: c,
                  }}
                />
              )
            )}
          </div>

          {/* Spotify code */}
          <img
            src={spotifyCode}
            alt="Spotify Code"
            crossOrigin="anonymous"
            style={{ height: 28, opacity: 0.8 }}
          />
        </div>
      </div>

      {/* Download button */}
      <Button onClick={handleDownload} size="lg" className="gap-2">
        <Download className="w-4 h-4" />
        Download Poster
      </Button>
    </div>
  );
}
