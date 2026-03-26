export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(3rem, 8vw, 7rem)",
          color: "var(--accent)",
          letterSpacing: "4px",
        }}
      >
        FRANDY.DEV
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "13px",
          letterSpacing: "4px",
          textTransform: "uppercase",
          color: "var(--text-muted)",
        }}
      >
        Frontend coming soon
      </p>
    </div>
  );
}
