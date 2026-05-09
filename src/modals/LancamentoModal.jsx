import Modal from "../components/Modal";
import FieldRow from "../components/FieldRow";
import { CATEGORIES, FORMAS_PAGTO, addMonths } from "../constants";
import { inputStyle, primaryBtn } from "../styles";

export default function LancamentoModal({ form, setForm, onSave, onClose }) {
  return (
    <Modal title="➕ Novo Lançamento" onClose={onClose}>
      <FieldRow label="Data">
        <input
          type="date"
          value={form.data}
          onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <FieldRow label="Descrição">
        <input
          placeholder="Ex: Conta de luz"
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <FieldRow label="Tipo">
        <div style={{ display: "flex", gap: 8 }}>
          {["Despesa", "Receita"].map((t) => (
            <button
              key={t}
              onClick={() => setForm((f) => ({ ...f, tipo: t }))}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background:
                  form.tipo === t
                    ? t === "Despesa"
                      ? "#ef4444"
                      : "#10b981"
                    : "#1e293b",
                color: form.tipo === t ? "#fff" : "#64748b",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </FieldRow>

      <FieldRow label="Categoria">
        <select
          value={form.categoria}
          onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
          style={inputStyle}
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="Valor (R$)">
        <input
          type="number"
          placeholder="0,00"
          value={form.valor}
          onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <FieldRow label="Forma de Pagamento">
        <select
          value={form.formaPagto}
          onChange={(e) => setForm((f) => ({ ...f, formaPagto: e.target.value }))}
          style={inputStyle}
        >
          {FORMAS_PAGTO.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="Status">
        <div style={{ display: "flex", gap: 8 }}>
          {["Pago", "Pendente"].map((s) => (
            <button
              key={s}
              onClick={() => setForm((f) => ({ ...f, status: s }))}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: form.status === s ? "#6366f1" : "#1e293b",
                color: form.status === s ? "#fff" : "#64748b",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </FieldRow>

      {form.status === "Pendente" && (
        <FieldRow label="📅 Data prevista de pagamento">
          <input
            type="date"
            value={form.dataPagamento}
            onChange={(e) =>
              setForm((f) => ({ ...f, dataPagamento: e.target.value }))
            }
            style={{ ...inputStyle, borderColor: "#f59e0b" }}
          />
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
            O app vai te notificar quando a data chegar ou passar.
          </div>
        </FieldRow>
      )}

      <FieldRow label="🔁 Lançamento Recorrente">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            onClick={() => setForm((f) => ({ ...f, recorrente: !f.recorrente }))}
            style={{
              width: 44,
              height: 24,
              borderRadius: 99,
              cursor: "pointer",
              background: form.recorrente ? "#6366f1" : "#334155",
              position: "relative",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: form.recorrente ? 23 : 3,
                width: 18,
                height: 18,
                borderRadius: 99,
                background: "#fff",
                transition: "left 0.2s",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 13,
              color: form.recorrente ? "#a5b4fc" : "#64748b",
            }}
          >
            {form.recorrente ? "Ativado" : "Desativado"}
          </span>
        </div>

        {form.recorrente && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: 10,
              padding: "12px 14px",
              border: "1px solid #6366f144",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#a5b4fc",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              Por quantos meses repetir?
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              {[2, 3, 6, 12, 24].map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    setForm((f) => ({ ...f, mesesRecorrencia: n }))
                  }
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    background:
                      form.mesesRecorrencia === n ? "#6366f1" : "#0f172a",
                    color: form.mesesRecorrencia === n ? "#fff" : "#64748b",
                  }}
                >
                  {n}x
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="number"
                min="1"
                max="120"
                value={form.mesesRecorrencia}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    mesesRecorrencia: parseInt(e.target.value) || 1,
                  }))
                }
                style={{ ...inputStyle, width: 70, textAlign: "center" }}
              />
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                meses no total
              </span>
            </div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 8 }}>
              De{" "}
              {new Date(form.data + "T00:00:00").toLocaleDateString("pt-BR")} até{" "}
              {new Date(
                addMonths(form.data, form.mesesRecorrencia - 1) + "T00:00:00"
              ).toLocaleDateString("pt-BR")}
            </div>
          </div>
        )}
      </FieldRow>

      <FieldRow label="Obs">
        <input
          placeholder="Observação opcional"
          value={form.obs}
          onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <button onClick={onSave} style={primaryBtn}>
        {form.recorrente
          ? `Salvar ${form.mesesRecorrencia} lançamentos recorrentes`
          : "Salvar Lançamento"}
      </button>
    </Modal>
  );
}
