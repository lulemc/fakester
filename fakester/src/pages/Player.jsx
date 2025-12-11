import styled from "@emotion/styled";
import { useLocation, useNavigate } from "react-router-dom";

const Page = styled.div`
  min-height: 100vh;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  flex-direction: column;
`;

const Card = styled.div`
  max-width: 720px;
  width: 92vw;
  background: rgba(255, 255, 255, 0.03);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
`;

const Button = styled.button`
  margin-top: 18px;
  padding: 10px 18px;
  background: #1db954;
  color: #000;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
`;

export default function Player() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const qr = state?.qr || "NO QR RECEIVED";
  return (
    <Page>
      <Card>
        <h2 style={{ marginBottom: 8 }}>Scanned QR</h2>
        <p style={{ wordBreak: "break-all" }}>{qr}</p>
        <Button onClick={() => navigate("/scanner")}>SCAN NEXT</Button>
      </Card>
    </Page>
  );
}
