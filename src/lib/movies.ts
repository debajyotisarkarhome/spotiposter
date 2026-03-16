export interface MovieSearchResult {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface MovieDetail {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
  imdbID: string;
  Type: string;
}

export function getHighResPoster(url: string): string {
  if (!url || url === "N/A") return "";
  // OMDb returns SX300 posters; request larger
  return url.replace("SX300", "SX600");
}

export async function searchMovies(query: string): Promise<MovieSearchResult[]> {
  const res = await fetch(
    `/api/movies?action=search&term=${encodeURIComponent(query)}`
  );
  const data = await res.json();
  return data.Search || [];
}

export async function getMovieById(id: string): Promise<MovieDetail | null> {
  const res = await fetch(`/api/movies?action=lookup&id=${encodeURIComponent(id)}`);
  const data = await res.json();
  return data.Response === "True" ? data : null;
}
