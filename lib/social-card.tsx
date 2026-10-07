export function SocialCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: "#FDFCFF",
        color: "#1B1023",
        padding: "62px 72px",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -150,
          top: -180,
          width: 610,
          height: 610,
          borderRadius: 9999,
          background: "#EEE4F7",
          display: "flex",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 114,
          top: 68,
          width: 116,
          height: 250,
          border: "3px solid #8B63B5",
          borderRadius: "100% 0 100% 0",
          transform: "rotate(26deg)",
          opacity: 0.72,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 20,
          top: 180,
          width: 104,
          height: 224,
          border: "3px solid #B99AD8",
          borderRadius: "100% 0 100% 0",
          transform: "rotate(68deg)",
          opacity: 0.74,
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 244,
          top: 224,
          width: 94,
          height: 204,
          border: "3px solid #D8C7EC",
          borderRadius: "100% 0 100% 0",
          transform: "rotate(-12deg)",
          opacity: 0.95,
          display: "flex",
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "sans-serif",
            fontSize: 18,
            letterSpacing: 5,
            color: "#5B367E",
          }}
        >
          <span>BOTANICAL EAU DE PARFUM</span>
          <span>Nº 01 · 50 ML</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "82%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: "serif",
              fontSize: 138,
              lineHeight: 0.82,
              letterSpacing: -7,
              color: "#1B1023",
            }}
          >
            ORIMAE<span style={{ color: "#704694" }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 34,
              fontFamily: "sans-serif",
              fontSize: 24,
              letterSpacing: 8,
              color: "#704694",
            }}
          >
            BETWEEN NATURE AND SKIN
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "sans-serif",
            fontSize: 16,
            letterSpacing: 4,
            color: "#5B367E",
          }}
        >
          <span>VIOLET · IRIS · SOFT WOODS</span>
          <span style={{ fontFamily: "serif", fontSize: 34, color: "#704694" }}>香</span>
        </div>
      </div>
    </div>
  );
}
