const express = require("express");
const axios = require("axios");
const qs = require("querystring");
var cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } =
  process.env;

// ==============================
// 1. Manually start login (you open in browser)
// ==============================
app.get("/authorize", (req, res) => {
  const scope =
    "user-read-playback-state user-modify-playback-state user-read-private user-read-email streaming";

  const params = qs.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    client_secret: SPOTIFY_CLIENT_SECRET,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

// ==============================
// 2. Spotify redirects here → return tokens as JSON
// ==============================
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  if (!code)
    return res.status(400).json({ error: "Missing authorization code" });

  try {
    const tokenRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
        client_secret: SPOTIFY_CLIENT_SECRET,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(tokenRes.data); // access_token, refresh_token, expires_in
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to get tokens" });
  }
});

// ==============================
// 3. Refresh token manually
// ==============================
app.post("/refresh", async (req, res) => {
  const refresh_token = req.body.refresh_token;

  if (!refresh_token)
    return res.status(400).json({ error: "Missing refresh_token" });

  try {
    const refreshRes = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "refresh_token",
        refresh_token,
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(refreshRes.data); // access_token, expires_in, maybe new refresh_token
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to refresh token" });
  }
});

// ==============================
app.listen(3001, () => console.log("Running on http://localhost:3001"));
