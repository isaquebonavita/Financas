import Modal from "../components/Modal";
import FieldRow from "../components/FieldRow";
import { CAT_ICONS } from "../constants";
import { inputStyle, primaryBtn } from "../styles";

export default function OrcamentoModal({
  categoria,
  valor,
  setValor,
  onSave,
  onClose,
}) {
  return (
    <Modal
      title={`${CAT_ICONS[categoria]} Orçamento — ${categoria}`}
      onClose={onClose}
    >
      <FieldRow label="Orçamento Mensal (R$)">
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
