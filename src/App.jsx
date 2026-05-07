import { useState, useMemo } from "react";

const CATEGORIES = [
  "Moradia", "Alimentação", "Transporte", "Saúde",
  "Educação", "Lazer", "Vestuário", "Serviços/Assinaturas", "Outros"
];

const CAT_ICONS = {
  "Moradia": "🏠", "Alimentação": "🍽️", "Transporte": "🚗",
  "Saúde": "💊", "Educação": "📚", "Lazer": "🎭",
  "Vestuário": "👔", "Serviços/Assinaturas": "📱", "Outros": "📦"
};

const CAT_COLORS = {
  "Moradia": "#6366f1", "Alimentação": "#f59e0b", "Transporte": "#3b82f6",
  "Saúde": "#ef4444", "Educação": "#8b5cf6", "Lazer": "#ec4899",
  "Vestuário": "#14b8a6", "Serviços/Assinaturas": "#f97316", "Outros": "#6b7280"
};

const FORMAS_PAGTO = ["Dinheiro", "Débito", "Crédito", "Pix", "Transferência", "Outro"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const fmtBRL = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const today = new Date();

const initialBudgets = Object.fromEntries(CATEGORIES.map(c => [c, 0]));

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [mes, setMes] = useState(today.getMonth());
  const [ano, setAno] = useState(today.getFullYear());
  const [budgets, setBudgets] = useState(initialBudgets);
  const [lancamentos, setLancamentos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [form, setForm] = useState({
    data: today.toISOString().slice(0,10),
    descricao: "", categoria: CATEGORIES[0], valor: "",
    tipo: "Despesa", formaPagto: "Pix", status: "Pago", obs: ""
  });
  const [filter, setFilter] = useState("Todos");
  const [receita, setReceita] = useState(0);
  const [showReceita, setShowReceita] = useState(false);
  const [receitaInput, setReceitaInput] = useState("");

  const lancamentosMes = useMemo(() =>
    lancamentos.filter(l => {
      const d = new Date(l.data + "T00:00:00");
      return d.getMonth() === mes && d.getFullYear() === ano;
    }), [lancamentos, mes, ano]);

  const totalDespesas = useMemo(() =>
    lancamentosMes.filter(l => l.tipo === "Despesa").reduce((s,l) => s + parseFloat(l.valor||0), 0),
    [lancamentosMes]);

  const totalReceitas = useMemo(() =>
    lancamentosMes.filter(l => l.tipo === "Receita").reduce((s,l) => s + parseFloat(l.valor||0), 0) + receita,
    [lancamentosMes, receita]);

  const saldo = totalReceitas - totalDespesas;

  const gastosCat = useMemo(() => {
    const g = {};
    CATEGORIES.forEach(c => g[c] = 0);
    lancamentosMes.filter(l => l.tipo === "Despesa").forEach(l => {
      g[l.categoria] = (g[l.categoria]||0) + parseFloat(l.valor||0);
    });
    return g;
  }, [lancamentosMes]);

  const totalOrcamento = CATEGORIES.reduce((s,c) => s + (budgets[c]||0), 0);
  const pctComprometido = totalOrcamento > 0 ? Math.min(100, (totalDespesas / totalOrcamento) * 100) : 0;

  const pendentes = lancamentosMes.filter(l => l.status === "Pendente").length;

  function addLancamento() {
    if (!form.descricao || !form.valor) return;
    setLancamentos(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({
      data: today.toISOString().slice(0,10),
      descricao: "", categoria: CATEGORIES[0], valor: "",
      tipo: "Despesa", formaPagto: "Pix", status: "Pago", obs: ""
    });
    setShowForm(false);
    setTab("lancamentos");
  }

  function removeItem(id) {
    setLancamentos(prev => prev.filter(l => l.id !== id));
  }

  const filteredL = filter === "Todos" ? lancamentosMes
    : lancamentosMes.filter(l => l.tipo === filter);

  return (
    <div style={{
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
      background: "#0f172a",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "0"
    }}>
      {/* Phone frame */}
      <div style={{
        width: "100%",
        maxWidth: 420,
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Status bar */}
        <div style={{
          background: "#0f172a",
          padding: "8px 20px 4px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#94a3b8"
        }}>
          <span>{today.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</span>
          <span>📶 🔋</span>
        </div>

        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          padding: "16px 20px 20px",
          borderBottom: "1px solid #1e293b"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 12, color: "#64748b", letterSpacing: 1 }}>
                💰 CONTROLE DE GASTOS
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>
                {MESES[mes]} {ano}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { if(mes===0){setMes(11);setAno(a=>a-1)}else setMes(m=>m-1); }}
                style={arrowBtn}>‹</button>
              <button onClick={() => { if(mes===11){setMes(0);setAno(a=>a+1)}else setMes(m=>m+1); }}
                style={arrowBtn}>›</button>
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
            <div style={kpiCard("#10b981")}>
              <div style={{ fontSize: 10, color: "#6ee7b7", marginBottom: 2 }}>💹 RECEITA</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{fmtBRL(totalReceitas)}</div>
              <button onClick={()=>setShowReceita(true)} style={{ fontSize: 9, color: "#6ee7b7", marginTop: 2, background: "none", border: "none", cursor: "pointer", padding: 0 }}>+ definir receita base</button>
            </div>
            <div style={kpiCard("#ef4444")}>
              <div style={{ fontSize: 10, color: "#fca5a5", marginBottom: 2 }}>🔴 DESPESAS</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{fmtBRL(totalDespesas)}</div>
            </div>
            <div style={kpiCard(saldo >= 0 ? "#3b82f6" : "#f59e0b")}>
              <div style={{ fontSize: 10, color: saldo >= 0 ? "#93c5fd" : "#fcd34d", marginBottom: 2 }}>💰 SALDO</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{fmtBRL(saldo)}</div>
            </div>
            <div style={kpiCard("#8b5cf6")}>
              <div style={{ fontSize: 10, color: "#c4b5fd", marginBottom: 2 }}>⏳ PENDENTES</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{pendentes}</div>
            </div>
          </div>

          {/* Progress bar */}
          {totalOrcamento > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                <span>% Orçamento Comprometido</span>
                <span style={{ color: pctComprometido > 90 ? "#ef4444" : "#10b981" }}>{pctComprometido.toFixed(0)}%</span>
              </div>
              <div style={{ background: "#1e293b", borderRadius: 99, height: 6 }}>
                <div style={{
                  width: `${pctComprometido}%`, height: "100%", borderRadius: 99,
                  background: pctComprometido > 90 ? "#ef4444" : pctComprometido > 70 ? "#f59e0b" : "#10b981",
                  transition: "width 0.5s ease"
                }} />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 80px" }}>
          {tab === "dashboard" && (
            <DashboardTab categories={CATEGORIES} icons={CAT_ICONS} colors={CAT_COLORS}
              budgets={budgets} gastosCat={gastosCat}
              onEditBudget={(c) => { setEditBudget(c); setBudgetInput(String(budgets[c]||"")); }}
              fmtBRL={fmtBRL} />
          )}
          {tab === "lancamentos" && (
            <LancamentosTab items={filteredL} filter={filter} setFilter={setFilter}
              onRemove={removeItem} fmtBRL={fmtBRL} catColors={CAT_COLORS} catIcons={CAT_ICONS} />
          )}
          {tab === "graficos" && (
            <GraficosTab categories={CATEGORIES} icons={CAT_ICONS} colors={CAT_COLORS}
              gastosCat={gastosCat} totalDespesas={totalDespesas} fmtBRL={fmtBRL} />
          )}
        </div>

        {/* FAB */}
        <button onClick={() => setShowForm(true)} style={{
          position: "fixed", bottom: 72, right: "calc(50% - 210px + 20px)",
          width: 52, height: 52, borderRadius: 26,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", cursor: "pointer", fontSize: 24, color: "#fff",
          boxShadow: "0 4px 20px rgba(99,102,241,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>＋</button>

        {/* Bottom nav */}
        <div style={{
          position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: 420,
          background: "#0f172a", borderTop: "1px solid #1e293b",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          padding: "8px 0 12px"
        }}>
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "lancamentos", icon: "📝", label: "Lançamentos" },
            { id: "graficos", icon: "📈", label: "Gráficos" }
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              color: tab === item.id ? "#6366f1" : "#475569",
              transition: "color 0.2s"
            }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: tab === item.id ? 700 : 400 }}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Modal: Novo lançamento */}
        {showForm && (
          <Modal title="➕ Novo Lançamento" onClose={() => setShowForm(false)}>
            <FieldRow label="Data">
              <input type="date" value={form.data}
                onChange={e => setForm(f => ({...f, data: e.target.value}))} style={inputStyle} />
            </FieldRow>
            <FieldRow label="Descrição">
              <input placeholder="Ex: Conta de luz" value={form.descricao}
                onChange={e => setForm(f => ({...f, descricao: e.target.value}))} style={inputStyle} />
            </FieldRow>
            <FieldRow label="Tipo">
              <div style={{ display: "flex", gap: 8 }}>
                {["Despesa","Receita"].map(t => (
                  <button key={t} onClick={() => setForm(f => ({...f, tipo: t}))} style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                    background: form.tipo === t ? (t==="Despesa" ? "#ef4444" : "#10b981") : "#1e293b",
                    color: form.tipo === t ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13
                  }}>{t}</button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Categoria">
              <select value={form.categoria}
                onChange={e => setForm(f => ({...f, categoria: e.target.value}))} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Valor (R$)">
              <input type="number" placeholder="0,00" value={form.valor}
                onChange={e => setForm(f => ({...f, valor: e.target.value}))} style={inputStyle} />
            </FieldRow>
            <FieldRow label="Forma de Pagamento">
              <select value={form.formaPagto}
                onChange={e => setForm(f => ({...f, formaPagto: e.target.value}))} style={inputStyle}>
                {FORMAS_PAGTO.map(p => <option key={p}>{p}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Status">
              <div style={{ display: "flex", gap: 8 }}>
                {["Pago","Pendente"].map(s => (
                  <button key={s} onClick={() => setForm(f => ({...f, status: s}))} style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                    background: form.status === s ? "#6366f1" : "#1e293b",
                    color: form.status === s ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13
                  }}>{s}</button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Obs">
              <input placeholder="Observação opcional" value={form.obs}
                onChange={e => setForm(f => ({...f, obs: e.target.value}))} style={inputStyle} />
            </FieldRow>
            <button onClick={addLancamento} style={primaryBtn}>Salvar Lançamento</button>
          </Modal>
        )}

        {/* Modal: Edit budget */}
        {editBudget && (
          <Modal title={`${CAT_ICONS[editBudget]} Orçamento — ${editBudget}`} onClose={() => setEditBudget(null)}>
            <FieldRow label="Orçamento Mensal (R$)">
              <input type="number" value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)} style={inputStyle} autoFocus />
            </FieldRow>
            <button onClick={() => {
              setBudgets(b => ({...b, [editBudget]: parseFloat(budgetInput)||0}));
              setEditBudget(null);
            }} style={primaryBtn}>Salvar</button>
          </Modal>
        )}

        {/* Modal: Receita base */}
        {showReceita && (
          <Modal title="💹 Receita Base do Mês" onClose={() => setShowReceita(false)}>
            <FieldRow label="Receita Total (R$)">
              <input type="number" value={receitaInput}
                onChange={e => setReceitaInput(e.target.value)} style={inputStyle} autoFocus />
            </FieldRow>
            <button onClick={() => {
              setReceita(parseFloat(receitaInput)||0);
              setShowReceita(false);
            }} style={primaryBtn}>Salvar</button>
          </Modal>
        )}
      </div>
    </div>
  );
}

// ── Sub-telas ──────────────────────────────────────────────────────────────

function DashboardTab({ categories, icons, colors, budgets, gastosCat, onEditBudget, fmtBRL }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
        RESUMO POR CATEGORIA
      </div>
      {categories.map(cat => {
        const orcamento = budgets[cat] || 0;
        const gasto = gastosCat[cat] || 0;
        const pct = orcamento > 0 ? Math.min(100, (gasto / orcamento) * 100) : 0;
        const overBudget = orcamento > 0 && gasto > orcamento;
        return (
          <div key={cat} style={{
            background: "#1e293b", borderRadius: 14, padding: "14px 16px",
            marginBottom: 10, border: `1px solid ${overBudget ? "#ef4444" : "#2d3748"}`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, background: colors[cat] + "22",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                }}>{icons[cat]}</span>
                <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 13 }}>{cat}</span>
              </div>
              <button onClick={() => onEditBudget(cat)} style={{
                background: "#0f172a", border: "1px solid #334155",
                borderRadius: 6, padding: "3px 8px", color: "#64748b",
                fontSize: 10, cursor: "pointer"
              }}>
                {orcamento > 0 ? `Orç: ${fmtBRL(orcamento)}` : "Definir orçamento"}
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
              <span style={{ color: "#94a3b8" }}>Gasto: <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{fmtBRL(gasto)}</span></span>
              {orcamento > 0 && (
                <span style={{ color: overBudget ? "#ef4444" : "#10b981", fontWeight: 700 }}>
                  {overBudget ? `▲ ${fmtBRL(gasto-orcamento)}` : `▼ ${fmtBRL(orcamento-gasto)}`}
                </span>
              )}
            </div>
            {orcamento > 0 && (
              <div style={{ background: "#0f172a", borderRadius: 99, height: 5 }}>
                <div style={{
                  width: `${pct}%`, height: "100%", borderRadius: 99,
                  background: overBudget ? "#ef4444" : colors[cat],
                  transition: "width 0.4s"
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function LancamentosTab({ items, filter, setFilter, onRemove, fmtBRL, catColors, catIcons }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {["Todos","Despesa","Receita"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12,
            background: filter === f ? "#6366f1" : "#1e293b",
            color: filter === f ? "#fff" : "#64748b"
          }}>{f}</button>
        ))}
      </div>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 14 }}>Nenhum lançamento neste mês.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Toque em ＋ para adicionar</div>
        </div>
      ) : items.map(l => (
        <div key={l.id} style={{
          background: "#1e293b", borderRadius: 14, padding: "12px 16px",
          marginBottom: 10, display: "flex", alignItems: "center", gap: 12,
          borderLeft: `4px solid ${l.tipo === "Receita" ? "#10b981" : catColors[l.categoria] || "#6366f1"}`
        }}>
          <span style={{ fontSize: 22 }}>{catIcons[l.categoria] || "💸"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{l.descricao}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
              {l.categoria} • {l.formaPagto} • {new Date(l.data+"T00:00:00").toLocaleDateString("pt-BR")}
            </div>
            <span style={{
              fontSize: 9, background: l.status === "Pago" ? "#10b98122" : "#f59e0b22",
              color: l.status === "Pago" ? "#10b981" : "#f59e0b",
              borderRadius: 4, padding: "1px 5px", fontWeight: 700
            }}>{l.status}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: l.tipo === "Receita" ? "#10b981" : "#f87171" }}>
              {l.tipo === "Receita" ? "+" : "-"}{fmtBRL(parseFloat(l.valor))}
            </div>
            <button onClick={() => onRemove(l.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#475569", fontSize: 14, marginTop: 4
            }}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function GraficosTab({ categories, icons, colors, gastosCat, totalDespesas, fmtBRL }) {
  const sorted = [...categories].sort((a,b) => (gastosCat[b]||0)-(gastosCat[a]||0));
  const max = sorted[0] ? gastosCat[sorted[0]] || 1 : 1;
  return (
    <div>
      <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>
        GASTOS POR CATEGORIA
      </div>
      {totalDespesas === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#475569" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📊</div>
          <div>Adicione despesas para ver os gráficos.</div>
        </div>
      ) : (
        <>
          {/* Donut visual */}
          <div style={{ background: "#1e293b", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {sorted.filter(c => gastosCat[c] > 0).map(cat => {
                const pct = ((gastosCat[cat]||0) / totalDespesas * 100).toFixed(1);
                return (
                  <div key={cat} style={{
                    background: colors[cat] + "22", borderRadius: 8, padding: "8px 12px",
                    border: `1px solid ${colors[cat]}44`, flex: "1 0 calc(50% - 4px)"
                  }}>
                    <div style={{ fontSize: 13 }}>{icons[cat]} <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{cat}</span></div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: colors[cat], marginTop: 2 }}>{pct}%</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{fmtBRL(gastosCat[cat]||0)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Horizontal bars */}
          <div style={{ background: "#1e293b", borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              RANKING
            </div>
            {sorted.filter(c => gastosCat[c] > 0).map(cat => (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8" }}>{icons[cat]} {cat}</span>
                  <span style={{ color: "#f1f5f9", fontWeight: 700 }}>{fmtBRL(gastosCat[cat]||0)}</span>
                </div>
                <div style={{ background: "#0f172a", borderRadius: 99, height: 8 }}>
                  <div style={{
                    width: `${((gastosCat[cat]||0)/max)*100}%`, height: "100%", borderRadius: 99,
                    background: colors[cat], transition: "width 0.4s"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100
    }} onClick={onClose}>
      <div style={{
        background: "#0f172a", borderRadius: "20px 20px 0 0",
        padding: "20px 20px 32px", width: "100%", maxWidth: 420,
        maxHeight: "90vh", overflowY: "auto",
        border: "1px solid #1e293b"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>{title}</span>
          <button onClick={onClose} style={{ background: "#1e293b", border: "none", color: "#94a3b8", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 5, letterSpacing: 0.5 }}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", background: "#1e293b", border: "1px solid #334155",
  borderRadius: 10, padding: "10px 14px", color: "#f1f5f9", fontSize: 14,
  outline: "none", boxSizing: "border-box"
};

const primaryBtn = {
  width: "100%", padding: "14px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  border: "none", borderRadius: 12, color: "#fff", fontWeight: 800,
  fontSize: 15, cursor: "pointer", marginTop: 8, letterSpacing: 0.5
};

const arrowBtn = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
  color: "#94a3b8", width: 32, height: 32, cursor: "pointer", fontSize: 18,
  display: "flex", alignItems: "center", justifyContent: "center"
};

const kpiCard = (color) => ({
  background: color + "15", borderRadius: 12, padding: "12px 14px",
  border: `1px solid ${color}30`
});