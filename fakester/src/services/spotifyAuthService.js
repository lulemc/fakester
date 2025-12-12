import axios from "axios";

const API_URL = "https://fakester-server.vercel.app/"; // backend URL

const SpotifyAuth = {
  async authorize() {
    window.location.href = `${API_URL}/authorize`;
  },
  async callback(code) {
    axios
      .get(`${API_URL}/callback?code=${code}`)
      .then((response) => {
        const { access_token, refresh_token, expires_in } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        console.log("Tokens received", response.data);
      })
      .catch(console.error);
  },
};
export default SpotifyAuth;
