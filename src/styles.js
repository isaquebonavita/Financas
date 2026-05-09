// ─────────────────────────────────────────────────────────────
//  ESTILOS REUTILIZÁVEIS
// ─────────────────────────────────────────────────────────────
export const inputStyle = {
  width: "100%",
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#f1f5f9",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

export const primaryBtn = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  border: "none",
  borderRadius: 12,
  color: "#fff",
  fontWeight: 800,
  fontSize: 15,
  cursor: "pointer",
  marginTop: 8,
};

export const arrowBtn = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#94a3b8",
  width: 32,
  height: 32,
  cursor: "pointer",
  fontSize: 18,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const kpiCard = (color) => ({
  background: color + "15",
  borderRadius: 12,
  padding: "12px 14px",
  border: `1px solid ${color}30`,
});

export const fabStyle = (c1, c2) => ({
  padding: "14px 20px",
  borderRadius: 28,
  background: `linear-gradient(135deg,${c1},${c2})`,
  border: "none",
  cursor: "pointer",
  fontSize: 15,
  color: "#fff",
  fontWeight: 800,
  boxShadow: `0 4px 20px ${c1}55`,
  whiteSpace: "nowrap",
});
