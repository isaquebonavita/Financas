import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import AuthScreen from "./components/AuthScreen";
import MainApp from "./components/MainApp";
import LoadingOverlay from "./components/LoadingOverlay";

// ─────────────────────────────────────────────────────────────
//  ROOT — decide entre AuthScreen e MainApp baseado na sessão.
//  Renderiza UM ou OUTRO, nunca os dois ao mesmo tempo.
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [userId, setUserId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Pega usuário logado na primeira renderização
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
      setCheckingAuth(false);
    });

    // Escuta mudanças de auth (login, logout, refresh de token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Enquanto verifica a sessão inicial, mostra só o overlay
  if (checkingAuth) return <LoadingOverlay />;

  // Sem login → só a tela de auth
  if (!userId) return <AuthScreen />;

  // Com login → app completo
  return <MainApp userId={userId} />;
}
