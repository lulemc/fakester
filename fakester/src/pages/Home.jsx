import { useNavigate, useLocation } from "react-router-dom";
import * as SC from "./Home.style.js";
import { useState, useEffect } from "react";
import SpotifyAuth from "../services/spotifyAuthService.js";

export default function Home() {
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const code = params.get("code") || null;
  console.log(code);

  const handleAuthorize = () => {
    SpotifyAuth.authorize().then((res) => console.log(res));
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthorized(true);
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (code) {
      localStorage.setItem("code", code);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      SpotifyAuth.callback(code)
        .then(setIsAuthorized(true))
        .catch((err) => {
          console.error("Spotify callback error:", err);
        });
    }
  }, [isAuthorized]);

  return (
    <SC.HomeContainer>
      <h1>🔈Fakester🔈</h1>
      <button
        className="px-6 py-3 bg-green-500 rounded-lg"
        onClick={() => navigate("/scanner")}
        disabled={!isAuthorized}
      >
        Start
      </button>
      <button
        className="px-6 py-3 bg-green-500 rounded-lg"
        onClick={() => handleAuthorize()}
      >
        Connect Spotify
      </button>
    </SC.HomeContainer>
  );
}
