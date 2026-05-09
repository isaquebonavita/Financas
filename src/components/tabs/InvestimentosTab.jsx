import { fmtBRL } from "../../constants";

export default function InvestimentosTab({
  items,
  categorias,
  icons,
  colors,
  gastosCat,
  totalInvestido,
  onRemove,
}) {
  const sorted = [...categorias]
    .filter((c) => gastosCat[c] > 0)
    .sort((a, b) => gastosCat[b] - gastosCat[a]);

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg,#f59e0b18,#f9731618)",
          border: "1px solid #f59e0b44",
          borderRadius: 14,
          padding: "16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#fcd34d",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          TOTAL INVESTIDO NO MÊS
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
            marginTop: 4,
          }}
        >
          {fmtBRL(totalInvestido)}
        </div>
      </div>

      {sorted.length > 0 && (
        <div
          style={{
            background: "#1e293b",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              fontWeight: 700,
              letterSpacing: 1,
              marginBottom: 12,
            }}
          >
            POR CATEGORIA
          </div>
          {sorted.map((cat) => (
            <div key={cat} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 5,
                }}
              >
                <span style={{ color: "#94a3b8" }}>
                  {icons[cat]} {cat}
                </span>
                <span style={{ color: "#f1f5f9", fontWeight: 700 }}>
                  {fmtBRL(gastosCat[cat])}
                </span>
              </div>
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 99,
                  height: 6,
                }}
              >
                <div
                  style={{
                    width: `${
                      totalInvestido > 0
                        ? (gastosCat[cat] / totalInvestido) * 100
                        : 0
                    }%`,
                    height: "100%",
                    borderRadius: 99,
                    background: colors[cat],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          fontWeight: 700,
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        LANÇAMENTOS
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📈</div>
          <div style={{ fontSize: 14 }}>Nenhum investimento neste mês.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Toque em ＋ Investimento para adicionar
          </div>
        </div>
      ) : (
        items.map((i) => (
          <div
            key={i.id}
            style={{
              background: "#1e293b",
              borderRadius: 14,
              padding: "12px 16px",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderLeft: `4px solid ${colors[i.categoria] || "#f59e0b"}`,
            }}
          >
            <span style={{ fontSize: 22 }}>{icons[i.categoria] || "💼"}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}
              >
                {i.descricao}
              </div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                {i.categoria}
                {i.instituicao ? ` • ${i.instituicao}` : ""} •{" "}
                {new Date(i.data + "T00:00:00").toLocaleDateString("pt-BR")}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fcd34d" }}>
                {fmtBRL(parseFloat(i.valor))}
              </div>
              <button
                onClick={() => onRemove(i.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#475569",
                  fontSize: 14,
                  marginTop: 4,
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
