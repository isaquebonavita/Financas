import Modal from "../components/Modal";
import FieldRow from "../components/FieldRow";
import { inputStyle, primaryBtn } from "../styles";

export default function ReceitaModal({ valor, setValor, onSave, onClose }) {
  return (
    <Modal title="💹 Receita Base do Mês" onClose={onClose}>
      <FieldRow label="Receita Total (R$)">
        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          style={inputStyle}
          autoFocus
        />
      </FieldRow>
      <button onClick={onSave} style={primaryBtn}>
        Salvar
      </button>
    </Modal>
  );
}
