import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background: "#1B1023",
        }}
      >
        <div
          style={{
            width: 92,
            height: 112,
            border: "7px solid #FDFCFF",
            borderRadius: 999,
            display: "flex",
            position: "relative",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 40,
            top: 31,
            width: 37,
            height: 58,
            borderRadius: "100% 0 100% 0",
            background: "#B99AD8",
            transform: "rotate(16deg)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 13,
            height: 13,
            borderRadius: 999,
            background: "#B99AD8",
            display: "flex",
          }}
        />
      </div>
    ),
    { width: size.width, height: size.height }
  );
}
