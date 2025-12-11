import { useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import CameraPreview from "../CameraPreview";

export default function Scanner() {
  useEffect(() => {
    Html5Qrcode.getCameras().then((devices) => {
      if (!devices || devices.length === 0) {
        alert("No camera detected");
        return;
      }
      console.log("Cameras:", devices);
      const cameraId = devices[0].id;

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCode.start(cameraId, { fps: 10, qrbox: 250 }, (decodedText) => {
        alert("QR detected: " + decodedText);
        console.log(decodedText);
      });
    });
  }, []);

  return (
    <>
      <div id="reader"></div>
      <CameraPreview />
    </>
  );
}
