import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Player() {
  const { state } = useLocation();
  const qrUrl = state?.qr;
  const [deviceId, setDeviceId] = useState(null);

  // Extract track id
  const trackId = qrUrl?.split("/track/")[1]?.split("?")[0];
  const trackUri = `spotify:track:${trackId}`;

  // Your Spotify app credentials
  const CLIENT_ID = "97e19d6293db4379b6c20bd12a24f75a";
  const REDIRECT_URI = "https://fakester.vercel.app/";

  function loadSpotifySDK() {
    return new Promise((resolve) => {
      if (window.Spotify) {
        resolve(window.Spotify);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.onload = () => resolve(window.Spotify);
      document.body.appendChild(script);
    });
  }

  function getAccessTokenFromUrl() {
    const hash = window.location.hash;
    if (!hash.includes("access_token")) return null;
    return new URLSearchParams(hash.replace("#", "")).get("access_token");
  }

  function requestToken() {
    const url =
      "https://accounts.spotify.com/authorize?" +
      new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "token",
        redirect_uri: REDIRECT_URI,
        scope: "streaming user-read-email user-read-private",
      });

    window.location.href = url;
  }

  async function autoplay(token, deviceId) {
    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
        }),
      }
    );
  }

  useEffect(() => {
    async function setup() {
      // 1. Get token or request login
      const token = getAccessTokenFromUrl();
      if (!token) {
        requestToken();
        return;
      }

      // 2. Load the Spotify SDK
      await loadSpotifySDK();

      // 3. Initialize Spotify Player
      const player = new window.Spotify.Player({
        name: "Hitster Web Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("Player ready:", device_id);
        setDeviceId(device_id);
        autoplay(token, device_id);
      });

      player.connect();
    }

    setup();
  }, []);

  return (
    <div style={{ padding: 40, color: "white", textAlign: "center" }}>
      <h1>Playing Track...</h1>
      <p>{trackUri}</p>

      {!deviceId && <p>Loading Spotify Player…</p>}
    </div>
  );
}
