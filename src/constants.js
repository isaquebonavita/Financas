// ─────────────────────────────────────────────────────────────
//  CONSTANTES GLOBAIS
// ─────────────────────────────────────────────────────────────
export const CATEGORIES = [
  "Moradia", "Alimentação", "Transporte", "Saúde",
  "Educação", "Lazer", "Vestuário", "Serviços/Assinaturas", "Outros",
];

export const INV_CATEGORIES = [
  "Renda Fixa", "Renda Variável", "Fundos", "Criptomoedas", "Previdência", "Outro",
];

export const CAT_ICONS = {
  "Moradia": "🏠", "Alimentação": "🍽️", "Transporte": "🚗", "Saúde": "💊",
  "Educação": "📚", "Lazer": "🎭", "Vestuário": "👔",
  "Serviços/Assinaturas": "📱", "Outros": "📦",
};

export const INV_ICONS = {
  "Renda Fixa": "🏦", "Renda Variável": "📈", "Fundos": "🗂️",
  "Criptomoedas": "₿", "Previdência": "🔐", "Outro": "💼",
};

export const INV_COLORS = {
  "Renda Fixa": "#10b981", "Renda Variável": "#3b82f6", "Fundos": "#8b5cf6",
  "Criptomoedas": "#f59e0b", "Previdência": "#6366f1", "Outro": "#6b7280",
};

export const CAT_COLORS = {
  "Moradia": "#6366f1", "Alimentação": "#f59e0b", "Transporte": "#3b82f6",
  "Saúde": "#ef4444", "Educação": "#8b5cf6", "Lazer": "#ec4899",
  "Vestuário": "#14b8a6", "Serviços/Assinaturas": "#f97316", "Outros": "#6b7280",
};

export const FORMAS_PAGTO = [
  "Dinheiro", "Débito", "Crédito", "Pix", "Transferência", "Outro",
];

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────
export const fmtBRL = (v) =>
  (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const today = new Date();
export const todayStr = today.toISOString().slice(0, 10);

export function addMonths(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}

// Retorna o último dia do mês como string YYYY-MM-DD
export function lastDayOfMonth(ano, mes) {
  // mes aqui é 1-12
  const d = new Date(ano, mes, 0); // dia 0 do mês seguinte = último dia do mês atual
  return `${ano}-${String(mes).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
