import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

import {
  BUSINESS_CATEGORIES,
  BUSINESS_CAT_ICONS,
  BUSINESS_CAT_COLORS,
  BUSINESS_PAGTO,
  MESES,
  fmtBRL,
  todayStr,
  lastDayOfMonth,
} from "../constants";
import { arrowBtn, kpiCard, fabStyle } from "../styles";

import LoadingOverlay from "./LoadingOverlay";
import Toast from "./Toast";
import ModeToggle from "./ModeToggle";

import BusinessLancamentosTab from "./tabs/BusinessLancamentosTab";
import BusinessDashboardTab from "./tabs/BusinessDashboardTab";

import BusinessLancamentoModal from "../modals/BusinessLancamentoModal";

const todayDate = new Date();

export default function BusinessApp({ userId, modo, setModo }) {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [tab, setTab] = useState("lancamentos");
  const [mes, setMes] = useState(todayDate.getMonth());
  const [ano, setAno] = useState(todayDate.getFullYear());

  const [lancamentos, setLancamentos] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("Todos");

  const defaultForm = {
    data: todayStr,
    descricao: "",
    categoria: BUSINESS_CATEGORIES[0],
    valor: "",
    tipo: "Receita",
    formaPagto: "Pix",
    obs: "",
  };
  const [form, setForm] = useState(defaultForm);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Carrega dados do mês ──────────────────────────────────
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const mesDb = mes + 1;
      const inicio = `${ano}-${String(mesDb).padStart(2, "0")}-01`;
      const fim = lastDayOfMonth(ano, mesDb);

      const { data, error } = await supabase
        .from("lancamentos_negocio")
        .select("*")
        .eq("user_id", userId)
        .gte("data", inicio)
        .lte("data", fim)
        .order("data", { ascending: false });

      if (error) throw error;
      setLancamentos(data || []);
    } catch (e) {
      showToast("Erro ao carregar dados: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [userId, mes, ano]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Derivados ─────────────────────────────────────────────
  const totalReceitas = useMemo(
    () =>
      lancamentos
        .filter((l) => l.tipo === "Receita")
        .reduce((s, l) => s + parseFloat(l.valor || 0), 0),
    [lancamentos]
  );

  const totalDespesas = useMemo(
    () =>
      lancamentos
        .filter((l) => l.tipo === "Despesa")
        .reduce((s, l) => s + parseFloat(l.valor || 0), 0),
    [lancamentos]
  );

  const lucro = totalReceitas - totalDespesas;

  const receitasCat = useMemo(() => {
    const g = Object.fromEntries(BUSINESS_CATEGORIES.map((c) => [c, 0]));
    lancamentos
      .filter((l) => l.tipo === "Receita")
      .forEach((l) => {
        g[l.categoria] = (g[l.categoria] || 0) + parseFloat(l.valor || 0);
      });
    return g;
  }, [lancamentos]);

  const despesasCat = useMemo(() => {
    const g = Object.fromEntries(BUSINESS_CATEGORIES.map((c) => [c, 0]));
    lancamentos
      .filter((l) => l.tipo === "Despesa")
      .forEach((l) => {
        g[l.categoria] = (g[l.categoria] || 0) + parseFloat(l.valor || 0);
      });
    return g;
  }, [lancamentos]);

  const recebimentosPorPagto = useMemo(() => {
    const g = Object.fromEntries(BUSINESS_PAGTO.map((p) => [p, 0]));
    lancamentos
      .filter((l) => l.tipo === "Receita")
      .forEach((l) => {
        g[l.forma_pagto] = (g[l.forma_pagto] || 0) + parseFloat(l.valor || 0);
      });
    return g;
  }, [lancamentos]);

  const filteredL = useMemo(() => {
    if (filter === "Todos") return lancamentos;
    return lancamentos.filter((l) => l.tipo === filter);
  }, [lancamentos, filter]);

  // ── INSERT lançamento ─────────────────────────────────────
  async function addLancamento() {
    if (!form.descricao || !form.valor) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lancamentos_negocio")
        .insert({
          user_id: userId,
          data: form.data,
          descricao: form.descricao,
          categoria: form.categoria,
          valor: parseFloat(form.valor),
          tipo: form.tipo,
          forma_pagto: form.formaPagto,
          obs: form.obs || null,
        })
        .select()
        .single();
      if (error) throw error;

      // Só insere no estado se a data estiver no mês visualizado
      const mesDb = mes + 1;
      const inicio = `${ano}-${String(mesDb).padStart(2, "0")}-01`;
      const fim = lastDayOfMonth(ano, mesDb);
      if (data.data >= inicio && data.data <= fim) {
        setLancamentos((prev) => [data, ...prev]);
      }
      setForm(defaultForm);
      setShowForm(false);
      setTab("lancamentos");
      showToast("Lançamento salvo!");
    } catch (e) {
      showToast("Erro ao salvar: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  // ── DELETE lançamento ─────────────────────────────────────
  async function removeLancamento(id) {
    setLancamentos((prev) => prev.filter((l) => l.id !== id));
    const { error } = await supabase
      .from("lancamentos_negocio")
      .delete()
      .eq("id", id);
    if (error) {
      showToast("Erro ao remover: " + error.message, "error");
      loadData();
    } else showToast("Lançamento removido.");
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
            background: "linear-gradient(135deg,#064e3b 0%,#0f172a 100%)",
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
              <div style={{ fontSize: 12, color: "#6ee7b7", letterSpacing: 1 }}>
                🏢 NEGÓCIOS
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
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 8,
              marginTop: 14,
            }}
          >
            <div style={kpiCard("#10b981")}>
              <div style={{ fontSize: 10, color: "#6ee7b7", marginBottom: 2 }}>
                💹 RECEITA
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                {fmtBRL(totalReceitas)}
              </div>
            </div>
            <div style={kpiCard("#ef4444")}>
              <div style={{ fontSize: 10, color: "#fca5a5", marginBottom: 2 }}>
                🔴 DESPESA
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                {fmtBRL(totalDespesas)}
              </div>
            </div>
            <div style={kpiCard(lucro >= 0 ? "#3b82f6" : "#f97316")}>
              <div
                style={{
                  fontSize: 10,
                  color: lucro >= 0 ? "#93c5fd" : "#fdba74",
                  marginBottom: 2,
                }}
              >
                {lucro >= 0 ? "📈 LUCRO" : "📉 PREJ."}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
                {fmtBRL(lucro)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Conteúdo ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 90px" }}>
          {tab === "lancamentos" && (
            <BusinessLancamentosTab
              items={filteredL}
              filter={filter}
              setFilter={setFilter}
              onRemove={removeLancamento}
              catIcons={BUSINESS_CAT_ICONS}
            />
          )}
          {tab === "dashboard" && (
            <BusinessDashboardTab
              categories={BUSINESS_CATEGORIES}
              icons={BUSINESS_CAT_ICONS}
              colors={BUSINESS_CAT_COLORS}
              receitasCat={receitasCat}
              despesasCat={despesasCat}
              totalReceitas={totalReceitas}
              totalDespesas={totalDespesas}
              recebimentosPorPagto={recebimentosPorPagto}
            />
          )}
        </div>

        {/* ── FAB (só aparece na aba Lançamentos) ── */}
        {tab === "lancamentos" && (
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
            <button
              onClick={() => setShowForm(true)}
              style={fabStyle("#10b981", "#059669")}
            >
              ＋
            </button>
          </div>
        )}

        {/* ── Bottom Nav (2 abas) ── */}
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
            gridTemplateColumns: "1fr 1fr",
            padding: "8px 0 12px",
          }}
        >
          {[
            { id: "lancamentos", icon: "📝", label: "Lançamentos" },
            { id: "dashboard", icon: "📊", label: "Dashboard" },
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
                color: tab === item.id ? "#10b981" : "#475569",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: tab === item.id ? 700 : 400 }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* ── Modais ── */}
        {showForm && (
          <BusinessLancamentoModal
            form={form}
            setForm={setForm}
            onSave={addLancamento}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}
