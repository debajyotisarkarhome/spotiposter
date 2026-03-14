export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  track_number: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];
  release_date: string;
  album_type: string;
  label: string;
  total_tracks: number;
  tracks: { items: SpotifyTrack[] };
  uri: string;
  copyrights: { text: string; type: string }[];
}

export async function searchAlbums(query: string): Promise<SpotifyAlbum[]> {
  const res = await fetch(
    `/api/spotify/v1/search?q=${encodeURIComponent(query)}&type=album&limit=12`
  );
  const data = await res.json();
  return data.albums?.items || [];
}

export async function getAlbum(id: string): Promise<SpotifyAlbum> {
  const res = await fetch(`/api/spotify/v1/albums/${id}`);
  return res.json();
}
