import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: "linear-gradient(135deg, #0d1e35 0%, #030a14 100%)",
          border: "0.5px solid #1a2d4a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Horizontal pipe */}
        <div
          style={{
            position: "absolute",
            left: 3,
            top: 14,
            width: 26,
            height: 4,
            borderRadius: 2,
            background: "linear-gradient(90deg, #00d4ff, #00b8e0, #00d4ff)",
            opacity: 0.9,
          }}
        />
        {/* Vertical pipe */}
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 4,
            width: 4,
            height: 24,
            borderRadius: 2,
            background: "linear-gradient(180deg, #00d4ff, #00b8e0, #00d4ff)",
            opacity: 0.9,
          }}
        />
        {/* Center dot */}
        <div
          style={{
            position: "absolute",
            left: 12.5,
            top: 12.5,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#030a14",
            border: "1.5px solid #00d4ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#00d4ff",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
