// ─────────────────────────────────────────────────────────────
//  Toggle Pessoal / Negócio (renderizado no topo, acima do header)
// ─────────────────────────────────────────────────────────────
export default function ModeToggle({ modo, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        background: "#1e293b",
        padding: 4,
        borderRadius: 99,
        border: "1px solid #334155",
      }}
    >
      <button
        onClick={() => onChange("pessoal")}
        style={{
          padding: "6px 14px",
          borderRadius: 99,
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          background: modo === "pessoal" ? "#6366f1" : "transparent",
          color: modo === "pessoal" ? "#fff" : "#94a3b8",
          transition: "background 0.2s",
        }}
      >
        👤 Pessoal
      </button>
      <button
        onClick={() => onChange("negocio")}
        style={{
          padding: "6px 14px",
          borderRadius: 99,
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 700,
          background:
            modo === "negocio"
              ? "linear-gradient(135deg,#10b981,#059669)"
              : "transparent",
          color: modo === "negocio" ? "#fff" : "#94a3b8",
          transition: "background 0.2s",
        }}
      >
        🏢 Negócios
      </button>
    </div>
  );
}
