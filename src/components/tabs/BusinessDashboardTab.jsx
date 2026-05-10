import { fmtBRL, BUSINESS_PAGTO } from "../../constants";

export default function BusinessDashboardTab({
  categories,
  icons,
  colors,
  receitasCat,
  despesasCat,
  totalReceitas,
  totalDespesas,
  recebimentosPorPagto,
}) {
  const lucro = totalReceitas - totalDespesas;
  const margem =
    totalReceitas > 0 ? ((lucro / totalReceitas) * 100).toFixed(1) : "0.0";

  // Junta receitas + despesas por categoria pra ranking
  const sortedCats = [...categories]
    .map((c) => ({
      cat: c,
      total: (receitasCat[c] || 0) + (despesasCat[c] || 0),
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <div>
      {/* ── Card lucro/prejuízo ── */}
      <div
        style={{
          background:
            lucro >= 0
              ? "linear-gradient(135deg,#10b98118,#05966918)"
              : "linear-gradient(135deg,#ef444418,#dc262618)",
          border: `1px solid ${lucro >= 0 ? "#10b98144" : "#ef444444"}`,
          borderRadius: 14,
          padding: "16px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: lucro >= 0 ? "#6ee7b7" : "#fca5a5",
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {lucro >= 0 ? "📈 LUCRO DO MÊS" : "📉 PREJUÍZO DO MÊS"}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
            marginTop: 4,
          }}
        >
          {fmtBRL(lucro)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#94a3b8",
            marginTop: 4,
          }}
        >
          Margem: {margem}%
        </div>
      </div>

      {/* ── Resumo por categoria ── */}
      {sortedCats.length > 0 && (
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
          {sortedCats.map(({ cat }) => {
            const r = receitasCat[cat] || 0;
            const d = despesasCat[cat] || 0;
            return (
              <div
                key={cat}
                style={{
                  marginBottom: 10,
                  paddingBottom: 10,
                  borderBottom: "1px solid #2d3748",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: 13,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: "#e2e8f0", fontWeight: 700 }}>
                    {icons[cat]} {cat}
                  </span>
                </div>
                {r > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>↑ Receita</span>
                    <span style={{ color: "#10b981", fontWeight: 700 }}>
                      {fmtBRL(r)}
                    </span>
                  </div>
                )}
                {d > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>↓ Despesa</span>
                    <span style={{ color: "#f87171", fontWeight: 700 }}>
                      {fmtBRL(d)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Recebimentos por forma de pagamento ── */}
      {totalReceitas > 0 && (
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
            RECEBIMENTOS POR FORMA
          </div>
          {BUSINESS_PAGTO.filter((p) => recebimentosPorPagto[p] > 0)
            .sort((a, b) => recebimentosPorPagto[b] - recebimentosPorPagto[a])
            .map((p) => {
              const v = recebimentosPorPagto[p] || 0;
              const pct = ((v / totalReceitas) * 100).toFixed(0);
              return (
                <div key={p} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ color: "#94a3b8" }}>{p}</span>
                    <span style={{ color: "#f1f5f9", fontWeight: 700 }}>
                      {fmtBRL(v)}{" "}
                      <span style={{ color: "#64748b", fontSize: 10 }}>
                        ({pct}%)
                      </span>
                    </span>
                  </div>
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
                        background: "#10b981",
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {totalReceitas === 0 && totalDespesas === 0 && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
          <div>Nenhum lançamento neste mês.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Adicione receitas e despesas para ver o resumo.
          </div>
        </div>
      )}
    </div>
  );
}
