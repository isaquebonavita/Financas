import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

import {
  CATEGORIES,
  INV_CATEGORIES,
  CAT_ICONS,
  CAT_COLORS,
  INV_ICONS,
  INV_COLORS,
  MESES,
  fmtBRL,
  todayStr,
  addMonths,
  lastDayOfMonth,
} from "../constants";
import { arrowBtn, kpiCard, fabStyle } from "../styles";

import LoadingOverlay from "./LoadingOverlay";
import Toast from "./Toast";
import ModeToggle from "./ModeToggle";

import DashboardTab from "./tabs/DashboardTab";
import LancamentosTab from "./tabs/LancamentosTab";
import InvestimentosTab from "./tabs/InvestimentosTab";
import GraficosTab from "./tabs/GraficosTab";

import LancamentoModal from "../modals/LancamentoModal";
import InvestimentoModal from "../modals/InvestimentoModal";
import OrcamentoModal from "../modals/OrcamentoModal";
import ReceitaModal from "../modals/ReceitaModal";

const today = new Date();

export default function MainApp({ userId, modo, setModo }) {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [tab, setTab] = useState("dashboard");
  const [mes, setMes] = useState(today.getMonth());
  const [ano, setAno] = useState(today.getFullYear());

  const [lancamentos, setLancamentos] = useState([]);
  const [investimentos, setInvestimentos] = useState([]);
  const [budgets, setBudgets] = useState(
    Object.fromEntries(CATEGORIES.map((c) => [c, 0]))
  );
  const [receita, setReceita] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [showInvForm, setShowInvForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [showReceita, setShowReceita] = useState(false);
  const [receitaInput, setReceitaInput] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [notifications, setNotifications] = useState([]);

  const defaultForm = {
    data: todayStr,
    descricao: "",
    categoria: CATEGORIES[0],
    valor: "",
    tipo: "Despesa",
    formaPagto: "Pix",
    status: "Pago",
    obs: "",
    recorrente: false,
    mesesRecorrencia: 1,
    dataPagamento: "",
  };
  const [form, setForm] = useState(defaultForm);

  const defaultInvForm = {
    data: todayStr,
    descricao: "",
    categoria: INV_CATEGORIES[0],
    valor: "",
    instituicao: "",
    obs: "",
    descontaSaldo: true,
  };
  const [invForm, setInvForm] = useState(defaultInvForm);

  // ── Helpers ──────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Carrega dados do mês quando muda mês/ano/userId ───────
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const mesDb = mes + 1; // Supabase usa 1-12
      const inicio = `${ano}-${String(mesDb).padStart(2, "0")}-01`;
      const fim = lastDayOfMonth(ano, mesDb);

      const [lancRes, invRes, orcRes, perfRes] = await Promise.all([
        supabase
          .from("lancamentos")
          .select("*")
          .eq("user_id", userId)
          .gte("data", inicio)
          .lte("data", fim)
          .order("data", { ascending: false }),

        supabase
          .from("investimentos")
          .select("*")
          .eq("user_id", userId)
          .gte("data", inicio)
          .lte("data", fim)
          .order("data", { ascending: false }),

        supabase
          .from("orcamentos")
          .select("*")
          .eq("user_id", userId)
          .eq("mes", mesDb)
          .eq("ano", ano),

        supabase
          .from("perfil_mensal")
          .select("*")
          .eq("user_id", userId)
          .eq("mes", mesDb)
          .eq("ano", ano)
          .maybeSingle(),
      ]);

      if (lancRes.error) throw lancRes.error;
      if (invRes.error) throw invRes.error;
      if (orcRes.error) throw orcRes.error;
      if (perfRes.error) throw perfRes.error;

      setLancamentos(lancRes.data || []);
      setInvestimentos(invRes.data || []);
      setReceita(perfRes.data?.receita_base || 0);
      setReceitaInput(String(perfRes.data?.receita_base || ""));

      const bMap = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
      (orcRes.data || []).forEach((o) => {
        bMap[o.categoria] = parseFloat(o.valor) || 0;
      });
      setBudgets(bMap);
    } catch (e) {
      showToast("Erro ao carregar dados: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [userId, mes, ano]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Notificações de vencimento ────────────────────────────
  useEffect(() => {
    const overdue = lancamentos.filter(
      (l) =>
        l.status === "Pendente" && l.data_pagamento && l.data_pagamento <= todayStr
    );
    setNotifications(
      overdue.map((l) => ({
        id: l.id,
        descricao: l.descricao,
        valor: l.valor,
        data_pagamento: l.data_pagamento,
      }))
    );
  }, [lancamentos]);

  // ── Derivados ─────────────────────────────────────────────
  const totalDespesas = useMemo(
    () =>
      lancamentos
        .filter((l) => l.tipo === "Despesa")
        .reduce((s, l) => s + parseFloat(l.valor || 0), 0),
    [lancamentos]
  );

  const totalReceitas = useMemo(
    () =>
      lancamentos
        .filter((l) => l.tipo === "Receita")
        .reduce((s, l) => s + parseFloat(l.valor || 0), 0) + receita,
    [lancamentos, receita]
  );

  const totalInvestido = useMemo(
    () => investimentos.reduce((s, i) => s + parseFloat(i.valor || 0), 0),
    [investimentos]
  );

  // Apenas os investimentos marcados como "desconta_saldo" entram no cálculo
  // do saldo disponível. Os demais são registros informativos.
  const totalInvestidoQueDesconta = useMemo(
    () =>
      investimentos
        .filter((i) => i.desconta_saldo !== false) // default true (compat)
        .reduce((s, i) => s + parseFloat(i.valor || 0), 0),
    [investimentos]
  );

  const saldo = totalReceitas - totalDespesas - totalInvestidoQueDesconta;

  const gastosCat = useMemo(() => {
    const g = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
    lancamentos
      .filter((l) => l.tipo === "Despesa")
      .forEach((l) => {
        g[l.categoria] = (g[l.categoria] || 0) + parseFloat(l.valor || 0);
      });
    return g;
  }, [lancamentos]);

  const gastosCatInv = useMemo(() => {
    const g = Object.fromEntries(INV_CATEGORIES.map((c) => [c, 0]));
    investimentos.forEach((i) => {
      g[i.categoria] = (g[i.categoria] || 0) + parseFloat(i.valor || 0);
    });
    return g;
  }, [investimentos]);

  const totalOrcamento = CATEGORIES.reduce((s, c) => s + (budgets[c] || 0), 0);
  const pctComprometido =
    totalOrcamento > 0 ? Math.min(100, (totalDespesas / totalOrcamento) * 100) : 0;
  const pendentes = lancamentos.filter((l) => l.status === "Pendente").length;

  const filteredL = useMemo(() => {
    if (filter === "Todos") return lancamentos;
    return lancamentos.filter((l) => l.tipo === filter);
  }, [lancamentos, filter]);

  // ── INSERT lançamentos (com recorrência) ──────────────────
  async function addLancamento() {
    if (!form.descricao || !form.valor) return;
    setLoading(true);
    try {
      const grupoId = form.recorrente ? crypto.randomUUID() : null;
      const mesesCount = form.recorrente
        ? Math.max(1, parseInt(form.mesesRecorrencia) || 1)
        : 1;

      const rows = Array.from({ length: mesesCount }, (_, i) => ({
        user_id: userId,
        data: addMonths(form.data, i),
        descricao: form.descricao,
        categoria: form.categoria,
        valor: parseFloat(form.valor),
        tipo: form.tipo,
        forma_pagto: form.formaPagto,
        status: i === 0 ? form.status : "Pendente",
        obs: form.obs || null,
        data_pagamento:
          form.status === "Pendente" && form.dataPagamento
            ? addMonths(form.dataPagamento, i)
            : i === 0 && form.dataPagamento
            ? form.dataPagamento
            : null,
        recorrente: form.recorrente,
        grupo_recorrencia: grupoId,
        parcela_atual: form.recorrente ? i + 1 : null,
        total_parcelas: form.recorrente ? mesesCount : null,
      }));

      const { data, error } = await supabase
        .from("lancamentos")
        .insert(rows)
        .select();
      if (error) throw error;

      // Só injeta no estado os lançamentos cuja data está no mês visualizado.
      // Sem isso, criar uma recorrência de 3 parcelas faria os 3 valores
      // aparecerem somados no mês atual até o usuário recarregar.
      const mesDb = mes + 1;
      const inicio = `${ano}-${String(mesDb).padStart(2, "0")}-01`;
      const fim = lastDayOfMonth(ano, mesDb);
      const dataDoMes = data.filter((l) => l.data >= inicio && l.data <= fim);

      setLancamentos((prev) => [...dataDoMes, ...prev]);
      setForm(defaultForm);
      setShowForm(false);
      setTab("lancamentos");
      showToast(
        form.recorrente ? `${mesesCount} lançamentos criados!` : "Lançamento salvo!"
      );
    } catch (e) {
      showToast("Erro ao salvar: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ── INSERT investimento ───────────────────────────────────
  async function addInvestimento() {
    if (!invForm.descricao || !invForm.valor) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("investimentos")
        .insert({
          user_id: userId,
          data: invForm.data,
          descricao: invForm.descricao,
          categoria: invForm.categoria,
          valor: parseFloat(invForm.valor),
          instituicao: invForm.instituicao || null,
          obs: invForm.obs || null,
          desconta_saldo: invForm.descontaSaldo !== false,
        })
        .select()
        .single();
      if (error) throw error;

      // Só insere no estado se a data do investimento estiver no mês visualizado
      const mesDb = mes + 1;
      const inicio = `${ano}-${String(mesDb).padStart(2, "0")}-01`;
      const fim = lastDayOfMonth(ano, mesDb);
      if (data.data >= inicio && data.data <= fim) {
        setInvestimentos((prev) => [data, ...prev]);
      }
      setInvForm(defaultInvForm);
      setShowInvForm(false);
      setTab("investimentos");
      showToast("Investimento salvo!");
    } catch (e) {
      showToast("Erro ao salvar: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ── DELETE lançamento único ───────────────────────────────
  async function removeLancamento(id) {
    setLancamentos((prev) => prev.filter((l) => l.id !== id)); // optimistic
    const { error } = await supabase.from("lancamentos").delete().eq("id", id);
    if (error) {
      showToast("Erro ao remover: " + error.message, "error");
      loadData();
    } else showToast("Lançamento removido.");
  }

  // ── DELETE grupo recorrente ───────────────────────────────
  async function removeGrupo(grupoId) {
    setLancamentos((prev) =>
      prev.filter((l) => l.grupo_recorrencia !== grupoId)
    ); // optimistic
    const { error } = await supabase
      .from("lancamentos")
      .delete()
      .eq("grupo_recorrencia", grupoId);
    if (error) {
      showToast("Erro ao remover grupo: " + error.message, "error");
      loadData();
    } else showToast("Série de recorrências removida.");
  }

  // ── DELETE investimento ───────────────────────────────────
  async function removeInvestimento(id) {
    setInvestimentos((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from("investimentos").delete().eq("id", id);
    if (error) {
      showToast("Erro ao remover: " + error.message, "error");
      loadData();
    } else showToast("Investimento removido.");
  }

  // ── UPDATE marcar como pago ───────────────────────────────
  async function confirmarPagamento(id) {
    setLancamentos((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status: "Pago", data_pagamento: null } : l
      )
    );
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const { error } = await supabase
      .from("lancamentos")
      .update({ status: "Pago", data_pagamento: null })
      .eq("id", id);
    if (error) {
      showToast("Erro ao atualizar: " + error.message, "error");
      loadData();
    } else showToast("Pagamento confirmado! ✅");
  }

  // ── UPSERT orçamento ──────────────────────────────────────
  async function saveOrcamento() {
    const valor = parseFloat(budgetInput) || 0;
    const mesDb = mes + 1;
    setBudgets((b) => ({ ...b, [editBudget]: valor }));
    const cat = editBudget;
    setEditBudget(null);
    const { error } = await supabase.from("orcamentos").upsert(
      { user_id: userId, mes: mesDb, ano, categoria: cat, valor },
      { onConflict: "user_id,mes,ano,categoria" }
    );
    if (error) showToast("Erro ao salvar orçamento: " + error.message, "error");
    else showToast("Orçamento atualizado!");
  }

  // ── UPSERT receita base ───────────────────────────────────
  async function saveReceita() {
    const valor = parseFloat(receitaInput) || 0;
    const mesDb = mes + 1;
    setReceita(valor);
    setShowReceita(false);
    const { error } = await supabase.from("perfil_mensal").upsert(
      { user_id: userId, mes: mesDb, ano, receita_base: valor },
      { onConflict: "user_id,mes,ano" }
    );
    if (error) showToast("Erro ao salvar receita: " + error.message, "error");
    else showToast("Receita base salva!");
  }

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div
      style={{
        fontFamily: "'Nunito','Segoe UI',sans-serif",
        background: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          minHeight: "100vh",
          background: "#0f172a",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {loading && <LoadingOverlay />}
        {toast && <Toast msg={toast.msg} type={toast.type} />}

        {/* ── Header ── */}
        <div
          style={{
            background: "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
            padding: "16px 20px 20px",
            borderBottom: "1px solid #1e293b",
          }}
        >
          {/* Toggle Pessoal/Negócio */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <ModeToggle modo={modo} onChange={setModo} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#64748b", letterSpacing: 1 }}>
                💰 CONTROLE DE GASTOS
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>
                {MESES[mes]} {ano}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={() => {
                  if (mes === 0) {
                    setMes(11);
                    setAno((a) => a - 1);
                  } else setMes((m) => m - 1);
                }}
                style={arrowBtn}
              >
                ‹
              </button>
              <button
                onClick={() => {
                  if (mes === 11) {
                    setMes(0);
                    setAno((a) => a + 1);
                  } else setMes((m) => m + 1);
                }}
                style={arrowBtn}
              >
                ›
              </button>
              <button
                onClick={() => supabase.auth.signOut()}
                title="Sair"
                style={{ ...arrowBtn, fontSize: 14 }}
              >
                🚪
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginTop: 14,
            }}
          >
            <div style={kpiCard("#10b981")}>
              <div style={{ fontSize: 10, color: "#6ee7b7", marginBottom: 2 }}>
                💹 RECEITA
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                {fmtBRL(totalReceitas)}
              </div>
              <button
                onClick={() => setShowReceita(true)}
                style={{
                  fontSize: 9,
                  color: "#6ee7b7",
                  marginTop: 2,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                + definir receita base
              </button>
            </div>
            <div style={kpiCard("#ef4444")}>
              <div style={{ fontSize: 10, color: "#fca5a5", marginBottom: 2 }}>
                🔴 DESPESAS
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                {fmtBRL(totalDespesas)}
              </div>
            </div>
            <div style={kpiCard("#f59e0b")}>
              <div style={{ fontSize: 10, color: "#fcd34d", marginBottom: 2 }}>
                📈 INVESTIDO
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                {fmtBRL(totalInvestido)}
              </div>
            </div>
            <div style={kpiCard(saldo >= 0 ? "#3b82f6" : "#f97316")}>
              <div
                style={{
                  fontSize: 10,
                  color: saldo >= 0 ? "#93c5fd" : "#fdba74",
                  marginBottom: 2,
                }}
              >
                💰 SALDO
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
                {fmtBRL(saldo)}
              </div>
            </div>
          </div>

          {pendentes > 0 && (
            <div
              style={{
                marginTop: 10,
                background: "#f59e0b18",
                border: "1px solid #f59e0b44",
                borderRadius: 10,
                padding: "7px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, color: "#fcd34d" }}>
                ⏳ {pendentes} pagamento{pendentes > 1 ? "s" : ""} pendente
                {pendentes > 1 ? "s" : ""}
              </span>
              <button
                onClick={() => {
                  setTab("lancamentos");
                  setFilter("Todos");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f59e0b",
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Ver →
              </button>
            </div>
          )}

          {totalOrcamento > 0 && (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "#64748b",
                  marginBottom: 4,
                }}
              >
                <span>% Orçamento Comprometido</span>
                <span
                  style={{
                    color: pctComprometido > 90 ? "#ef4444" : "#10b981",
                  }}
                >
                  {pctComprometido.toFixed(0)}%
                </span>
              </div>
              <div
                style={{
                  background: "#1e293b",
                  borderRadius: 99,
                  height: 6,
                }}
              >
                <div
                  style={{
                    width: `${pctComprometido}%`,
                    height: "100%",
                    borderRadius: 99,
                    background:
                      pctComprometido > 90
                        ? "#ef4444"
                        : pctComprometido > 70
                        ? "#f59e0b"
                        : "#10b981",
                    transition: "width 0.5s",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Conteúdo ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 90px" }}>
          {tab === "dashboard" && (
            <DashboardTab
              categories={CATEGORIES}
              icons={CAT_ICONS}
              colors={CAT_COLORS}
              budgets={budgets}
              gastosCat={gastosCat}
              onEditBudget={(c) => {
                setEditBudget(c);
                setBudgetInput(String(budgets[c] || ""));
              }}
            />
          )}
          {tab === "lancamentos" && (
            <LancamentosTab
              items={filteredL}
              filter={filter}
              setFilter={setFilter}
              onRemove={removeLancamento}
              onRemoveGrupo={removeGrupo}
              onConfirmarPagamento={confirmarPagamento}
              catIcons={CAT_ICONS}
            />
          )}
          {tab === "investimentos" && (
            <InvestimentosTab
              items={investimentos}
              categorias={INV_CATEGORIES}
              icons={INV_ICONS}
              colors={INV_COLORS}
              gastosCat={gastosCatInv}
              totalInvestido={totalInvestido}
              onRemove={removeInvestimento}
            />
          )}
          {tab === "graficos" && (
            <GraficosTab
              categories={CATEGORIES}
              icons={CAT_ICONS}
              colors={CAT_COLORS}
              gastosCat={gastosCat}
              totalDespesas={totalDespesas}
            />
          )}
        </div>

        {/* ── FAB ── */}
        <div
          style={{
            position: "fixed",
            bottom: 74,
            right: "calc(50% - 210px + 16px)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          {tab === "investimentos" ? (
            <button
              onClick={() => setShowInvForm(true)}
              style={fabStyle("#f59e0b", "#f97316")}
            >
              ＋ Investimento
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              style={fabStyle("#6366f1", "#8b5cf6")}
            >
              ＋
            </button>
          )}
        </div>

        {/* ── Bottom Nav ── */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 420,
            background: "#0f172a",
            borderTop: "1px solid #1e293b",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            padding: "8px 0 12px",
          }}
        >
          {[
            { id: "dashboard", icon: "📊", label: "Dashboard" },
            { id: "lancamentos", icon: "📝", label: "Lançamentos" },
            { id: "investimentos", icon: "📈", label: "Investimentos" },
            { id: "graficos", icon: "🥧", label: "Gráficos" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                color: tab === item.id ? "#6366f1" : "#475569",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontWeight: tab === item.id ? 700 : 400 }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Notificações de vencimento ── */}
        {notifications.slice(0, 1).map((n) => (
          <div
            key={n.id}
            style={{
              position: "fixed",
              bottom: 90,
              left: "50%",
              transform: "translateX(-50%)",
              width: "calc(100% - 40px)",
              maxWidth: 380,
              background: "#1e293b",
              border: "1px solid #f59e0b",
              borderRadius: 14,
              padding: "12px 14px",
              zIndex: 200,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#fcd34d",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              ⏳ Pagamento previsto chegou
            </div>
            <div style={{ fontSize: 13, color: "#f1f5f9", marginBottom: 8 }}>
              <strong>{n.descricao}</strong> — {fmtBRL(parseFloat(n.valor))}{" "}
              <span style={{ color: "#94a3b8", fontSize: 11 }}>
                ({new Date(n.data_pagamento + "T00:00:00").toLocaleDateString(
                  "pt-BR"
                )})
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => confirmarPagamento(n.id)}
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#10b981",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                ✅ Já paguei
              </button>
              <button
                onClick={() =>
                  setNotifications((prev) => prev.filter((x) => x.id !== n.id))
                }
                style={{
                  flex: 1,
                  padding: "8px",
                  background: "#334155",
                  border: "none",
                  borderRadius: 8,
                  color: "#94a3b8",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                ⏳ Ainda não
              </button>
            </div>
            {notifications.length > 1 && (
              <div
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                +{notifications.length - 1} outros vencimentos pendentes
              </div>
            )}
          </div>
        ))}

        {/* ── Modais ── */}
        {showForm && (
          <LancamentoModal
            form={form}
            setForm={setForm}
            onSave={addLancamento}
            onClose={() => setShowForm(false)}
          />
        )}
        {showInvForm && (
          <InvestimentoModal
            form={invForm}
            setForm={setInvForm}
            onSave={addInvestimento}
            onClose={() => setShowInvForm(false)}
          />
        )}
        {editBudget && (
          <OrcamentoModal
            categoria={editBudget}
            valor={budgetInput}
            setValor={setBudgetInput}
            onSave={saveOrcamento}
            onClose={() => setEditBudget(null)}
          />
        )}
        {showReceita && (
          <ReceitaModal
            valor={receitaInput}
            setValor={setReceitaInput}
            onSave={saveReceita}
            onClose={() => setShowReceita(false)}
          />
        )}
      </div>
    </div>
  );
}
