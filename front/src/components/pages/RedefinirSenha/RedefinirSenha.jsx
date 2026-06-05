import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import "../Login/Login.css";
import sasfImg from "../../../assets/Sasf.avif";
import unasLogo from "../../../assets/unas_logo.png";
import sasfLogo from "../../../assets/sasf_logo.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const RedefinirSenha = () => {
  const [searchParams]  = useSearchParams();
  const token           = searchParams.get("token") ?? "";

  const [novaSenha, setNovaSenha]   = useState("");
  const [confirmar, setConfirmar]   = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro]             = useState("");
  const [sucesso, setSucesso]       = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novaSenha)              { setErro("Informe a nova senha.");       return; }
    if (novaSenha !== confirmar) { setErro("As senhas não coincidem.");    return; }
    if (!token)                  { setErro("Link de recuperação inválido."); return; }

    setErro("");
    setCarregando(true);
    try {
      const res = await fetch(`${API_URL}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        setErro(msg || "Link inválido ou expirado. Solicite um novo.");
        return;
      }
      setSucesso(true);
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">

      {/* ════════════ PAINEL ESQUERDO ════════════ */}
      <div className="painel-esquerdo">

        <div className="logos-bloco">
          <img src={unasLogo} alt="UNAS Heliópolis" className="logo-img logo-unas" />
          <div className="logo-divisor" />
          <img src={sasfLogo} alt="SASF" className="logo-img logo-sasf" />
        </div>

        <div className="form-bloco">
          <h2>Nova senha</h2>
          <p className="subtitulo">Crie uma senha forte para proteger sua conta</p>

          {sucesso ? (
            <div className="auth-sucesso">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p>Senha redefinida com sucesso! Você já pode fazer login com a nova senha.</p>
              <Link to="/" className="btn-entrar" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: '8px' }}>
                Ir para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              <div className="form-grupo">
                <div className="label-linha">
                  <label htmlFor="novaSenha">Nova senha</label>
                  <button type="button" className="btn-mostrar" onClick={() => setMostrarSenha(v => !v)}>
                    {mostrarSenha ? "ocultar senha" : "mostrar senha"}
                  </button>
                </div>
                <div className="input-wrap">
                  <input
                    id="novaSenha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder=""
                    value={novaSenha}
                    onChange={e => { setNovaSenha(e.target.value); setErro(""); }}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label htmlFor="confirmar">Confirmar nova senha</label>
                <div className="input-wrap">
                  <input
                    id="confirmar"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder=""
                    value={confirmar}
                    onChange={e => { setConfirmar(e.target.value); setErro(""); }}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {erro && <p className="msg-erro">{erro}</p>}

              <button type="submit" className="btn-entrar" disabled={carregando}>
                {carregando ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          )}

          {!sucesso && (
            <p className="rodape-form">
              <Link to="/">Voltar para o login</Link>
            </p>
          )}
        </div>
      </div>

      {/* ════════════ PAINEL DIREITO (imagem) ════════════ */}
      <div className="painel-direito">
        <img src={sasfImg} alt="SASF" className="foto-lateral" />
      </div>

    </div>
  );
};

export default RedefinirSenha;
