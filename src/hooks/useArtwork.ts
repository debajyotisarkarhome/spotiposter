import { useState, useEffect } from "react";

export function useArtwork(album: string, artist: string, fallbackUrl?: string) {
  const [url, setUrl] = useState<string | undefined>(fallbackUrl);

  useEffect(() => {
    if (!album || !artist) return;

    fetch(`/api/artwork?album=${encodeURIComponent(album)}&artist=${encodeURIComponent(artist)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          setUrl(data.url);
        }
      })
      .catch(() => {
        // Keep fallback
      });
  }, [album, artist]);

  return url;
}
