import { useState } from "react";
import { Link } from "react-router";
import "../Login/Login.css";
import sasfImg from "../../../assets/Sasf.avif";
import unasLogo from "../../../assets/unas_logo.png";
import sasfLogo from "../../../assets/sasf_logo.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const EsqueciSenha = () => {
  const [email, setEmail]         = useState("");
  const [erro, setErro]           = useState("");
  const [sucesso, setSucesso]     = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setErro("Informe seu e-mail."); return; }
    setErro("");
    setCarregando(true);
    try {
      await fetch(`${API_URL}/esqueci-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Sempre mostra sucesso — nunca revelamos se o e-mail existe
      setSucesso(true);
    } catch {
      setSucesso(true);
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
          {sucesso ? (
            <>
              <div className="es-icone-check">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h2>E-mail enviado!</h2>
              <p className="subtitulo">
                Se o endereço <strong>{email}</strong> estiver cadastrado, você receberá
                um link de recuperação em breve. Verifique também a caixa de spam.
              </p>
              <Link to="/" className="btn-entrar" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                Voltar para o login
              </Link>
            </>
          ) : (
            <>
              <h2>Recuperar senha</h2>
              <p className="subtitulo">
                Informe seu e-mail e enviaremos um link para criar uma nova senha
              </p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grupo">
                  <label htmlFor="email">E-mail</label>
                  <div className="input-wrap">
                    <input
                      id="email"
                      type="email"
                      placeholder=""
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErro(""); }}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {erro && <p className="msg-erro">{erro}</p>}

                <button type="submit" className="btn-entrar" disabled={carregando}>
                  {carregando ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </form>

              <p className="rodape-form">
                Lembrou a senha? <Link to="/">Entrar</Link>
              </p>
            </>
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

export default EsqueciSenha;
