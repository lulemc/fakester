import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function CameraScanner({ onDetected }) {
  useEffect(() => {
    const scanner = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras().then((devices) => {
      if (!devices || devices.length === 0) {
        alert("No camera found");
        return;
      }

      // Try to find back camera
      let backCam =
        devices.find((d) => d.label.toLowerCase().includes("back")) ||
        devices[devices.length - 1]; // fallback

      scanner.start(backCam.id, { fps: 10, qrbox: 250 }, (decodedText) => {
        onDetected(decodedText);
        scanner.stop();
      });
    });

    return () => {
      try {
        scanner.stop();
      } catch {
        console.log("Scanner already stopped");
      }
    };
  }, [onDetected]);

  return (
    <div
      id="qr-reader"
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "#000",
      }}
    />
  );
}
