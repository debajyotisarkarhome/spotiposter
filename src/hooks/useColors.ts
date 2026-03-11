import { useState, useEffect } from "react";

function getKMeansColors(imageData: Uint8ClampedArray, k = 5, iterations = 10): string[] {
  const pixels: number[][] = [];
  for (let i = 0; i < imageData.length; i += 16) { // sample every 4th pixel
    pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
  }

  // Initialize centroids from evenly spaced pixels
  let centroids = Array.from({ length: k }, (_, i) =>
    pixels[Math.floor((i * pixels.length) / k)]
  );

  for (let iter = 0; iter < iterations; iter++) {
    const clusters: number[][][] = centroids.map(() => []);
    for (const px of pixels) {
      let minDist = Infinity;
      let closest = 0;
      for (let c = 0; c < centroids.length; c++) {
        const d =
          (px[0] - centroids[c][0]) ** 2 +
          (px[1] - centroids[c][1]) ** 2 +
          (px[2] - centroids[c][2]) ** 2;
        if (d < minDist) {
          minDist = d;
          closest = c;
        }
      }
      clusters[closest].push(px);
    }
    centroids = clusters.map((cl, i) => {
      if (cl.length === 0) return centroids[i];
      const avg = [0, 0, 0];
      for (const px of cl) {
        avg[0] += px[0];
        avg[1] += px[1];
        avg[2] += px[2];
      }
      return [
        Math.round(avg[0] / cl.length),
        Math.round(avg[1] / cl.length),
        Math.round(avg[2] / cl.length),
      ];
    });
  }

  return centroids.map(([r, g, b]) => `rgb(${r},${g},${b})`);
}

export function useColors(imageUrl: string | undefined) {
  const [colors, setColors] = useState<string[] | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        const size = 100; // downscale for speed
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        setColors(getKMeansColors(data, 5));
      } catch {
        setColors(["#d4a843", "#b8a89a", "#5a5047", "#8a8070", "#2a2a2a"]);
      }
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return colors;
}
