import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0f0f0f",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#C0392B", fontWeight: 700, marginBottom: 24 }}>
          ReadYouComicNow
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
          Lee cómics y manga en tu navegador
        </div>
        <div style={{ fontSize: 28, color: "#9CA3AF", marginTop: 24, maxWidth: 900 }}>
          CBZ, PDF e imágenes · 100% local · Sin subidas · Modo manga RTL
        </div>
      </div>
    ),
    size
  );
}
