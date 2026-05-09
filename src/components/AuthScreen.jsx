import { useState } from "react";
import { supabase } from "../supabase";

// ─────────────────────────────────────────────────────────────
//  TELA DE AUTENTICAÇÃO (Login / Cadastro / Reset de senha)
// ─────────────────────────────────────────────────────────────
export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showPass, setShowPass] = useState(false);

  const reset = () => {
    setError("");
    setInfo("");
  };

  async function handleSubmit() {
    reset();
    if (!email) {
      setError("Informe o e-mail.");
      return;
    }
    if (mode !== "reset" && !password) {
      setError("Informe a senha.");
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setInfo("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
        setMode("login");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setInfo("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
        setMode("login");
      }
    } catch (e) {
      const msgs = {
        "Invalid login credentials": "E-mail ou senha incorretos.",
        "Email not confirmed": "Confirme seu e-mail antes de entrar.",
        "User already registered": "Este e-mail já está cadastrado.",
      };
      setError(msgs[e.message] || e.message);
    } finally {
      setLoading(false);
    }
  }

  const titles = { login: "Entrar", signup: "Criar conta", reset: "Recuperar senha" };
  const btnLabels = { login: "Entrar", signup: "Criar conta", reset: "Enviar link" };

  return (
    <div
      style={{
        fontFamily: "'Nunito','Segoe UI',sans-serif",
        background: "#0f172a",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>💰</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
            Controle de Gastos
          </div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            Suas finanças organizadas
          </div>
        </div>

        <div
          style={{
            background: "#1e293b",
            borderRadius: 20,
            padding: "28px 24px",
            border: "1px solid #334155",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#f1f5f9",
              marginBottom: 20,
            }}
          >
            {titles[mode]}
          </div>

          {error && (
            <div
              style={{
                background: "#ef444422",
                border: "1px solid #ef4444",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#f87171",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              ⚠️ {error}
            </div>
          )}
          {info && (
            <div
              style={{
                background: "#10b98122",
                border: "1px solid #10b981",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#6ee7b7",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              ✅ {info}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                color: "#64748b",
                fontWeight: 700,
                marginBottom: 5,
                letterSpacing: 0.5,
              }}
            >
              E-MAIL
            </div>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                reset();
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{
                width: "100%",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 10,
                padding: "11px 14px",
                color: "#f1f5f9",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {mode !== "reset" && (
            <div style={{ marginBottom: mode === "signup" ? 14 : 6 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  fontWeight: 700,
                  marginBottom: 5,
                  letterSpacing: 0.5,
                }}
              >
                SENHA
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    reset();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%",
                    background: "#0f172a",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    padding: "11px 42px 11px 14px",
                    color: "#f1f5f9",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={() => setShowPass((s) => !s)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    color: "#64748b",
                  }}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div style={{ marginBottom: 6 }}>
              <div
                style={{
                  fontSize: 10,
                  color: "#64748b",
                  fontWeight: 700,
                  marginBottom: 5,
                  letterSpacing: 0.5,
                }}
              >
                CONFIRMAR SENHA
              </div>
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  reset();
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{
                  width: "100%",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "11px 14px",
                  color: "#f1f5f9",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {mode === "login" && (
            <div style={{ textAlign: "right", marginBottom: 20 }}>
              <button
                onClick={() => {
                  setMode("reset");
                  reset();
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6366f1",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Esqueci minha senha
              </button>
            </div>
          )}
          {mode !== "login" && <div style={{ marginBottom: 20 }} />}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#334155" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontWeight: 800,
              fontSize: 15,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "Aguarde..." : btnLabels[mode]}
          </button>

          <div
            style={{
              marginTop: 20,
              textAlign: "center",
              fontSize: 13,
              color: "#64748b",
            }}
          >
            {mode === "login" && (
              <>
                <span>Não tem conta? </span>
                <button
                  onClick={() => {
                    setMode("signup");
                    reset();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6366f1",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Criar conta
                </button>
              </>
            )}
            {mode === "signup" && (
              <>
                <span>Já tem conta? </span>
                <button
                  onClick={() => {
                    setMode("login");
                    reset();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6366f1",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Entrar
                </button>
              </>
            )}
            {mode === "reset" && (
              <>
                <span>Lembrou a senha? </span>
                <button
                  onClick={() => {
                    setMode("login");
                    reset();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#6366f1",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Voltar ao login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
