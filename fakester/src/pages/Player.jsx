// Player.jsx
import { useEffect, useState } from "react";
import { generateCodeVerifier, generateCodeChallenge } from "./pkce";

export default function Player() {
  const CLIENT_ID = "97e19d6293db4379b6c20bd12a24f75a";
  const REDIRECT_URI = "https://fakester.vercel.app/player";

  const [token, setToken] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    async function init() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const qrFromState = params.get("state") || params.get("qr"); // get QR from state or fallback

      if (qrFromState) setQrUrl(decodeURIComponent(qrFromState));

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

    init();
  }, []);

  useEffect(() => {
    if (!token || !qrUrl) return;

    // define trackUri here
    const trackId = qrUrl.split("/track/")[1]?.split("?")[0];
    if (!trackId) return;
    const trackUri = `spotify:track:${trackId}`;

    async function setupPlayer() {
      if (!window.Spotify) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://sdk.scdn.co/spotify-player.js";
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }

      const player = new window.Spotify.Player({
        name: "Fakster Web Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      player.addListener("ready", ({ device_id }) => {
        fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [trackUri] }), // now defined
          }
        );
      });

      player.connect();
    }

    setupPlayer();
  }, [token, qrUrl]);

  return (
    <div style={{ color: "white", textAlign: "center", padding: 40 }}>
      <h1>Playing Track...</h1>
      <p>{qrUrl}</p>
    </div>
  );
}
