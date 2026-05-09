import { useState } from "react";
import { fmtBRL, todayStr } from "../../constants";

export default function LancamentosTab({
  items,
  filter,
  setFilter,
  onRemove,
  onRemoveGrupo,
  onConfirmarPagamento,
  catIcons,
}) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["Todos", "Despesa", "Receita"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 99,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 12,
              background: filter === f ? "#6366f1" : "#1e293b",
              color: filter === f ? "#fff" : "#64748b",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14 }}>Nenhum lançamento neste mês.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Toque em ＋ para adicionar</div>
        </div>
      ) : (
        items.map((l) => {
          const isExpanded = expandedId === l.id;
          const isOverdue =
            l.status === "Pendente" && l.data_pagamento && l.data_pagamento <= todayStr;
          const isRecorrente = !!l.grupo_recorrencia;
          return (
            <div
              key={l.id}
              style={{
                background: "#1e293b",
                borderRadius: 14,
                marginBottom: 10,
                border: `1px solid ${
                  isOverdue ? "#ef4444" : isRecorrente ? "#6366f133" : "#2d3748"
                }`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
                onClick={() => setExpandedId(isExpanded ? null : l.id)}
              >
                <span style={{ fontSize: 22 }}>{catIcons[l.categoria] || "💸"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}
                    >
                      {l.descricao}
                    </span>
                    {isRecorrente && (
                      <span
                        style={{
                          fontSize: 9,
                          background: "#6366f122",
                          color: "#a5b4fc",
                          borderRadius: 4,
                          padding: "1px 5px",
                          fontWeight: 700,
                        }}
                      >
                        🔁 {l.parcela_atual}/{l.total_parcelas}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                    {l.categoria} • {l.forma_pagto} •{" "}
                    {new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 3,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        background:
                          l.status === "Pago" ? "#10b98122" : "#f59e0b22",
                        color: l.status === "Pago" ? "#10b981" : "#f59e0b",
                        borderRadius: 4,
                        padding: "1px 5px",
                        fontWeight: 700,
                      }}
                    >
                      {l.status}
                    </span>
                    {l.data_pagamento && l.status === "Pendente" && (
                      <span
                        style={{
                          fontSize: 9,
                          background: isOverdue ? "#ef444422" : "#1e293b",
                          color: isOverdue ? "#f87171" : "#64748b",
                          borderRadius: 4,
                          padding: "1px 5px",
                          border: `1px solid ${isOverdue ? "#ef4444" : "#334155"}`,
                        }}
                      >
                        {isOverdue ? "⚠️ Vencido" : "📅"}{" "}
                        {new Date(
                          l.data_pagamento + "T00:00:00"
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 800,
                      color: l.tipo === "Receita" ? "#10b981" : "#f87171",
                    }}
                  >
                    {l.tipo === "Receita" ? "+" : "-"}
                    {fmtBRL(parseFloat(l.valor))}
                  </div>
                  <span style={{ fontSize: 11, color: "#475569" }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div
                  style={{
                    borderTop: "1px solid #2d3748",
                    padding: "10px 16px",
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {l.status === "Pendente" && (
                    <button
                      onClick={() => {
                        onConfirmarPagamento(l.id);
                        setExpandedId(null);
                      }}
                      style={{
                        flex: 1,
                        padding: "8px",
                        background: "#10b98122",
                        border: "1px solid #10b981",
                        borderRadius: 8,
                        color: "#10b981",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      ✅ Marcar como Pago
                    </button>
                  )}
                  <button
                    onClick={() => onRemove(l.id)}
                    style={{
                      flex: 1,
                      padding: "8px",
                      background: "#ef444422",
                      border: "1px solid #ef4444",
                      borderRadius: 8,
                      color: "#f87171",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    🗑️ Remover este
                  </button>
                  {isRecorrente && (
                    <button
                      onClick={() => {
                        onRemoveGrupo(l.grupo_recorrencia);
                        setExpandedId(null);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#7f1d1d44",
                        border: "1px solid #ef4444",
                        borderRadius: 8,
                        color: "#fca5a5",
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Remover todos os {l.total_parcelas} recorrentes
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
