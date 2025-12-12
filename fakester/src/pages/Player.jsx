import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Player() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const trackUri = state?.trackUri || null;

  // Expecting a playlist ID and optional track index from the QR

  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(
    localStorage.getItem("spotify_device_id") || null
  );
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token || !trackUri) return;

    const transferPlayback = async (device_id) => {
      try {
        await fetch("https://api.spotify.com/v1/me/player", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ device_ids: [device_id], play: false }),
        });
        // wait briefly to ensure device is active
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error("Failed to transfer playback:", err);
      }
    };

    const initSpotify = () => {
      const p = new window.Spotify.Player({
        name: "Fakster Web Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      p.addListener("ready", async ({ device_id }) => {
        console.log("Spotify Player ready, device_id:", device_id);

        const idToUse = deviceId || device_id;

        setDeviceId(idToUse);
        localStorage.setItem("spotify_device_id", idToUse);

        setReady(true);

        await transferPlayback(deviceId);
      });

      p.addListener("not_ready", ({ device_id }) =>
        console.log("Device not ready", device_id)
      );
      p.addListener("initialization_error", ({ message }) =>
        console.error("Initialization error:", message)
      );
      p.addListener("authentication_error", ({ message }) =>
        console.error("Authentication error:", message)
      );
      p.addListener("account_error", ({ message }) =>
        console.error("Account error:", message)
      );
      p.addListener("playback_error", ({ message }) =>
        console.error("Playback error:", message)
      );

      p.connect();
      setPlayer(p);
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

    return () => {
      if (player) player.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, trackUri]);

  // --- Play the playlist starting at trackIndex ---
  const handlePlay = async (devId = deviceId) => {
    if (!devId || !ready) return;
    try {
      await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [trackUri] }), // play only this track
        }
      );

      player?.resume();
      setPlaying(true);
    } catch (err) {
      console.error("Failed to play playlist:", err);
    }
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
      <h1>Spotify Web Player</h1>
      <h2>Spotify track: {trackUri}</h2>

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
