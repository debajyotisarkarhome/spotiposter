"use client";

import { useState } from "react";
import { searchAlbums, getAlbum, type SpotifyAlbum } from "@/lib/spotify";
import {
  searchMovies,
  getMovieById,
  getHighResPoster,
  type MovieSearchResult,
  type MovieDetail,
} from "@/lib/movies";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, ArrowLeft, Music, Film } from "lucide-react";
import Poster from "@/components/Poster";
import MoviePoster from "@/components/MoviePoster";

type Mode = "album" | "movie";

export default function Home() {
  const [mode, setMode] = useState<Mode>("album");
  const [query, setQuery] = useState("");
  const [albumResults, setAlbumResults] = useState<SpotifyAlbum[]>([]);
  const [movieResults, setMovieResults] = useState<MovieSearchResult[]>([]);
  const [album, setAlbum] = useState<SpotifyAlbum | null>(null);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const hasSelection = album || movie;
  const hasResults =
    mode === "album" ? albumResults.length > 0 : movieResults.length > 0;

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setAlbumResults([]);
    setMovieResults([]);
    setAlbum(null);
    setMovie(null);
    setQuery("");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setAlbum(null);
    setMovie(null);
    try {
      if (mode === "album") {
        const albums = await searchAlbums(query);
        setAlbumResults(albums);
      } else {
        const movies = await searchMovies(query);
        setMovieResults(movies);
      }
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  };

  const handleSelectAlbum = async (id: string) => {
    setLoading(true);
    try {
      const data = await getAlbum(id);
      setAlbum(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSelectMovie = async (imdbID: string) => {
    setLoading(true);
    try {
      const data = await getMovieById(imdbID);
      setMovie(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleBack = () => {
    setAlbum(null);
    setMovie(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-6 py-4">
          {mode === "album" ? (
            <Music className="w-6 h-6 text-primary" />
          ) : (
            <Film className="w-6 h-6 text-primary" />
          )}
          <h1 className="text-xl font-bold tracking-tight">SpotiPoster</h1>
          <span className="text-sm text-muted-foreground">
            {mode === "album" ? "Album" : "Movie"} poster generator
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === "album" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => handleModeChange("album")}
          >
            <Music className="w-4 h-4" />
            Albums
          </Button>
          <Button
            variant={mode === "movie" ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => handleModeChange("movie")}
          >
            <Film className="w-4 h-4" />
            Movies
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "album"
                ? "Search for an album..."
                : "Search for a movie..."
            }
            className="flex-1"
          />
          <Button type="submit" disabled={searching} className="gap-2">
            <Search className="w-4 h-4" />
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>

        {/* Back button when viewing poster */}
        {hasSelection && (
          <Button
            variant="ghost"
            className="mb-6 gap-2"
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to results
          </Button>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20 text-muted-foreground">
            Loading {mode === "album" ? "album" : "movie"} details...
          </div>
        )}

        {/* Album poster */}
        {album && !loading && (
          <div className="flex justify-center">
            <Poster album={album} />
          </div>
        )}

        {/* Movie poster */}
        {movie && !loading && (
          <div className="flex justify-center">
            <MoviePoster movie={movie} />
          </div>
        )}

        {/* Album search results */}
        {mode === "album" && !album && !loading && albumResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {albumResults.map((a) => (
              <Card
                key={a.id}
                className="overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 hover:scale-[1.02] bg-card p-0"
                onClick={() => handleSelectAlbum(a.id)}
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

        {/* Movie search results */}
        {mode === "movie" && !movie && !loading && movieResults.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movieResults.map((m) => (
              <Card
                key={m.imdbID}
                className="overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 hover:scale-[1.02] bg-card p-0"
                onClick={() => handleSelectMovie(m.imdbID)}
              >
                {m.Poster && m.Poster !== "N/A" ? (
                  <img
                    src={m.Poster}
                    alt={m.Title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center">
                    <Film className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{m.Title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {m.Year}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!hasSelection && !loading && !hasResults && !searching && (
          <div className="text-center py-20">
            {mode === "album" ? (
              <Music className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            ) : (
              <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            )}
            <p className="text-muted-foreground">
              Search for {mode === "album" ? "an album" : "a movie"} to create a
              poster
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
