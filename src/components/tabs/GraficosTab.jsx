import { fmtBRL } from "../../constants";

export default function GraficosTab({
  categories,
  icons,
  colors,
  gastosCat,
  totalDespesas,
}) {
  const sorted = [...categories].sort(
    (a, b) => (gastosCat[b] || 0) - (gastosCat[a] || 0)
  );
  const max = gastosCat[sorted[0]] || 1;

  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          fontWeight: 700,
          letterSpacing: 1,
          marginBottom: 16,
        }}
      >
        GASTOS POR CATEGORIA
      </div>

      {totalDespesas === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
          <div>Adicione despesas para ver os gráficos.</div>
        </div>
      ) : (
        <>
          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sorted
                .filter((c) => gastosCat[c] > 0)
                .map((cat) => {
                  const pct = (
                    ((gastosCat[cat] || 0) / totalDespesas) *
                    100
                  ).toFixed(1);
                  return (
                    <div
                      key={cat}
                      style={{
                        background: colors[cat] + "22",
                        borderRadius: 8,
                        padding: "8px 12px",
                        border: `1px solid ${colors[cat]}44`,
                        flex: "1 0 calc(50% - 4px)",
                      }}
                    >
                      <div style={{ fontSize: 13 }}>
                        {icons[cat]}{" "}
                        <span style={{ color: "#e2e8f0", fontWeight: 700 }}>
                          {cat}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: colors[cat],
                          marginTop: 2,
                        }}
                      >
                        {pct}%
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>
                        {fmtBRL(gastosCat[cat] || 0)}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div
            style={{
              background: "#1e293b",
              borderRadius: 16,
              padding: "16px 20px",
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
              RANKING
            </div>
            {sorted
              .filter((c) => gastosCat[c] > 0)
              .map((cat) => (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>
                      {icons[cat]} {cat}
                    </span>
                    <span style={{ color: "#f1f5f9", fontWeight: 700 }}>
                      {fmtBRL(gastosCat[cat] || 0)}
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#0f172a",
                      borderRadius: 99,
                      height: 8,
                    }}
                  >
                    <div
                      style={{
                        width: `${((gastosCat[cat] || 0) / max) * 100}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: colors[cat],
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
