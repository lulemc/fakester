/** Scanner.jsx
 * Uses html5-qrcode to show live camera and scan.
 * - Desktop shows camera preview
 * - Mobile tries to use the back / rear camera
 * - Calls onDetected(decodedText) on success
 */

import { useEffect, useRef, useState } from "react";
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

const Hint = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  color: #fff;
  font-size: 14px;
  background: rgba(0, 0, 0, 0.4);
  padding: 6px 10px;
  border-radius: 8px;
`;

export default function Scanner({ onDetected }) {
  const html5Ref = useRef(null);
  const [loading, setLoading] = useState(true);
  const stoppedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner = null;
    let activeCameraId = null;
    stoppedRef.current = false;

    const startScanner = async () => {
      setLoading(true);
      try {
        // Some browsers don't reveal camera labels until permission is granted.
        // Prompt permission briefly to get labels (then stop) so we can pick the back camera.
        let stream = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // stop immediately to let Html5Qrcode open it itself later
          const tracks = stream.getTracks();
          tracks.forEach((t) => t.stop());
        } catch (e) {
          console.log("Camera permission denied or error:", e);
          // permission may be requested later by html5-qrcode, continue
        }

        scanner = new Html5Qrcode("qr-reader", /* verbose= */ false);
        html5Ref.current = scanner;

        const devices = await Html5Qrcode.getCameras();

        if (!devices || devices.length === 0) {
          alert("No camera found on this device.");
          setLoading(false);
          return;
        }

        // Prefer a device whose label mentions back/rear; fallback to last (usually rear on phones)
        const backDevice =
          devices.find((d) => /back|rear|environment/i.test(d.label)) ||
          devices[devices.length - 1];

        activeCameraId = backDevice.id;

        // start scanning
        await scanner.start(
          { deviceId: { exact: activeCameraId } },
          {
            fps: 10,
            qrbox: { width: 300, height: 300 },
            videoConstraints: { facingMode: "environment" },
          },
          (decodedText, decodedResult) => {
            // success callback
            if (stoppedRef.current) return;
            stoppedRef.current = true;
            // stop scanner then notify
            console.log("QR detected:", decodedResult);
            scanner
              .stop()
              .catch(() => {})
              .finally(() => {
                onDetected && onDetected(decodedText);
              });
            navigate("/player", { state: { qr: decodedText } });
          },
          (errorMessage) => {
            // parse errors - ignore noisy messages
            console.debug("QR error:", errorMessage);
          }
        );

        setLoading(false);
      } catch (err) {
        console.error("Scanner start error:", err);
        alert("Camera error: " + (err && err.message ? err.message : err));
        setLoading(false);
      }
    };

    startScanner();

    return () => {
      stoppedRef.current = true;
      if (html5Ref.current) {
        try {
          html5Ref.current.stop().catch(() => {});
        } catch {
          console.log("Failed to stop html5-qrcode on unmount");
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  return (
    <Wrapper>
      <ReaderBox>
        <div id="qr-reader" style={{ width: "100%", height: "100%" }} />
        <Hint>
          {loading ? "Initializing camera…" : "Point camera at the QR code"}
        </Hint>
      </ReaderBox>
    </Wrapper>
  );
}
