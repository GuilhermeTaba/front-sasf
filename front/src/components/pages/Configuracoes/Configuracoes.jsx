import Layout from '../../components/Layout';
import './Configuracoes.css';

const Configuracoes = () => (
  <Layout>
    <h1 className="page-title">Configurações</h1>
    <p className="page-sub">Preferências do sistema e da unidade</p>

    <div className="config-grid">
      {[
        { titulo: 'Perfil do usuário',    desc: 'Nome, e-mail, foto e senha',               icon: '👤' },
        { titulo: 'Unidade',             desc: 'Dados da unidade Chico Mendes',             icon: '🏢' },
        { titulo: 'Notificações',        desc: 'Alertas, e-mails e lembretes',              icon: '🔔' },
        { titulo: 'Segurança',           desc: 'Autenticação e controle de acesso',         icon: '🔒' },
        { titulo: 'Importar / Exportar', desc: 'Backup e migração de dados',                icon: '📦' },
        { titulo: 'Sobre o sistema',     desc: 'Versão, licença e suporte técnico',         icon: 'ℹ️' },
      ].map(c => (
        <div key={c.titulo} className="config-card">
          <span className="config-icon">{c.icon}</span>
          <div>
            <p className="config-title">{c.titulo}</p>
            <p className="config-desc">{c.desc}</p>
          </div>
          <span className="config-arrow">›</span>
        </div>
      ))}
    </div>
  </Layout>
);

export default Configuracoes;
