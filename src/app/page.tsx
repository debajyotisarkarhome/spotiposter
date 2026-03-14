"use client";

import { useState } from "react";
import { searchAlbums, getAlbum, type SpotifyAlbum } from "@/lib/spotify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, ArrowLeft, Music } from "lucide-react";
import Poster from "@/components/Poster";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyAlbum[]>([]);
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setAlbum(null);
    try {
      const albums = await searchAlbums(query);
      setResults(albums);
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };

  const handleSelect = async (id: string) => {
    setLoading(true);
    try {
      const data = await getAlbum(id);
      setAlbum(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-6 py-4">
          <Music className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">SpotiPoster</h1>
          <span className="text-sm text-muted-foreground">
            Album poster generator
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for an album..."
            className="flex-1"
          />
          <Button type="submit" disabled={searching} className="gap-2">
            <Search className="w-4 h-4" />
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Back button when viewing poster */}
        {album && (
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={() => setAlbum(null)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to results
          </Button>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20 text-muted-foreground">
            Loading album details...
          </div>
        )}

        {/* Album poster */}
        {album && !loading && (
          <div className="flex justify-center">
            <Poster album={album} />
          </div>
        )}

        {/* Search results grid */}
        {!album && !loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {results.map((a) => (
              <Card
                key={a.id}
                className="overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 hover:scale-[1.02] bg-card p-0"
                onClick={() => handleSelect(a.id)}
              >
                <img
                  src={a.images[0]?.url}
                  alt={a.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{a.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {a.artists.map((x) => x.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {a.release_date?.slice(0, 4)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!album && !loading && results.length === 0 && !searching && (
          <div className="text-center py-20">
            <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              Search for an album to create a poster
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
