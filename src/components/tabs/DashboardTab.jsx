import { fmtBRL } from "../../constants";

export default function DashboardTab({
  categories,
  icons,
  colors,
  budgets,
  gastosCat,
  onEditBudget,
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          fontWeight: 700,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        RESUMO POR CATEGORIA
      </div>
      {categories.map((cat) => {
        const orcamento = budgets[cat] || 0;
        const gasto = gastosCat[cat] || 0;
        const pct = orcamento > 0 ? Math.min(100, (gasto / orcamento) * 100) : 0;
        const over = orcamento > 0 && gasto > orcamento;
        return (
          <div
            key={cat}
            style={{
              background: "#1e293b",
              borderRadius: 14,
              padding: "14px 16px",
              marginBottom: 10,
              border: `1px solid ${over ? "#ef4444" : "#2d3748"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: colors[cat] + "22",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {icons[cat]}
                </span>
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>
                  {cat}
                </span>
              </div>
              <button
                onClick={() => onEditBudget(cat)}
                style={{
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 6,
                  padding: "3px 8px",
                  color: "#64748b",
                  fontSize: 10,
                  cursor: "pointer",
                }}
              >
                {orcamento > 0 ? `Orç: ${fmtBRL(orcamento)}` : "Definir orçamento"}
              </button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              <span style={{ color: "#94a3b8" }}>
                Gasto:{" "}
                <span style={{ color: "#f1f5f9", fontWeight: 700 }}>
                  {fmtBRL(gasto)}
                </span>
              </span>
              {orcamento > 0 && (
                <span
                  style={{
                    color: over ? "#ef4444" : "#10b981",
                    fontWeight: 700,
                  }}
                >
                  {over
                    ? `▲ ${fmtBRL(gasto - orcamento)}`
                    : `▼ ${fmtBRL(orcamento - gasto)}`}
                </span>
              )}
            </div>
            {orcamento > 0 && (
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 99,
                  height: 5,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: 99,
                    background: over ? "#ef4444" : colors[cat],
                    transition: "width 0.4s",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
