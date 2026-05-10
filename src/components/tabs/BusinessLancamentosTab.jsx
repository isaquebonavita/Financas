import { useState } from "react";
import { fmtBRL } from "../../constants";

export default function BusinessLancamentosTab({
  items,
  filter,
  setFilter,
  onRemove,
  catIcons,
}) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["Todos", "Receita", "Despesa"].map((f) => (
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
              background: filter === f ? "#10b981" : "#1e293b",
              color: filter === f ? "#fff" : "#64748b",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏢</div>
          <div style={{ fontSize: 14 }}>Nenhum lançamento neste mês.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>
            Toque em ＋ para adicionar
          </div>
        </div>
      ) : (
        items.map((l) => {
          const isExpanded = expandedId === l.id;
          return (
            <div
              key={l.id}
              style={{
                background: "#1e293b",
                borderRadius: 14,
                marginBottom: 10,
                border: "1px solid #2d3748",
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
                <span style={{ fontSize: 22 }}>
                  {catIcons[l.categoria] || "📌"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#f1f5f9",
                    }}
                  >
                    {l.descricao}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
                    {l.categoria} • {l.forma_pagto} •{" "}
                    {new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")}
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
                  }}
                >
                  {l.obs && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#94a3b8",
                        marginBottom: 10,
                        fontStyle: "italic",
                      }}
                    >
                      💬 {l.obs}
                    </div>
                  )}
                  <button
                    onClick={() => onRemove(l.id)}
                    style={{
                      width: "100%",
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
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
