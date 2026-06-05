import { useState } from "react";
import { useNavigate, Link } from "react-router";
import "./Login.css";
import sasfImg from "../../../assets/Sasf.avif";
import unasLogo from "../../../assets/unas_logo.png";
import sasfLogo from "../../../assets/sasf_logo.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setErro("Informe o e-mail.");
      return;
    }
    if (!senha) {
      setErro("Informe sua senha.");
      return;
    }
    setErro("");
    setCarregando(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: Number(senha) }),
      });
      if (!response.ok) {
        setErro("Email ou senha incorretos.");
        return;
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);
      const payload = JSON.parse(atob(data.token.split(".")[1]));
      localStorage.setItem("cargo", payload.cargo);
      localStorage.setItem("userId", payload.id);
      navigate("/dashboard");
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
            <button type="submit" className="btn-entrar" disabled={carregando}>
              {carregando ? "Entrando..." : "Login"}
            </button>
          </form>

          {/* Rodapé */}
          <p className="rodape-form">
            Não tem uma conta?{" "}
            <Link to="/criar-conta">Crie uma</Link>
          </p>
          <p className="rodape-form" style={{ marginTop: '10px' }}>
            <Link to="/esqueci-senha">Esqueceu sua senha?</Link>
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
