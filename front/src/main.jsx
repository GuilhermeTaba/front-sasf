import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  return token ? element : <Navigate to="/" replace />;
};

const AdminRoute = ({ element }) => {
  const token = localStorage.getItem("token");
  const cargo = localStorage.getItem("cargo");
  if (!token) return <Navigate to="/" replace />;
  return cargo === "ADMIN" ? element : <Navigate to="/dashboard" replace />;
};
import './index.css'
import Login            from './components/pages/Login/Login.jsx'
import Dashboard        from './components/pages/Dashboard/Dashboard.jsx'
import Familias         from './components/pages/Familias/Familias.jsx'
import NovosCadastro    from './components/pages/NovoCadastro/NovosCadastro.jsx'
import Atendimentos     from './components/pages/Atendimentos/Atendimentos.jsx'
import PainelAdmin      from './components/pages/PainelAdmin/PainelAdmin.jsx'
import NovoAtendimento  from './components/pages/NovoAtendimento/NovoAtendimento.jsx'
import Agenda           from './components/pages/Agenda/Agenda.jsx'
import DetalhesFamilia  from './components/pages/DetalhesFamilia/DetalhesFamilia.jsx'
import FichaAtualizacao        from './components/pages/FichaAtualizacao/FichaAtualizacao.jsx'
import TermoImagem             from './components/pages/TermoImagem/TermoImagem.jsx'

import FichaVisitaDomiciliar      from './components/pages/FichaVisitaDomiciliar/FichaVisitaDomiciliar.jsx'
import PlanoDesenvolvimento       from './components/pages/PlanoDesenvolvimento/PlanoDesenvolvimento.jsx'
import PlanoDesenvolvimentoPDU    from './components/pages/PlanoDesenvolvimentoPDU/PlanoDesenvolvimentoPDU.jsx'
import FolhaProsseguimento        from './components/pages/FolhaProsseguimento/FolhaProsseguimento.jsx'
import Menu                      from './components/pages/Menu/Menu.jsx'
import CriarConta                from './components/pages/CriarConta/CriarConta.jsx'
import EsqueciSenha             from './components/pages/EsqueciSenha/EsqueciSenha.jsx'
import RedefinirSenha           from './components/pages/RedefinirSenha/RedefinirSenha.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<Login />} />
        <Route path="/esqueci-senha"          element={<EsqueciSenha />} />
        <Route path="/redefinir-senha"        element={<RedefinirSenha />} />

        <Route path="/dashboard"          element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/familias"           element={<PrivateRoute element={<Familias />} />} />
        <Route path="/novo-cadastro"                  element={<PrivateRoute element={<NovosCadastro />} />} />
        <Route path="/novo-cadastro/:id"              element={<PrivateRoute element={<NovosCadastro />} />} />
        <Route path="/novo-cadastro/:id/:fichaId"     element={<PrivateRoute element={<NovosCadastro />} />} />
        <Route path="/atendimentos"       element={<PrivateRoute element={<Atendimentos />} />} />
        <Route path="/novo-atendimento"                                   element={<PrivateRoute element={<NovoAtendimento />} />} />
        <Route path="/novo-atendimento/:familiaId"                        element={<PrivateRoute element={<NovoAtendimento />} />} />
        <Route path="/novo-atendimento/:familiaId/:atendimentoId"         element={<PrivateRoute element={<NovoAtendimento />} />} />
        <Route path="/agenda"             element={<PrivateRoute element={<Agenda />} />} />
        <Route path="/painel-admin"       element={<AdminRoute element={<PainelAdmin />} />} />
        <Route path="/menu"                           element={<PrivateRoute element={<Menu />} />} />
        <Route path="/detalhes-familia/:id"           element={<PrivateRoute element={<DetalhesFamilia />} />} />
        <Route path="/ficha-atualizacao/:id"          element={<PrivateRoute element={<FichaAtualizacao />} />} />
        <Route path="/ficha-atualizacao/:id/:fichaId" element={<PrivateRoute element={<FichaAtualizacao />} />} />
        <Route path="/termo-imagem/:id"               element={<PrivateRoute element={<TermoImagem />} />} />
        <Route path="/termo-imagem/:id/:termoId"      element={<PrivateRoute element={<TermoImagem />} />} />

        <Route path="/ficha-visita/:id"               element={<PrivateRoute element={<FichaVisitaDomiciliar />} />} />
        <Route path="/ficha-visita/:id/:fichaId"      element={<PrivateRoute element={<FichaVisitaDomiciliar />} />} />
        <Route path="/plano-desenvolvimento/:id"      element={<PrivateRoute element={<PlanoDesenvolvimento />} />} />
        <Route path="/plano-desenvolvimento/:id/:planoId" element={<PrivateRoute element={<PlanoDesenvolvimento />} />} />
        <Route path="/plano-pdu/:id"                  element={<PrivateRoute element={<PlanoDesenvolvimentoPDU />} />} />
        <Route path="/plano-pdu/:id/:planoId"         element={<PrivateRoute element={<PlanoDesenvolvimentoPDU />} />} />
        <Route path="/folha-prosseguimento/:id"       element={<PrivateRoute element={<FolhaProsseguimento />} />} />
        <Route path="/folha-prosseguimento/:id/:folhaId" element={<PrivateRoute element={<FolhaProsseguimento />} />} />
<Route path="/criar-conta"        element={<CriarConta />} />
        <Route path="*"                   element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
