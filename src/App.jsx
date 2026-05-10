import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AuthScreen from "./components/AuthScreen";
import MainApp from "./components/MainApp";
import BusinessApp from "./components/BusinessApp";
import LoadingOverlay from "./components/LoadingOverlay";

// ─────────────────────────────────────────────────────────────
//  ROOT
//  - Se não logado → AuthScreen
//  - Se logado + modo "pessoal" → MainApp
//  - Se logado + modo "negocio" → BusinessApp
//  O modo é persistido em localStorage para sobreviver a refresh.
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [userId, setUserId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Lê modo salvo (default "pessoal")
  const [modo, setModoState] = useState(() => {
    try {
      return localStorage.getItem("modo_app") || "pessoal";
    } catch {
      return "pessoal";
    }
  });

  // Wrapper que persiste no localStorage
  const setModo = (novo) => {
    setModoState(novo);
    try {
      localStorage.setItem("modo_app", novo);
    } catch {
      // ignora erro (modo privado, etc.)
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
      setCheckingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checkingAuth) return <LoadingOverlay />;
  if (!userId) return <AuthScreen />;

  return modo === "negocio" ? (
    <BusinessApp userId={userId} modo={modo} setModo={setModo} />
  ) : (
    <MainApp userId={userId} modo={modo} setModo={setModo} />
  );
}
