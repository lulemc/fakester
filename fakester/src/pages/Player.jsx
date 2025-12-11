// Player.jsx
import { useEffect, useState } from "react";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";
import { useNavigate, useLocation } from "react-router-dom";

export default function Player() {
  const [status, setStatus] = useState("Initializing...");
  const [player, setPlayer] = useState(null);
  const { state } = useLocation();
  const [deviceId, setDeviceId] = useState(null);
  const [playing, setPlaying] = useState(false);
  const navigate = useNavigate();

  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  const token = import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN;

  const qrUrl = decodeURIComponent(state.qr);

  useEffect(() => {
    /*async function init() {
      //const code = params.get("code");
      const qrFromState = state.qr;
      console.log(qrFromState);
      if (qrFromState) setQrUrl(decodeURIComponent(qrFromState));
    }
    
      if (!code) {
        // Step 1: first time, generate PKCE and redirect to Spotify login
        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);
        localStorage.setItem("pkce_verifier", verifier);

        const stateParam = qrFromState ? encodeURIComponent(qrFromState) : "";

        const authUrl =
          "https://accounts.spotify.com/authorize?" +
          new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: "code",
            redirect_uri: REDIRECT_URI,
            code_challenge_method: "S256",
            code_challenge: challenge,
            scope: "streaming user-read-email user-read-private",
            state: stateParam,
          });

        window.location.href = authUrl;
        return;
      }

      // Step 2: exchange code for token
      const verifier = localStorage.getItem("pkce_verifier");
      if (!verifier) return console.error("PKCE verifier missing");

      const body = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      });

      const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await res.json();
      if (data.error) return console.error("Token exchange error:", data);

      setToken(data.access_token);

      // Step 3: clean URL to prevent infinite loops
      window.history.replaceState(
        {},
        document.title,
        REDIRECT_URI + (qrFromState ? `?qr=${qrFromState}` : "")
      );
      //localStorage.removeItem("pkce_verifier");
    }
*/
    // init();
  }, []);

  useEffect(() => {
    if (!token || !qrUrl) {
      console.log("Missing token or QR URL");
      return;
    }

    const trackId = qrUrl.split("/track/")[1]?.split("?")[0];
    console.log("Extracted track ID:", trackId);
    const trackUri = `spotify:track:${trackId}`;
    console.log("Playing track URI:", trackUri);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Fakester Web Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      // Listen for errors
      player.addListener("initialization_error", ({ message }) =>
        console.error(message)
      );
      player.addListener("authentication_error", ({ message }) =>
        console.error(message)
      );
      player.addListener("account_error", ({ message }) =>
        console.error(message)
      );
      player.addListener("playback_error", ({ message }) =>
        console.error(message)
      );

      // Ready event
      player.addListener("ready", ({ device_id }) => {
        console.log("Device ready:", device_id);

        // Play track
        fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [trackUri] }),
          }
        )
          .then((res) => {
            if (!res.ok)
              console.error("Playback error", res.status, res.statusText);
            else setStatus("Playing track!");
          })
          .catch((err) => console.error(err));
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device not ready:", device_id);
      });

      player.connect();
      setPlayer(player);
    };
    // 2️⃣ Load SDK only once
    if (!document.getElementById("spotify-sdk")) {
      const script = document.createElement("script");
      script.id = "spotify-sdk";
      script.src = "https://sdk.scdn.co/spotify-player.js";
      document.body.appendChild(script);
    }
  }, [token, qrUrl]);

  const togglePlay = () => {
    player.togglePlay();
    setPlaying(true);
  };

  const stopPlay = () => {
    player.pause();
    setPlaying(false);
  };

  const next = () => {
    if (player) {
      player.disconnect();
    }
    navigate("/scanner");
  };

  return (
    <div style={{ color: "white", textAlign: "center", padding: 40 }}>
      <h1>{status}</h1>
      {!playing ? (
        <button onClick={() => togglePlay()}>▶️</button>
      ) : (
        <button onClick={() => stopPlay()}>⏸️</button>
      )}
      <button onClick={() => next()}>Next</button>
    </div>
  );
}
