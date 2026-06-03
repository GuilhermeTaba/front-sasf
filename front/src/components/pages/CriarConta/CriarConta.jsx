import { useState } from "react";
import { useNavigate, Link } from "react-router";
import "./CriarConta.css";
import unasLogo from "../../../assets/unas_logo.png";
import sasfLogo from "../../../assets/sasf_logo.jpg";
import sasfImg from "../../../assets/Sasf.avif";

const CARGOS = ["ADMIN", "TECNICO", "ORIENTADOR"];

const CriarConta = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nome: "", email: "", cargo: "", senha: "", confirmarSenha: "" });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const set = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: e.target.value }));
    setErro("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim())          { setErro("Informe seu nome.");          return; }
    if (!form.email.trim())         { setErro("Informe seu e-mail.");        return; }
    if (!form.cargo)                { setErro("Selecione um cargo.");        return; }
    if (!form.senha)                { setErro("Informe uma senha.");         return; }
    if (form.senha !== form.confirmarSenha) { setErro("As senhas não coincidem."); return; }

    setCarregando(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: form.nome, email: form.email, cargo: form.cargo, senha: Number(form.senha) }),
      });
      if (!response.ok) {
        const msg = await response.text().catch(() => "");
        setErro(msg || "Erro ao criar conta. Verifique os dados.");
        return;
      }
      setSucesso(true);
      setTimeout(() => navigate("/"), 2000);
    } catch {
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="criar-page">

      {/* ════════════ PAINEL ESQUERDO ════════════ */}
      <div className="painel-esquerdo">

        <div className="logos-bloco">
          <img src={unasLogo} alt="UNAS Heliópolis" className="logo-img logo-unas" />
          <div className="logo-divisor" />
          <img src={sasfLogo} alt="SASF" className="logo-img logo-sasf" />
        </div>

        <div className="form-bloco">
          <h2>Criar conta</h2>
          <p className="subtitulo">Preencha os dados para solicitar acesso</p>

          {sucesso ? (
            <div className="msg-sucesso">
              Conta criada com sucesso! Aguarde a aprovação do administrador.<br />
              Redirecionando para o login…
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              <div className="form-grupo">
                <label htmlFor="nome">Nome completo</label>
                <div className="input-wrap">
                  <input id="nome" type="text" value={form.nome} onChange={set("nome")} autoComplete="name" />
                </div>
              </div>

              <div className="form-grupo">
                <label htmlFor="email">Email</label>
                <div className="input-wrap">
                  <input id="email" type="email" value={form.email} onChange={set("email")} autoComplete="email" />
                </div>
              </div>

              <div className="form-grupo">
                <label htmlFor="cargo">Cargo</label>
                <div className="input-wrap">
                  <select id="cargo" value={form.cargo} onChange={set("cargo")} className="input-select">
                    <option value="">Selecione…</option>
                    {CARGOS.map((c) => (
                      <option key={c} value={c}>{c.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grupo">
                <div className="label-linha">
                  <label htmlFor="senha">Senha</label>
                  <button type="button" className="btn-mostrar" onClick={() => setMostrarSenha((v) => !v)}>
                    {mostrarSenha ? "ocultar senha" : "mostrar senha"}
                  </button>
                </div>
                <div className="input-wrap">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={form.senha}
                    onChange={set("senha")}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-grupo">
                <label htmlFor="confirmarSenha">Confirmar senha</label>
                <div className="input-wrap">
                  <input
                    id="confirmarSenha"
                    type={mostrarSenha ? "text" : "password"}
                    value={form.confirmarSenha}
                    onChange={set("confirmarSenha")}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {erro && <p className="msg-erro">{erro}</p>}

              <button type="submit" className="btn-entrar" disabled={carregando}>
                {carregando ? "Criando conta..." : "Criar conta"}
              </button>
            </form>
          )}

          <p className="rodape-form">
            Já tem uma conta?{" "}
            <Link to="/">Entrar</Link>
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

export default CriarConta;
