"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useColors } from "@/hooks/useColors";
import { useArtwork } from "@/hooks/useArtwork";
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

function getBestImage(album: SpotifyAlbum): string | undefined {
  if (!album.images.length) return undefined;
  const sorted = [...album.images].sort(
    (a, b) => (b.width ?? 0) * (b.height ?? 0) - (a.width ?? 0) * (a.height ?? 0)
  );
  return sorted[0].url;
}

export default function Poster({ album }: PosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const spotifyImageUrl = getBestImage(album);
  const artistName = album.artists.map((a) => a.name).join(", ");
  const imageUrl = useArtwork(album.name, artistName, spotifyImageUrl);
  const colors = useColors(imageUrl);

  const year = album.release_date?.slice(0, 4);
  const spotifyCode = `https://scannables.scdn.co/uri/plain/png/f0ebe3/black/640/${album.uri}`;
  const filename = album.name.replace(/[^a-zA-Z0-9]/g, "_");

  const getPosterImage = async () => {
    if (!posterRef.current) return null;
    return toPng(posterRef.current, {
      pixelRatio: 4,
      cacheBust: true,
    });
  };

  const handleDownloadPng = async () => {
    try {
      const dataUrl = await getPosterImage();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.download = `${filename}_poster.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const dataUrl = await getPosterImage();
      if (!dataUrl) return;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Fill A4 with poster background color
      pdf.setFillColor(240, 235, 227);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      // Center the poster on A4, maintaining aspect ratio (640:900)
      const posterRatio = 640 / 900;
      let imgWidth = pageWidth;
      let imgHeight = imgWidth / posterRatio;
      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = imgHeight * posterRatio;
      }
      const x = (pageWidth - imgWidth) / 2;
      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`${filename}_poster.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
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

      {/* Download buttons */}
      <div className="flex gap-3">
        <Button onClick={handleDownloadPng} size="lg" className="gap-2">
          <Download className="w-4 h-4" />
          Download PNG
        </Button>
        <Button onClick={handleDownloadPdf} size="lg" variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
