import Modal from "../components/Modal";
import FieldRow from "../components/FieldRow";
import { INV_CATEGORIES } from "../constants";
import { inputStyle, primaryBtn } from "../styles";

export default function InvestimentoModal({ form, setForm, onSave, onClose }) {
  return (
    <Modal title="📈 Novo Investimento" onClose={onClose}>
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
          placeholder="Ex: Tesouro Selic 2026"
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <FieldRow label="Categoria">
        <select
          value={form.categoria}
          onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
          style={inputStyle}
        >
          {INV_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="Valor Aplicado (R$)">
        <input
          type="number"
          placeholder="0,00"
          value={form.valor}
          onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <FieldRow label="Instituição">
        <input
          placeholder="Ex: Nubank, XP, Rico..."
          value={form.instituicao}
          onChange={(e) =>
            setForm((f) => ({ ...f, instituicao: e.target.value }))
          }
          style={inputStyle}
        />
      </FieldRow>

      <FieldRow label="Obs">
        <input
          placeholder="Observação opcional"
          value={form.obs}
          onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
          style={inputStyle}
        />
      </FieldRow>

      <FieldRow label="💰 Descontar do saldo do mês?">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <div
            onClick={() =>
              setForm((f) => ({ ...f, descontaSaldo: !f.descontaSaldo }))
            }
            style={{
              width: 44,
              height: 24,
              borderRadius: 99,
              cursor: "pointer",
              background: form.descontaSaldo ? "#f59e0b" : "#334155",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: form.descontaSaldo ? 23 : 3,
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
              fontSize: 12,
              color: form.descontaSaldo ? "#fcd34d" : "#64748b",
            }}
          >
            {form.descontaSaldo
              ? "Sim — abate do saldo disponível"
              : "Não — apenas registro informativo"}
          </span>
        </div>
        <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
          Use "Não" quando o dinheiro investido não veio do saldo do mês
          (ex: aporte de outra conta, herança, dinheiro guardado anteriormente).
        </div>
      </FieldRow>

      <button
        onClick={onSave}
        style={{
          ...primaryBtn,
          background: "linear-gradient(135deg,#f59e0b,#f97316)",
        }}
      >
        Salvar Investimento
      </button>
    </Modal>
  );
}
