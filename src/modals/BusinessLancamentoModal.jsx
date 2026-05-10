import Modal from "../components/Modal";
import FieldRow from "../components/FieldRow";
import { BUSINESS_CATEGORIES, BUSINESS_PAGTO } from "../constants";
import { inputStyle, primaryBtn } from "../styles";

export default function BusinessLancamentoModal({ form, setForm, onSave, onClose }) {
  return (
    <Modal title="🏢 Novo Lançamento — Negócios" onClose={onClose}>
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
          placeholder="Ex: Venda do dia / Compra de mercadoria"
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <FieldRow label="Tipo">
        <div style={{ display: "flex", gap: 8 }}>
          {["Receita", "Despesa"].map((t) => (
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
                    ? t === "Receita"
                      ? "#10b981"
                      : "#ef4444"
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
          {BUSINESS_CATEGORIES.map((c) => (
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

      <FieldRow label="Forma de Recebimento / Pagamento">
        <select
          value={form.formaPagto}
          onChange={(e) => setForm((f) => ({ ...f, formaPagto: e.target.value }))}
          style={inputStyle}
        >
          {BUSINESS_PAGTO.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="Obs">
        <input
          placeholder="Observação opcional"
          value={form.obs}
          onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <button
        onClick={onSave}
        style={{
          ...primaryBtn,
          background: "linear-gradient(135deg,#10b981,#059669)",
        }}
      >
        Salvar Lançamento
      </button>
    </Modal>
  );
}
