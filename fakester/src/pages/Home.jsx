import { useNavigate } from "react-router-dom";
import * as SC from "./Home.style.js";

export default function Home() {
  const navigate = useNavigate();

  return (
    <SC.HomeContainer>
      <h1>🔈Fakester🔈</h1>
      <button
        className="px-6 py-3 bg-green-500 rounded-lg"
        onClick={() => navigate("/scanner")}
      >
        Start
      </button>
    </SC.HomeContainer>
  );
}
