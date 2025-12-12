import { useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReaderBox = styled.div`
  width: 92vw;
  max-width: 720px;
  height: 70vh;
  max-height: 900px;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.6);
`;

export default function Scanner({ onDetected }) {
  const html5Ref = useRef(null);
  const stoppedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner = null;
    let activeCameraId = null;
    stoppedRef.current = false;

    const startScanner = async () => {
      try {
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          const tracks = stream.getTracks();
          tracks.forEach((t) => t.stop());
        } catch (e) {
          console.log("Camera permission denied or error:", e);
        }

        scanner = new Html5Qrcode("qr-reader", false);
        html5Ref.current = scanner;

        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          alert("No camera found on this device.");
          return;
        }

        const backDevice =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ||
          devices[devices.length - 1];

        activeCameraId = backDevice.id;

        await scanner.start(
          { deviceId: { exact: activeCameraId } },
          {
            fps: 10,
            qrbox: { width: 300, height: 300 },
            videoConstraints: { facingMode: "environment" },
          },
          (decodedText, decodedResult) => {
            if (stoppedRef.current) return;
            stoppedRef.current = true;
            console.log("QR detected:", decodedResult);
            scanner
              .stop()
              .catch(() => {})
              .finally(() => {
                onDetected && onDetected(decodedText);
              });

            const qrUrl = decodeURIComponent(decodedText);

            const trackId = qrUrl.split("/track/")[1]?.split("?")[0];
            const trackUri = `spotify:track:${trackId}`;
            console.log("Track URI:", trackUri);
            navigate("/player", { state: { trackUri: trackUri } });
          },
          (errorMessage) => {
            console.debug("QR error:", errorMessage);
          }
        );
      } catch (err) {
        console.error("Scanner start error:", err);
        alert("Camera error: " + (err && err.message ? err.message : err));
      }
    };
    /* navigate("/player", {
      state: {
        qr: "https://open.spotify.com/track/6AoEkZTlvlpBGoo1dyJFMo?si=7f8c2195cab944b5",
      },
    });*/

    startScanner();
    return () => {
      stoppedRef.current = true;
      if (html5Ref.current) {
        try {
          html5Ref.current.stop().catch(() => {});
          console.log("HTML5 QR code scanner stopped on unmount");
        } catch {
          console.log("Failed to stop html5-qrcode on unmount");
        }
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper>
      <ReaderBox>
        <div id="qr-reader" style={{ width: "100%", height: "100%" }} />
      </ReaderBox>
    </Wrapper>
  );
}
