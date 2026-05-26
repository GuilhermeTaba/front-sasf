import { useState } from "react";
import { useNavigate } from "react-router";
import "./login.css";
import sasfImg from "../assets/Sasf.avif";
import unasLogo from "../assets/unas_logo.png";
import sasfLogo from "../assets/sasf_logo.jpg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErro("Informe o e-mail.");
      return;
    }
    if (senha.length < 4) {
      setErro("Informe sua senha.");
      return;
    }
    setErro("");
    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      {/* ════════════ PAINEL ESQUERDO ════════════ */}
      <div className="painel-esquerdo">

        {/* Logos */}
        <div className="logos-bloco">
          <img src={unasLogo} alt="UNAS Heliópolis" className="logo-img logo-unas" />
          <div className="logo-divisor" />
          <img src={sasfLogo} alt="SASF" className="logo-img logo-sasf" />
        </div>

        {/* Formulário */}
        <div className="form-bloco">
          <h2>Entre na sua conta</h2>
          <p className="subtitulo">Coloque suas credenciais para acessar</p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Email */}
            <div className="form-grupo">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <input
                  id="email"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErro(""); }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="form-grupo">
              <div className="label-linha">
                <label htmlFor="senha">Senha</label>
                <button
                  type="button"
                  className="btn-mostrar"
                  onClick={() => setMostrarSenha((v) => !v)}
                >
                  {mostrarSenha ? "ocultar senha" : "mostrar senha"}
                </button>
              </div>
              <div className="input-wrap">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder=""
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro(""); }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Erro */}
            {erro && <p className="msg-erro">{erro}</p>}

            {/* Botão */}
            <button type="submit" className="btn-entrar">
              Login
            </button>
          </form>

          {/* Rodapé */}
          <p className="rodape-form">
            Não tem uma conta?{" "}
            <a href="#">Crie uma</a>
          </p>
        </div>
      </div>

      {/* ════════════ PAINEL DIREITO (imagem) ════════════ */}
      <div className="painel-direito">
        <img src={sasfImg} alt="SASF" className="foto-lateral" />
      </div>

    </div>
  );
};

export default Login;
