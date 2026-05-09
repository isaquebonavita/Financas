export default function Toast({ msg, type }) {
  const bg = type === "error" ? "#ef4444" : "#10b981";
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        background: bg,
        color: "#fff",
        padding: "10px 20px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 700,
        zIndex: 400,
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {msg}
    </div>
  );
}
