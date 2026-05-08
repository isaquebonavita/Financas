import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "./supabase"; // ajuste o caminho conforme seu projeto


// ─────────────────────────────────────────────────────────────
//  TELA DE AUTENTICAÇÃO (Login / Cadastro / Reset de senha)
// ─────────────────────────────────────────────────────────────
function AuthScreen() {
  const [mode, setMode]         = useState("login"); // "login" | "signup" | "reset"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");
  const [showPass, setShowPass] = useState(false);

  const reset = () => { setError(""); setInfo(""); };

  async function handleSubmit() {
    reset();
    if (!email) { setError("Informe o e-mail."); return; }
    if (mode !== "reset" && !password) { setError("Informe a senha."); return; }
    if (mode === "signup" && password !== confirm) { setError("As senhas não coincidem."); return; }
    if (mode === "signup" && password.length < 6) { setError("A senha deve ter no mínimo 6 caracteres."); return; }
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
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
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
    } finally { setLoading(false); }
  }

  const titles    = { login: "Entrar", signup: "Criar conta", reset: "Recuperar senha" };
  const btnLabels = { login: "Entrar", signup: "Criar conta", reset: "Enviar link" };

  return (
    <div style={{ fontFamily:"'Nunito','Segoe UI',sans-serif", background:"#0f172a", minHeight:"100vh", display:"flex", justifyContent:"center", alignItems:"center", padding:"20px" }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>💰</div>
          <div style={{ fontSize:22, fontWeight:800, color:"#f1f5f9" }}>Controle de Gastos</div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>Suas finanças organizadas</div>
        </div>
        <div style={{ background:"#1e293b", borderRadius:20, padding:"28px 24px", border:"1px solid #334155" }}>
          <div style={{ fontSize:18, fontWeight:800, color:"#f1f5f9", marginBottom:20 }}>{titles[mode]}</div>
          {error && <div style={{ background:"#ef444422", border:"1px solid #ef4444", borderRadius:10, padding:"10px 14px", color:"#f87171", fontSize:13, marginBottom:14 }}>⚠️ {error}</div>}
          {info  && <div style={{ background:"#10b98122", border:"1px solid #10b981", borderRadius:10, padding:"10px 14px", color:"#6ee7b7", fontSize:13, marginBottom:14 }}>✅ {info}</div>}

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:"#64748b", fontWeight:700, marginBottom:5, letterSpacing:0.5 }}>E-MAIL</div>
            <input type="email" placeholder="seu@email.com" value={email}
              onChange={e=>{ setEmail(e.target.value); reset(); }}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
              style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"11px 14px", color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
          </div>

          {mode !== "reset" && (
            <div style={{ marginBottom: mode==="signup" ? 14 : 6 }}>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:700, marginBottom:5, letterSpacing:0.5 }}>SENHA</div>
              <div style={{ position:"relative" }}>
                <input type={showPass?"text":"password"} placeholder="••••••••" value={password}
                  onChange={e=>{ setPassword(e.target.value); reset(); }}
                  onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                  style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"11px 42px 11px 14px", color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
                <button onClick={()=>setShowPass(s=>!s)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16, color:"#64748b" }}>
                  {showPass?"🙈":"👁️"}
                </button>
              </div>
            </div>
          )}

          {mode === "signup" && (
            <div style={{ marginBottom:6 }}>
              <div style={{ fontSize:10, color:"#64748b", fontWeight:700, marginBottom:5, letterSpacing:0.5 }}>CONFIRMAR SENHA</div>
              <input type={showPass?"text":"password"} placeholder="••••••••" value={confirm}
                onChange={e=>{ setConfirm(e.target.value); reset(); }}
                onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
                style={{ width:"100%", background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:"11px 14px", color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box" }}/>
            </div>
          )}

          {mode === "login" && (
            <div style={{ textAlign:"right", marginBottom:20 }}>
              <button onClick={()=>{ setMode("reset"); reset(); }} style={{ background:"none", border:"none", color:"#6366f1", fontSize:12, cursor:"pointer", fontWeight:700 }}>Esqueci minha senha</button>
            </div>
          )}
          {mode !== "login" && <div style={{ marginBottom:20 }}/>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width:"100%", padding:"14px", background: loading?"#334155":"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:12, color:"#fff", fontWeight:800, fontSize:15, cursor: loading?"default":"pointer" }}>
            {loading ? "Aguarde..." : btnLabels[mode]}
          </button>

          <div style={{ marginTop:20, textAlign:"center", fontSize:13, color:"#64748b" }}>
            {mode==="login"  && <><span>Não tem conta? </span><button onClick={()=>{ setMode("signup"); reset(); }} style={{ background:"none", border:"none", color:"#6366f1", fontWeight:700, cursor:"pointer", fontSize:13 }}>Criar conta</button></>}
            {mode==="signup" && <><span>Já tem conta? </span><button onClick={()=>{ setMode("login"); reset(); }} style={{ background:"none", border:"none", color:"#6366f1", fontWeight:700, cursor:"pointer", fontSize:13 }}>Entrar</button></>}
            {mode==="reset"  && <><span>Lembrou a senha? </span><button onClick={()=>{ setMode("login"); reset(); }} style={{ background:"none", border:"none", color:"#6366f1", fontWeight:700, cursor:"pointer", fontSize:13 }}>Voltar ao login</button></>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Moradia","Alimentação","Transporte","Saúde",
  "Educação","Lazer","Vestuário","Serviços/Assinaturas","Outros",
];
const INV_CATEGORIES = ["Renda Fixa","Renda Variável","Fundos","Criptomoedas","Previdência","Outro"];

const CAT_ICONS = {
  "Moradia":"🏠","Alimentação":"🍽️","Transporte":"🚗","Saúde":"💊",
  "Educação":"📚","Lazer":"🎭","Vestuário":"👔","Serviços/Assinaturas":"📱","Outros":"📦",
};
const INV_ICONS = {
  "Renda Fixa":"🏦","Renda Variável":"📈","Fundos":"🗂️",
  "Criptomoedas":"₿","Previdência":"🔐","Outro":"💼",
};
const INV_COLORS = {
  "Renda Fixa":"#10b981","Renda Variável":"#3b82f6","Fundos":"#8b5cf6",
  "Criptomoedas":"#f59e0b","Previdência":"#6366f1","Outro":"#6b7280",
};
const CAT_COLORS = {
  "Moradia":"#6366f1","Alimentação":"#f59e0b","Transporte":"#3b82f6","Saúde":"#ef4444",
  "Educação":"#8b5cf6","Lazer":"#ec4899","Vestuário":"#14b8a6",
  "Serviços/Assinaturas":"#f97316","Outros":"#6b7280",
};
const FORMAS_PAGTO = ["Dinheiro","Débito","Crédito","Pix","Transferência","Outro"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const fmtBRL = (v) => (v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const today  = new Date();
const todayStr = today.toISOString().slice(0,10);

function addMonths(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0,10);
}

// ─────────────────────────────────────────────────────────────
//  ESTILOS REUTILIZÁVEIS
// ─────────────────────────────────────────────────────────────
const inputStyle = {
  width:"100%",background:"#1e293b",border:"1px solid #334155",
  borderRadius:10,padding:"10px 14px",color:"#f1f5f9",fontSize:14,
  outline:"none",boxSizing:"border-box",
};
const primaryBtn = {
  width:"100%",padding:"14px",
  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
  border:"none",borderRadius:12,color:"#fff",
  fontWeight:800,fontSize:15,cursor:"pointer",marginTop:8,
};
const arrowBtn = {
  background:"#1e293b",border:"1px solid #334155",borderRadius:8,
  color:"#94a3b8",width:32,height:32,cursor:"pointer",fontSize:18,
  display:"flex",alignItems:"center",justifyContent:"center",
};
const kpiCard = (color) => ({
  background:color+"15",borderRadius:12,padding:"12px 14px",
  border:`1px solid ${color}30`,
});
const fabStyle = (c1,c2) => ({
  padding:"14px 20px",borderRadius:28,
  background:`linear-gradient(135deg,${c1},${c2})`,
  border:"none",cursor:"pointer",fontSize:15,color:"#fff",
  fontWeight:800,boxShadow:`0 4px 20px ${c1}55`,whiteSpace:"nowrap",
});

// ─────────────────────────────────────────────────────────────
//  COMPONENTES BASE
// ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:100}} onClick={onClose}>
      <div style={{background:"#0f172a",borderRadius:"20px 20px 0 0",padding:"20px 20px 32px",width:"100%",maxWidth:420,maxHeight:"92vh",overflowY:"auto",border:"1px solid #1e293b"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:16,fontWeight:800,color:"#f1f5f9"}}>{title}</span>
          <button onClick={onClose} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,width:30,height:30,cursor:"pointer",fontSize:16}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontSize:10,color:"#64748b",fontWeight:700,marginBottom:5,letterSpacing:0.5}}>{label.toUpperCase()}</div>
      {children}
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(15,23,42,0.85)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{width:40,height:40,border:"3px solid #334155",borderTop:"3px solid #6366f1",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
      <div style={{color:"#64748b",marginTop:14,fontSize:13}}>Carregando...</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Toast({ msg, type }) {
  const bg = type === "error" ? "#ef4444" : "#10b981";
  return (
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:bg,color:"#fff",padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:700,zIndex:400,boxShadow:"0 4px 20px rgba(0,0,0,0.4)"}}>
      {msg}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ABA DASHBOARD
// ─────────────────────────────────────────────────────────────
function DashboardTab({ categories, icons, colors, budgets, gastosCat, onEditBudget }) {
  return (
    <div>
      <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:1,marginBottom:12}}>RESUMO POR CATEGORIA</div>
      {categories.map(cat => {
        const orcamento = budgets[cat] || 0;
        const gasto     = gastosCat[cat] || 0;
        const pct       = orcamento > 0 ? Math.min(100,(gasto/orcamento)*100) : 0;
        const over      = orcamento > 0 && gasto > orcamento;
        return (
          <div key={cat} style={{background:"#1e293b",borderRadius:14,padding:"14px 16px",marginBottom:10,border:`1px solid ${over?"#ef4444":"#2d3748"}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:32,height:32,borderRadius:8,background:colors[cat]+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{icons[cat]}</span>
                <span style={{color:"#e2e8f0",fontWeight:700,fontSize:13}}>{cat}</span>
              </div>
              <button onClick={()=>onEditBudget(cat)} style={{background:"#0f172a",border:"1px solid #334155",borderRadius:6,padding:"3px 8px",color:"#64748b",fontSize:10,cursor:"pointer"}}>
                {orcamento>0 ? `Orç: ${fmtBRL(orcamento)}` : "Definir orçamento"}
              </button>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
              <span style={{color:"#94a3b8"}}>Gasto: <span style={{color:"#f1f5f9",fontWeight:700}}>{fmtBRL(gasto)}</span></span>
              {orcamento>0 && <span style={{color:over?"#ef4444":"#10b981",fontWeight:700}}>{over?`▲ ${fmtBRL(gasto-orcamento)}`:`▼ ${fmtBRL(orcamento-gasto)}`}</span>}
            </div>
            {orcamento>0 && (
              <div style={{background:"#0f172a",borderRadius:99,height:5}}>
                <div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:over?"#ef4444":colors[cat],transition:"width 0.4s"}}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ABA LANÇAMENTOS
// ─────────────────────────────────────────────────────────────
function LancamentosTab({ items, filter, setFilter, onRemove, onRemoveGrupo, onConfirmarPagamento, catColors, catIcons }) {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {["Todos","Despesa","Receita"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{padding:"6px 14px",borderRadius:99,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,background:filter===f?"#6366f1":"#1e293b",color:filter===f?"#fff":"#64748b"}}>{f}</button>
        ))}
      </div>
      {items.length===0 ? (
        <div style={{textAlign:"center",padding:"40px 0",color:"#475569"}}>
          <div style={{fontSize:40,marginBottom:8}}>📭</div>
          <div style={{fontSize:14}}>Nenhum lançamento neste mês.</div>
          <div style={{fontSize:12,marginTop:4}}>Toque em ＋ para adicionar</div>
        </div>
      ) : items.map(l=>{
        const isExpanded   = expandedId===l.id;
        const isOverdue    = l.status==="Pendente" && l.data_pagamento && l.data_pagamento<=todayStr;
        const isRecorrente = !!l.grupo_recorrencia;
        return (
          <div key={l.id} style={{background:"#1e293b",borderRadius:14,marginBottom:10,border:`1px solid ${isOverdue?"#ef4444":isRecorrente?"#6366f133":"#2d3748"}`,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>setExpandedId(isExpanded?null:l.id)}>
              <span style={{fontSize:22}}>{catIcons[l.categoria]||"💸"}</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{l.descricao}</span>
                  {isRecorrente && <span style={{fontSize:9,background:"#6366f122",color:"#a5b4fc",borderRadius:4,padding:"1px 5px",fontWeight:700}}>🔁 {l.parcela_atual}/{l.total_parcelas}</span>}
                </div>
                <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{l.categoria} • {l.forma_pagto} • {new Date(l.data+"T00:00:00").toLocaleDateString("pt-BR")}</div>
                <div style={{display:"flex",gap:6,marginTop:3,flexWrap:"wrap"}}>
                  <span style={{fontSize:9,background:l.status==="Pago"?"#10b98122":"#f59e0b22",color:l.status==="Pago"?"#10b981":"#f59e0b",borderRadius:4,padding:"1px 5px",fontWeight:700}}>{l.status}</span>
                  {l.data_pagamento && l.status==="Pendente" && (
                    <span style={{fontSize:9,background:isOverdue?"#ef444422":"#1e293b",color:isOverdue?"#f87171":"#64748b",borderRadius:4,padding:"1px 5px",border:`1px solid ${isOverdue?"#ef4444":"#334155"}`}}>
                      {isOverdue?"⚠️ Vencido":"📅"} {new Date(l.data_pagamento+"T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:15,fontWeight:800,color:l.tipo==="Receita"?"#10b981":"#f87171"}}>
                  {l.tipo==="Receita"?"+":"-"}{fmtBRL(parseFloat(l.valor))}
                </div>
                <span style={{fontSize:11,color:"#475569"}}>{isExpanded?"▲":"▼"}</span>
              </div>
            </div>
            {isExpanded && (
              <div style={{borderTop:"1px solid #2d3748",padding:"10px 16px",display:"flex",gap:8,flexWrap:"wrap"}}>
                {l.status==="Pendente" && (
                  <button onClick={()=>{onConfirmarPagamento(l.id);setExpandedId(null);}} style={{flex:1,padding:"8px",background:"#10b98122",border:"1px solid #10b981",borderRadius:8,color:"#10b981",fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Marcar como Pago</button>
                )}
                <button onClick={()=>onRemove(l.id)} style={{flex:1,padding:"8px",background:"#ef444422",border:"1px solid #ef4444",borderRadius:8,color:"#f87171",fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑️ Remover este</button>
                {isRecorrente && (
                  <button onClick={()=>{onRemoveGrupo(l.grupo_recorrencia);setExpandedId(null);}} style={{width:"100%",padding:"8px",background:"#7f1d1d44",border:"1px solid #ef4444",borderRadius:8,color:"#fca5a5",fontWeight:700,fontSize:12,cursor:"pointer"}}>🗑️ Remover todos os {l.total_parcelas} recorrentes</button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ABA INVESTIMENTOS
// ─────────────────────────────────────────────────────────────
function InvestimentosTab({ items, categorias, icons, colors, gastosCat, totalInvestido, onRemove }) {
  const sorted = [...categorias].filter(c=>gastosCat[c]>0).sort((a,b)=>gastosCat[b]-gastosCat[a]);
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#f59e0b18,#f9731618)",border:"1px solid #f59e0b44",borderRadius:14,padding:"16px",marginBottom:16}}>
        <div style={{fontSize:11,color:"#fcd34d",fontWeight:700,letterSpacing:1}}>TOTAL INVESTIDO NO MÊS</div>
        <div style={{fontSize:28,fontWeight:800,color:"#fff",marginTop:4}}>{fmtBRL(totalInvestido)}</div>
      </div>
      {sorted.length>0 && (
        <div style={{background:"#1e293b",borderRadius:14,padding:"14px 16px",marginBottom:16}}>
          <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:1,marginBottom:12}}>POR CATEGORIA</div>
          {sorted.map(cat=>(
            <div key={cat} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                <span style={{color:"#94a3b8"}}>{icons[cat]} {cat}</span>
                <span style={{color:"#f1f5f9",fontWeight:700}}>{fmtBRL(gastosCat[cat])}</span>
              </div>
              <div style={{background:"#0f172a",borderRadius:99,height:6}}>
                <div style={{width:`${totalInvestido>0?(gastosCat[cat]/totalInvestido*100):0}%`,height:"100%",borderRadius:99,background:colors[cat]}}/>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:1,marginBottom:12}}>LANÇAMENTOS</div>
      {items.length===0 ? (
        <div style={{textAlign:"center",padding:"40px 0",color:"#475569"}}>
          <div style={{fontSize:40,marginBottom:8}}>📈</div>
          <div style={{fontSize:14}}>Nenhum investimento neste mês.</div>
          <div style={{fontSize:12,marginTop:4}}>Toque em ＋ Investimento para adicionar</div>
        </div>
      ) : items.map(i=>(
        <div key={i.id} style={{background:"#1e293b",borderRadius:14,padding:"12px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12,borderLeft:`4px solid ${colors[i.categoria]||"#f59e0b"}`}}>
          <span style={{fontSize:22}}>{icons[i.categoria]||"💼"}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9"}}>{i.descricao}</div>
            <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{i.categoria}{i.instituicao?` • ${i.instituicao}`:""} • {new Date(i.data+"T00:00:00").toLocaleDateString("pt-BR")}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:15,fontWeight:800,color:"#fcd34d"}}>{fmtBRL(parseFloat(i.valor))}</div>
            <button onClick={()=>onRemove(i.id)} style={{background:"none",border:"none",cursor:"pointer",color:"#475569",fontSize:14,marginTop:4}}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ABA GRÁFICOS
// ─────────────────────────────────────────────────────────────
function GraficosTab({ categories, icons, colors, gastosCat, totalDespesas }) {
  const sorted = [...categories].sort((a,b)=>(gastosCat[b]||0)-(gastosCat[a]||0));
  const max = gastosCat[sorted[0]]||1;
  return (
    <div>
      <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:1,marginBottom:16}}>GASTOS POR CATEGORIA</div>
      {totalDespesas===0 ? (
        <div style={{textAlign:"center",padding:"40px 0",color:"#475569"}}>
          <div style={{fontSize:40,marginBottom:8}}>📊</div>
          <div>Adicione despesas para ver os gráficos.</div>
        </div>
      ) : (
        <>
          <div style={{background:"#1e293b",borderRadius:16,padding:20,marginBottom:16}}>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {sorted.filter(c=>gastosCat[c]>0).map(cat=>{
                const pct=((gastosCat[cat]||0)/totalDespesas*100).toFixed(1);
                return (
                  <div key={cat} style={{background:colors[cat]+"22",borderRadius:8,padding:"8px 12px",border:`1px solid ${colors[cat]}44`,flex:"1 0 calc(50% - 4px)"}}>
                    <div style={{fontSize:13}}>{icons[cat]} <span style={{color:"#e2e8f0",fontWeight:700}}>{cat}</span></div>
                    <div style={{fontSize:18,fontWeight:800,color:colors[cat],marginTop:2}}>{pct}%</div>
                    <div style={{fontSize:11,color:"#94a3b8"}}>{fmtBRL(gastosCat[cat]||0)}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{background:"#1e293b",borderRadius:16,padding:"16px 20px"}}>
            <div style={{fontSize:11,color:"#64748b",fontWeight:700,letterSpacing:1,marginBottom:12}}>RANKING</div>
            {sorted.filter(c=>gastosCat[c]>0).map(cat=>(
              <div key={cat} style={{marginBottom:12}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                  <span style={{color:"#94a3b8"}}>{icons[cat]} {cat}</span>
                  <span style={{color:"#f1f5f9",fontWeight:700}}>{fmtBRL(gastosCat[cat]||0)}</span>
                </div>
                <div style={{background:"#0f172a",borderRadius:99,height:8}}>
                  <div style={{width:`${((gastosCat[cat]||0)/max)*100}%`,height:"100%",borderRadius:99,background:colors[cat],transition:"width 0.4s"}}/>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  APP PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [userId, setUserId]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);

  const [tab, setTab]                 = useState("dashboard");
  const [mes, setMes]                 = useState(today.getMonth());
  const [ano, setAno]                 = useState(today.getFullYear());

  const [lancamentos, setLancamentos] = useState([]);
  const [investimentos, setInvestimentos] = useState([]);
  const [budgets, setBudgets]         = useState(Object.fromEntries(CATEGORIES.map(c=>[c,0])));
  const [receita, setReceita]         = useState(0);

  const [showForm, setShowForm]       = useState(false);
  const [showInvForm, setShowInvForm] = useState(false);
  const [editBudget, setEditBudget]   = useState(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [showReceita, setShowReceita] = useState(false);
  const [receitaInput, setReceitaInput] = useState("");
  const [filter, setFilter]           = useState("Todos");
  const [notifications, setNotifications] = useState([]);

  const defaultForm = {
    data:todayStr, descricao:"", categoria:CATEGORIES[0], valor:"",
    tipo:"Despesa", formaPagto:"Pix", status:"Pago", obs:"",
    recorrente:false, mesesRecorrencia:1, dataPagamento:"",
  };
  const [form, setForm]     = useState(defaultForm);
  const defaultInvForm = { data:todayStr, descricao:"", categoria:INV_CATEGORIES[0], valor:"", instituicao:"", obs:"" };
  const [invForm, setInvForm] = useState(defaultInvForm);

  // ── Helpers ──────────────────────────────────────────────
  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3000);
  };

  // ── Auth: pega usuário logado ─────────────────────────────
  useEffect(()=>{
    supabase.auth.getUser().then(({data:{user}})=>{
      if (user) setUserId(user.id);
      else setLoading(false); // sem auth, carrega mesmo assim (modo dev)
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      setUserId(session?.user?.id || null);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  // ── Carrega dados do mês quando muda mês/ano/userId ───────
  const loadData = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const mesDb  = mes + 1; // Supabase usa 1-12
      const inicio = `${ano}-${String(mesDb).padStart(2,"0")}-01`;
      const fim    = `${ano}-${String(mesDb).padStart(2,"0")}-31`;

      const [lancRes, invRes, orcRes, perfRes] = await Promise.all([
        supabase.from("lancamentos").select("*")
          .eq("user_id", userId)
          .gte("data", inicio).lte("data", fim)
          .order("data", {ascending:false}),

        supabase.from("investimentos").select("*")
          .eq("user_id", userId)
          .gte("data", inicio).lte("data", fim)
          .order("data", {ascending:false}),

        supabase.from("orcamentos").select("*")
          .eq("user_id", userId).eq("mes", mesDb).eq("ano", ano),

        supabase.from("perfil_mensal").select("*")
          .eq("user_id", userId).eq("mes", mesDb).eq("ano", ano)
          .maybeSingle(),
      ]);

      if (lancRes.error) throw lancRes.error;
      if (invRes.error)  throw invRes.error;
      if (orcRes.error)  throw orcRes.error;
      if (perfRes.error) throw perfRes.error;

      setLancamentos(lancRes.data || []);
      setInvestimentos(invRes.data || []);
      setReceita(perfRes.data?.receita_base || 0);
      setReceitaInput(String(perfRes.data?.receita_base || ""));

      const bMap = Object.fromEntries(CATEGORIES.map(c=>[c,0]));
      (orcRes.data||[]).forEach(o=>{ bMap[o.categoria] = parseFloat(o.valor)||0; });
      setBudgets(bMap);

    } catch(e) {
      showToast("Erro ao carregar dados: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  }, [userId, mes, ano]);

  useEffect(()=>{ loadData(); }, [loadData]);

  // ── Notificações de vencimento ────────────────────────────
  useEffect(()=>{
    const overdue = lancamentos.filter(l=>
      l.status==="Pendente" && l.data_pagamento && l.data_pagamento<=todayStr
    );
    setNotifications(overdue.map(l=>({id:l.id,descricao:l.descricao,valor:l.valor,data_pagamento:l.data_pagamento})));
  },[lancamentos]);

  // ── Derivados ─────────────────────────────────────────────
  const totalDespesas = useMemo(()=>
    lancamentos.filter(l=>l.tipo==="Despesa").reduce((s,l)=>s+parseFloat(l.valor||0),0),
    [lancamentos]);

  const totalReceitas = useMemo(()=>
    lancamentos.filter(l=>l.tipo==="Receita").reduce((s,l)=>s+parseFloat(l.valor||0),0) + receita,
    [lancamentos, receita]);

  const totalInvestido = useMemo(()=>
    investimentos.reduce((s,i)=>s+parseFloat(i.valor||0),0),
    [investimentos]);

  const saldo = totalReceitas - totalDespesas - totalInvestido;

  const gastosCat = useMemo(()=>{
    const g = Object.fromEntries(CATEGORIES.map(c=>[c,0]));
    lancamentos.filter(l=>l.tipo==="Despesa").forEach(l=>{ g[l.categoria]=(g[l.categoria]||0)+parseFloat(l.valor||0); });
    return g;
  },[lancamentos]);

  const gastosCatInv = useMemo(()=>{
    const g = Object.fromEntries(INV_CATEGORIES.map(c=>[c,0]));
    investimentos.forEach(i=>{ g[i.categoria]=(g[i.categoria]||0)+parseFloat(i.valor||0); });
    return g;
  },[investimentos]);

  const totalOrcamento  = CATEGORIES.reduce((s,c)=>s+(budgets[c]||0),0);
  const pctComprometido = totalOrcamento>0 ? Math.min(100,(totalDespesas/totalOrcamento)*100) : 0;
  const pendentes       = lancamentos.filter(l=>l.status==="Pendente").length;

  const filteredL = useMemo(()=>{
    if (filter==="Todos") return lancamentos;
    return lancamentos.filter(l=>l.tipo===filter);
  },[lancamentos, filter]);

  // ── INSERT lançamentos (com recorrência) ──────────────────
  async function addLancamento() {
    if (!form.descricao || !form.valor) return;
    setLoading(true);
    try {
      const grupoId    = form.recorrente ? crypto.randomUUID() : null;
      const mesesCount = form.recorrente ? Math.max(1,parseInt(form.mesesRecorrencia)||1) : 1;

      const rows = Array.from({length:mesesCount},(_,i)=>({
        user_id:           userId,
        data:              addMonths(form.data, i),
        descricao:         form.descricao,
        categoria:         form.categoria,
        valor:             parseFloat(form.valor),
        tipo:              form.tipo,
        forma_pagto:       form.formaPagto,
        status:            i===0 ? form.status : "Pendente",
        obs:               form.obs || null,
        data_pagamento:    form.status==="Pendente" && form.dataPagamento
                            ? addMonths(form.dataPagamento, i)
                            : (i===0 && form.dataPagamento ? form.dataPagamento : null),
        recorrente:        form.recorrente,
        grupo_recorrencia: grupoId,
        parcela_atual:     form.recorrente ? i+1 : null,
        total_parcelas:    form.recorrente ? mesesCount : null,
      }));

      const {data, error} = await supabase.from("lancamentos").insert(rows).select();
      if (error) throw error;

      setLancamentos(prev=>[...data, ...prev]);
      setForm(defaultForm);
      setShowForm(false);
      setTab("lancamentos");
      showToast(form.recorrente ? `${mesesCount} lançamentos criados!` : "Lançamento salvo!");
    } catch(e) {
      showToast("Erro ao salvar: " + e.message, "error");
    } finally { setLoading(false); }
  }

  // ── INSERT investimento ───────────────────────────────────
  async function addInvestimento() {
    if (!invForm.descricao || !invForm.valor) return;
    setLoading(true);
    try {
      const {data, error} = await supabase.from("investimentos").insert({
        user_id:    userId,
        data:       invForm.data,
        descricao:  invForm.descricao,
        categoria:  invForm.categoria,
        valor:      parseFloat(invForm.valor),
        instituicao: invForm.instituicao || null,
        obs:        invForm.obs || null,
      }).select().single();
      if (error) throw error;

      setInvestimentos(prev=>[data, ...prev]);
      setInvForm(defaultInvForm);
      setShowInvForm(false);
      setTab("investimentos");
      showToast("Investimento salvo!");
    } catch(e) {
      showToast("Erro ao salvar: " + e.message, "error");
    } finally { setLoading(false); }
  }

  // ── DELETE lançamento único ───────────────────────────────
  async function removeLancamento(id) {
    setLancamentos(prev=>prev.filter(l=>l.id!==id)); // optimistic
    const {error} = await supabase.from("lancamentos").delete().eq("id",id);
    if (error) { showToast("Erro ao remover: "+error.message,"error"); loadData(); }
    else showToast("Lançamento removido.");
  }

  // ── DELETE grupo recorrente ───────────────────────────────
  async function removeGrupo(grupoId) {
    setLancamentos(prev=>prev.filter(l=>l.grupo_recorrencia!==grupoId)); // optimistic
    const {error} = await supabase.from("lancamentos").delete().eq("grupo_recorrencia",grupoId);
    if (error) { showToast("Erro ao remover grupo: "+error.message,"error"); loadData(); }
    else showToast("Série de recorrências removida.");
  }

  // ── DELETE investimento ───────────────────────────────────
  async function removeInvestimento(id) {
    setInvestimentos(prev=>prev.filter(i=>i.id!==id));
    const {error} = await supabase.from("investimentos").delete().eq("id",id);
    if (error) { showToast("Erro ao remover: "+error.message,"error"); loadData(); }
    else showToast("Investimento removido.");
  }

  // ── UPDATE marcar como pago ───────────────────────────────
  async function confirmarPagamento(id) {
    setLancamentos(prev=>prev.map(l=>l.id===id?{...l,status:"Pago",data_pagamento:null}:l));
    setNotifications(prev=>prev.filter(n=>n.id!==id));
    const {error} = await supabase.from("lancamentos")
      .update({status:"Pago", data_pagamento:null})
      .eq("id",id);
    if (error) { showToast("Erro ao atualizar: "+error.message,"error"); loadData(); }
    else showToast("Pagamento confirmado! ✅");
  }

  // ── UPSERT orçamento ──────────────────────────────────────
  async function saveOrcamento() {
    const valor = parseFloat(budgetInput)||0;
    const mesDb = mes+1;
    setBudgets(b=>({...b,[editBudget]:valor}));
    setEditBudget(null);
    const {error} = await supabase.from("orcamentos").upsert(
      {user_id:userId, mes:mesDb, ano, categoria:editBudget, valor},
      {onConflict:"user_id,mes,ano,categoria"}
    );
    if (error) showToast("Erro ao salvar orçamento: "+error.message,"error");
    else showToast("Orçamento atualizado!");
  }

  // ── UPSERT receita base ───────────────────────────────────
  async function saveReceita() {
    const valor = parseFloat(receitaInput)||0;
    const mesDb = mes+1;
    setReceita(valor);
    setShowReceita(false);
    const {error} = await supabase.from("perfil_mensal").upsert(
      {user_id:userId, mes:mesDb, ano, receita_base:valor},
      {onConflict:"user_id,mes,ano"}
    );
    if (error) showToast("Erro ao salvar receita: "+error.message,"error");
    else showToast("Receita base salva!");
  }

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div style={{fontFamily:"'Nunito','Segoe UI',sans-serif",background:"#0f172a",minHeight:"100vh",display:"flex",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:420,minHeight:"100vh",background:"#0f172a",display:"flex",flexDirection:"column",position:"relative"}}>

        {/* ── Auth guard ── */}
        {!userId && !loading && <AuthScreen />}

        {loading && <LoadingOverlay/>}
        {toast   && <Toast msg={toast.msg} type={toast.type}/>}

        {/* ── Header ── */}
        <div style={{background:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",padding:"16px 20px 20px",borderBottom:"1px solid #1e293b"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div>
              <div style={{fontSize:12,color:"#64748b",letterSpacing:1}}>💰 CONTROLE DE GASTOS</div>
              <div style={{fontSize:18,fontWeight:800,color:"#f1f5f9"}}>{MESES[mes]} {ano}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={()=>{ if(mes===0){setMes(11);setAno(a=>a-1);}else setMes(m=>m-1); }} style={arrowBtn}>‹</button>
              <button onClick={()=>{ if(mes===11){setMes(0);setAno(a=>a+1);}else setMes(m=>m+1); }} style={arrowBtn}>›</button>
              <button onClick={()=>supabase.auth.signOut()} title="Sair" style={{...arrowBtn, fontSize:14}}>🚪</button>
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:14}}>
            <div style={kpiCard("#10b981")}>
              <div style={{fontSize:10,color:"#6ee7b7",marginBottom:2}}>💹 RECEITA</div>
              <div style={{fontSize:15,fontWeight:800,color:"#fff"}}>{fmtBRL(totalReceitas)}</div>
              <button onClick={()=>setShowReceita(true)} style={{fontSize:9,color:"#6ee7b7",marginTop:2,background:"none",border:"none",cursor:"pointer",padding:0}}>+ definir receita base</button>
            </div>
            <div style={kpiCard("#ef4444")}>
              <div style={{fontSize:10,color:"#fca5a5",marginBottom:2}}>🔴 DESPESAS</div>
              <div style={{fontSize:15,fontWeight:800,color:"#fff"}}>{fmtBRL(totalDespesas)}</div>
            </div>
            <div style={kpiCard("#f59e0b")}>
              <div style={{fontSize:10,color:"#fcd34d",marginBottom:2}}>📈 INVESTIDO</div>
              <div style={{fontSize:15,fontWeight:800,color:"#fff"}}>{fmtBRL(totalInvestido)}</div>
            </div>
            <div style={kpiCard(saldo>=0?"#3b82f6":"#f97316")}>
              <div style={{fontSize:10,color:saldo>=0?"#93c5fd":"#fdba74",marginBottom:2}}>💰 SALDO</div>
              <div style={{fontSize:15,fontWeight:800,color:"#fff"}}>{fmtBRL(saldo)}</div>
            </div>
          </div>

          {pendentes>0 && (
            <div style={{marginTop:10,background:"#f59e0b18",border:"1px solid #f59e0b44",borderRadius:10,padding:"7px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,color:"#fcd34d"}}>⏳ {pendentes} pagamento{pendentes>1?"s":""} pendente{pendentes>1?"s":""}</span>
              <button onClick={()=>{setTab("lancamentos");setFilter("Todos");}} style={{background:"none",border:"none",color:"#f59e0b",fontSize:11,cursor:"pointer",fontWeight:700}}>Ver →</button>
            </div>
          )}

          {totalOrcamento>0 && (
            <div style={{marginTop:12}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#64748b",marginBottom:4}}>
                <span>% Orçamento Comprometido</span>
                <span style={{color:pctComprometido>90?"#ef4444":"#10b981"}}>{pctComprometido.toFixed(0)}%</span>
              </div>
              <div style={{background:"#1e293b",borderRadius:99,height:6}}>
                <div style={{width:`${pctComprometido}%`,height:"100%",borderRadius:99,background:pctComprometido>90?"#ef4444":pctComprometido>70?"#f59e0b":"#10b981",transition:"width 0.5s"}}/>
              </div>
            </div>
          )}
        </div>

        {/* ── Conteúdo ── */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px 90px"}}>
          {tab==="dashboard"    && <DashboardTab categories={CATEGORIES} icons={CAT_ICONS} colors={CAT_COLORS} budgets={budgets} gastosCat={gastosCat} onEditBudget={c=>{setEditBudget(c);setBudgetInput(String(budgets[c]||""));}}/>}
          {tab==="lancamentos"  && <LancamentosTab items={filteredL} filter={filter} setFilter={setFilter} onRemove={removeLancamento} onRemoveGrupo={removeGrupo} onConfirmarPagamento={confirmarPagamento} catColors={CAT_COLORS} catIcons={CAT_ICONS}/>}
          {tab==="investimentos"&& <InvestimentosTab items={investimentos} categorias={INV_CATEGORIES} icons={INV_ICONS} colors={INV_COLORS} gastosCat={gastosCatInv} totalInvestido={totalInvestido} onRemove={removeInvestimento}/>}
          {tab==="graficos"     && <GraficosTab categories={CATEGORIES} icons={CAT_ICONS} colors={CAT_COLORS} gastosCat={gastosCat} totalDespesas={totalDespesas}/>}
        </div>

        {/* ── FAB ── */}
        <div style={{position:"fixed",bottom:74,right:"calc(50% - 210px + 16px)",display:"flex",flexDirection:"column",gap:10,alignItems:"flex-end"}}>
          {tab==="investimentos"
            ? <button onClick={()=>setShowInvForm(true)} style={fabStyle("#f59e0b","#f97316")}>＋ Investimento</button>
            : <button onClick={()=>setShowForm(true)}    style={fabStyle("#6366f1","#8b5cf6")}>＋</button>
          }
        </div>

        {/* ── Bottom Nav ── */}
        <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:"#0f172a",borderTop:"1px solid #1e293b",display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",padding:"8px 0 12px"}}>
          {[{id:"dashboard",icon:"📊",label:"Dashboard"},{id:"lancamentos",icon:"📝",label:"Lançamentos"},{id:"investimentos",icon:"📈",label:"Investimentos"},{id:"graficos",icon:"🥧",label:"Gráficos"}].map(item=>(
            <button key={item.id} onClick={()=>setTab(item.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:tab===item.id?"#6366f1":"#475569"}}>
              <span style={{fontSize:18}}>{item.icon}</span>
              <span style={{fontSize:9,fontWeight:tab===item.id?700:400}}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ── Notificações ── */}
        {notifications.slice(0,1).map(n=>(
          <div key={n.id} style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",width:"calc(100% - 32px)",maxWidth:388,background:"#1e293b",borderRadius:14,padding:"14px 16px",border:"1px solid #f59e0b",zIndex:200,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
            <div style={{fontSize:13,color:"#fcd34d",fontWeight:800,marginBottom:6}}>⏰ Vencimento hoje ou passado</div>
            <div style={{fontSize:13,color:"#e2e8f0",marginBottom:4}}><b>{n.descricao}</b> — {fmtBRL(parseFloat(n.valor))}</div>
            <div style={{fontSize:11,color:"#94a3b8",marginBottom:12}}>Data estipulada: {new Date(n.data_pagamento+"T00:00:00").toLocaleDateString("pt-BR")}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>confirmarPagamento(n.id)} style={{flex:1,padding:"8px",background:"#10b981",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer"}}>✅ Sim, paguei!</button>
              <button onClick={()=>setNotifications(prev=>prev.filter(x=>x.id!==n.id))} style={{flex:1,padding:"8px",background:"#334155",border:"none",borderRadius:8,color:"#94a3b8",fontWeight:700,fontSize:12,cursor:"pointer"}}>⏳ Ainda não</button>
            </div>
            {notifications.length>1 && <div style={{fontSize:10,color:"#64748b",marginTop:8,textAlign:"center"}}>+{notifications.length-1} outros vencimentos pendentes</div>}
          </div>
        ))}

        {/* ── Modal: Novo lançamento ── */}
        {showForm && (
          <Modal title="➕ Novo Lançamento" onClose={()=>setShowForm(false)}>
            <FieldRow label="Data"><input type="date" value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))} style={inputStyle}/></FieldRow>
            <FieldRow label="Descrição"><input placeholder="Ex: Conta de luz" value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} style={inputStyle}/></FieldRow>
            <FieldRow label="Tipo">
              <div style={{display:"flex",gap:8}}>
                {["Despesa","Receita"].map(t=>(
                  <button key={t} onClick={()=>setForm(f=>({...f,tipo:t}))} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",background:form.tipo===t?(t==="Despesa"?"#ef4444":"#10b981"):"#1e293b",color:form.tipo===t?"#fff":"#64748b",fontWeight:700,fontSize:13}}>{t}</button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Categoria">
              <select value={form.categoria} onChange={e=>setForm(f=>({...f,categoria:e.target.value}))} style={inputStyle}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Valor (R$)"><input type="number" placeholder="0,00" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} style={inputStyle}/></FieldRow>
            <FieldRow label="Forma de Pagamento">
              <select value={form.formaPagto} onChange={e=>setForm(f=>({...f,formaPagto:e.target.value}))} style={inputStyle}>
                {FORMAS_PAGTO.map(p=><option key={p}>{p}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Status">
              <div style={{display:"flex",gap:8}}>
                {["Pago","Pendente"].map(s=>(
                  <button key={s} onClick={()=>setForm(f=>({...f,status:s}))} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",background:form.status===s?"#6366f1":"#1e293b",color:form.status===s?"#fff":"#64748b",fontWeight:700,fontSize:13}}>{s}</button>
                ))}
              </div>
            </FieldRow>

            {form.status==="Pendente" && (
              <FieldRow label="📅 Data prevista de pagamento">
                <input type="date" value={form.dataPagamento} onChange={e=>setForm(f=>({...f,dataPagamento:e.target.value}))} style={{...inputStyle,borderColor:"#f59e0b"}}/>
                <div style={{fontSize:10,color:"#94a3b8",marginTop:4}}>O app vai te notificar quando a data chegar ou passar.</div>
              </FieldRow>
            )}

            <FieldRow label="🔁 Lançamento Recorrente">
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                <div onClick={()=>setForm(f=>({...f,recorrente:!f.recorrente}))} style={{width:44,height:24,borderRadius:99,cursor:"pointer",background:form.recorrente?"#6366f1":"#334155",position:"relative",transition:"background 0.2s"}}>
                  <div style={{position:"absolute",top:3,left:form.recorrente?23:3,width:18,height:18,borderRadius:99,background:"#fff",transition:"left 0.2s"}}/>
                </div>
                <span style={{fontSize:13,color:form.recorrente?"#a5b4fc":"#64748b"}}>{form.recorrente?"Ativado":"Desativado"}</span>
              </div>
              {form.recorrente && (
                <div style={{background:"#1e293b",borderRadius:10,padding:"12px 14px",border:"1px solid #6366f144"}}>
                  <div style={{fontSize:11,color:"#a5b4fc",marginBottom:8,fontWeight:700}}>Por quantos meses repetir?</div>
                  <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
                    {[2,3,6,12,24].map(n=>(
                      <button key={n} onClick={()=>setForm(f=>({...f,mesesRecorrencia:n}))} style={{padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:700,background:form.mesesRecorrencia===n?"#6366f1":"#0f172a",color:form.mesesRecorrencia===n?"#fff":"#64748b"}}>{n}x</button>
                    ))}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <input type="number" min="1" max="120" value={form.mesesRecorrencia} onChange={e=>setForm(f=>({...f,mesesRecorrencia:parseInt(e.target.value)||1}))} style={{...inputStyle,width:70,textAlign:"center"}}/>
                    <span style={{fontSize:12,color:"#94a3b8"}}>meses no total</span>
                  </div>
                  <div style={{fontSize:10,color:"#64748b",marginTop:8}}>
                    De {new Date(form.data+"T00:00:00").toLocaleDateString("pt-BR")} até {new Date(addMonths(form.data,form.mesesRecorrencia-1)+"T00:00:00").toLocaleDateString("pt-BR")}
                  </div>
                </div>
              )}
            </FieldRow>

            <FieldRow label="Obs"><input placeholder="Observação opcional" value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))} style={inputStyle}/></FieldRow>
            <button onClick={addLancamento} style={primaryBtn}>
              {form.recorrente ? `Salvar ${form.mesesRecorrencia} lançamentos recorrentes` : "Salvar Lançamento"}
            </button>
          </Modal>
        )}

        {/* ── Modal: Novo investimento ── */}
        {showInvForm && (
          <Modal title="📈 Novo Investimento" onClose={()=>setShowInvForm(false)}>
            <FieldRow label="Data"><input type="date" value={invForm.data} onChange={e=>setInvForm(f=>({...f,data:e.target.value}))} style={inputStyle}/></FieldRow>
            <FieldRow label="Descrição"><input placeholder="Ex: Tesouro Selic 2026" value={invForm.descricao} onChange={e=>setInvForm(f=>({...f,descricao:e.target.value}))} style={inputStyle}/></FieldRow>
            <FieldRow label="Categoria">
              <select value={invForm.categoria} onChange={e=>setInvForm(f=>({...f,categoria:e.target.value}))} style={inputStyle}>
                {INV_CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Valor Aplicado (R$)"><input type="number" placeholder="0,00" value={invForm.valor} onChange={e=>setInvForm(f=>({...f,valor:e.target.value}))} style={inputStyle}/></FieldRow>
            <FieldRow label="Instituição"><input placeholder="Ex: Nubank, XP, Rico..." value={invForm.instituicao} onChange={e=>setInvForm(f=>({...f,instituicao:e.target.value}))} style={inputStyle}/></FieldRow>
            <FieldRow label="Obs"><input placeholder="Observação opcional" value={invForm.obs} onChange={e=>setInvForm(f=>({...f,obs:e.target.value}))} style={inputStyle}/></FieldRow>
            <button onClick={addInvestimento} style={{...primaryBtn,background:"linear-gradient(135deg,#f59e0b,#f97316)"}}>Salvar Investimento</button>
          </Modal>
        )}

        {/* ── Modal: Orçamento ── */}
        {editBudget && (
          <Modal title={`${CAT_ICONS[editBudget]} Orçamento — ${editBudget}`} onClose={()=>setEditBudget(null)}>
            <FieldRow label="Orçamento Mensal (R$)">
              <input type="number" value={budgetInput} onChange={e=>setBudgetInput(e.target.value)} style={inputStyle} autoFocus/>
            </FieldRow>
            <button onClick={saveOrcamento} style={primaryBtn}>Salvar</button>
          </Modal>
        )}

        {/* ── Modal: Receita base ── */}
        {showReceita && (
          <Modal title="💹 Receita Base do Mês" onClose={()=>setShowReceita(false)}>
            <FieldRow label="Receita Total (R$)">
              <input type="number" value={receitaInput} onChange={e=>setReceitaInput(e.target.value)} style={inputStyle} autoFocus/>
            </FieldRow>
            <button onClick={saveReceita} style={primaryBtn}>Salvar</button>
          </Modal>
        )}

      </div>
    </div>
  );
}