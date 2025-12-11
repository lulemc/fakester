import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function Player() {
  const [player, setPlayer] = useState(null);
  const [token, setToken] = useState("97e19d6293db4379b6c20bd12a24f75a"); // Your OAuth token
  const searchParams = new URLSearchParams(window.location.search);
  const spotifyUrl = searchParams.get("spotifyUrl");
  const navigate = useNavigate();

  const getTrackUri = (url) => {
    const match = url?.match(/track\/([a-zA-Z0-9]+)/);
    return match ? `spotify:track:${match[1]}` : null;
  };

  useEffect(() => {
    if (!spotifyUrl || !token) return;
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const webPlayer = new window.Spotify.Player({
        name: "Fakester Web Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      webPlayer.connect().then((success) => {
        if (success) {
          console.log("Spotify Web Playback connected");
          const uri = getTrackUri(spotifyUrl);
          if (uri) {
            fetch(`https://api.spotify.com/v1/me/player/play`, {
              method: "PUT",
              body: JSON.stringify({ uris: [uri] }),
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
          }
        }
      });

      setPlayer(webPlayer);
    };
  }, [spotifyUrl, token]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h2 className="mb-4">Playing your track...</h2>
      <button
        className="px-6 py-3 bg-green-500 rounded-lg"
        onClick={() => navigate("/scanner")}
      >
        NEXT
      </button>
    </div>
  );
}
