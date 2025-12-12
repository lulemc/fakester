// playerService.js
import axios from "axios";
import SpotifyAuth from "./spotifyAuthService";

// Extract track ID from QR URL
export function extractSpotifyId(url) {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const type = parts[1]; // "track", "album", "playlist", etc
    const id = parts[2]; // the ID
    return { type, id };
  } catch (err) {
    console.error("Invalid Spotify URL", err);
    return null;
  }
}

export async function playFromQr(qrUrl, deviceId) {
  const parsed = extractSpotifyId(qrUrl);
  if (!parsed) throw new Error("Invalid QR Spotify URL");

  const token = await SpotifyAuth.getValidAccessToken();

  const uri = `spotify:${parsed.type}:${parsed.id}`;

  return axios.put(
    "https://api.spotify.com/v1/me/player/play",
    { uris: [uri] },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        device_id: deviceId,
      },
    }
  );
}
