import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Player() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const qrUrl = decodeURIComponent(state.qr);

  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const token = import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN;

  useEffect(() => {
    if (!token || !qrUrl) return;

    const trackId = qrUrl.split("/track/")[1]?.split("?")[0];
    const trackUri = `spotify:track:${trackId}`;

    const initSpotify = () => {
      const p = new window.Spotify.Player({
        name: "Hitster Web Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      p.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        setReady(true);
      });

      p.addListener("not_ready", ({ device_id }) =>
        console.log("Device not ready", device_id)
      );
      p.addListener("initialization_error", ({ message }) =>
        console.error(message)
      );
      p.addListener("authentication_error", ({ message }) =>
        console.error(message)
      );
      p.addListener("account_error", ({ message }) => console.error(message));
      p.addListener("playback_error", ({ message }) => console.error(message));

      p.connect();
      setPlayer(p);

      return trackUri;
    };

    if (!document.getElementById("spotify-sdk")) {
      const script = document.createElement("script");
      script.id = "spotify-sdk";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.onload = () => initSpotify();
      document.body.appendChild(script);
    } else {
      initSpotify();
    }
  }, [token, qrUrl]);

  const handlePlay = () => {
    if (!deviceId) return;
    const trackId = qrUrl.split("/track/")[1]?.split("?")[0];
    const trackUri = `spotify:track:${trackId}`;

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uris: [trackUri] }),
    })
      .then((res) => {
        if (!res.ok)
          console.error("Playback error", res.status, res.statusText);
        else setPlaying(true);
      })
      .catch(console.error);
  };

  const handlePause = () => {
    player?.pause();
    setPlaying(false);
  };

  const next = () => {
    if (player) player.disconnect();
    navigate("/scanner");
  };

  return (
    <div style={{ color: "white", textAlign: "center", padding: 40 }}>
      <h1>{playing ? "Playing Track!" : "Ready to Play"}</h1>
      {!playing ? (
        <button onClick={handlePlay} disabled={!ready}>
          ▶️ Play
        </button>
      ) : (
        <button onClick={handlePause}>⏸️ Pause</button>
      )}
      <button onClick={next}>Next</button>
    </div>
  );
}
