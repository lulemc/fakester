import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import Player from "./pages/Player";
import CameraPreview from "./CameraPreview";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:code" element={<Home />} />

        <Route path="/scanner" element={<Scanner />} />
        <Route path="/player" element={<Player />} />
      </Routes>
    </Router>
  );
}
