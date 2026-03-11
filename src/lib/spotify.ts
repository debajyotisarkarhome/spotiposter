const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

let tokenCache = { token: "", expires: 0 };

async function getToken(): Promise<string> {
  if (tokenCache.token && Date.now() < tokenCache.expires) {
    return tokenCache.token;
  }
  const res = await fetch("/api/auth/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(CLIENT_ID + ":" + CLIENT_SECRET),
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

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
  const token = await getToken();
  const res = await fetch(
    `/api/spotify/v1/search?q=${encodeURIComponent(query)}&type=album&limit=12`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await res.json();
  return data.albums?.items || [];
}

export async function getAlbum(id: string): Promise<SpotifyAlbum> {
  const token = await getToken();
  const res = await fetch(`/api/spotify/v1/albums/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
