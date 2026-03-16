"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useColors } from "@/hooks/useColors";
import { getHighResPoster, type MovieDetail } from "@/lib/movies";

interface MoviePosterProps {
  movie: MovieDetail;
}

export default function MoviePoster({ movie }: MoviePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const imageUrl = getHighResPoster(movie.Poster);
  const colors = useColors(imageUrl || undefined);

  const filename = movie.Title.replace(/[^a-zA-Z0-9]/g, "_");

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
      pdf.setFillColor(240, 235, 227);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      const posterRatio = 640 / 906;
      let imgWidth = pageWidth;
      let imgHeight = imgWidth / posterRatio;
      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = imgHeight * posterRatio;
      }
      const x = (pageWidth - imgWidth) / 2;
      const y = 0;
      pdf.addImage(dataUrl, "PNG", x, y, imgWidth, imgHeight);
      pdf.save(`${filename}_poster.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        ref={posterRef}
        className="relative flex flex-col"
        style={{
          width: 640,
          height: 906,
          backgroundColor: "#f0ebe3",
          fontFamily: "'Inter', sans-serif",
          color: "#1a1a1a",
        }}
      >
        {/* Movie poster art */}
        <div style={{ padding: "24px 24px 0 24px", flex: "1 1 0", minHeight: 0, overflow: "hidden" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={movie.Title}
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "#666",
              }}
            >
              No Poster
            </div>
          )}
        </div>

        {/* Metadata section */}
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
            {movie.Title}
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
            <div>{movie.Genre}</div>
            <div>
              {movie.Year}
              {movie.Runtime !== "N/A" && <> &bull; {movie.Runtime}</>}
              {movie.Rated !== "N/A" && <> &bull; {movie.Rated}</>}
            </div>
            <div>DIRECTED BY {movie.Director.toUpperCase()}</div>
            <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
              {movie.Actors.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Footer: color palette */}
        <div
          className="flex items-end justify-between"
          style={{
            padding: "0 24px 24px",
            marginTop: "auto",
          }}
        >
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
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex gap-3">
        <Button onClick={handleDownloadPng} size="lg" className="gap-2">
          <Download className="w-4 h-4" />
          Download PNG
        </Button>
        <Button
          onClick={handleDownloadPdf}
          size="lg"
          variant="outline"
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Download PDF
        </Button>
      </div>
    </div>
  );
}
