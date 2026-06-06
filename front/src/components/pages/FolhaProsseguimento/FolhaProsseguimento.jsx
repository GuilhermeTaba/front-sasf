import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import Layout from '../../Layout';
import '../FichaAtualizacao/FichaAtualizacao.css';
import '../NovoCadastro/NovosCadastro.css';

const FAMILIAS = [
  { id: 1, responsavel: 'Carlos Oliveira',  tecnico: 'Ana Silva'     },
  { id: 2, responsavel: 'Marta Lima',        tecnico: 'Ana Silva'     },
  { id: 3, responsavel: 'João Ribeiro',      tecnico: 'Ana Silva'     },
  { id: 4, responsavel: 'Fernanda Souza',    tecnico: 'Carlos Mendes' },
  { id: 5, responsavel: 'Paulo Costa',       tecnico: 'Carlos Mendes' },
  { id: 6, responsavel: 'Lúcia Pereira',     tecnico: 'Beatriz Rocha' },
  { id: 7, responsavel: 'Ricardo Mendes',    tecnico: 'Beatriz Rocha' },
  { id: 8, responsavel: 'Sandra Almeida',    tecnico: 'Elisa Tavares' },
];

const SectionTitle = ({ children }) => (
  <div className="fa-section-divider">
    <span className="fa-section-label">{children}</span>
  </div>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const FolhaProsseguimento = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const familia  = FAMILIAS.find(f => f.id === Number(id)) || FAMILIAS[0];

  const [form, setForm] = useState({
    numero: '',
    representante: familia.responsavel,
    matricula: '',
    nis: '',
    demandas: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/familias/${id}/folhas-prosseguimento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          numeroFolha: form.numero ? Number(form.numero) : null,
          nomeRepresentanteFamilia: form.representante,
          numeroMatricula: form.matricula,
          numeroNIS_BDC: form.nis,
          conteudoFolha: form.demandas,
        }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      navigate(`/detalhes-familia/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      {/* breadcrumb */}
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <Link to={`/detalhes-familia/${familia.id}`} className="bc-link">{familia.responsavel}</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">Folha de Prosseguimento</span>
      </div>

      {/* header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#475569', fontWeight: 700 }}>Acompanhamento</p>
          <h1 className="page-title">Folha de Prosseguimento</h1>
          <p className="page-sub">Prefeitura de São Paulo · Assistência Social</p>
        </div>
      </div>

      <div className="form-card">

        <SectionTitle>Identificação</SectionTitle>
        <div className="fa-grid-2">
          <div className="fa-field">
            <label>Nº da Folha</label>
            <input name="numero" value={form.numero} onChange={handle} placeholder="Ex: 1" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>N. de Matrícula</label>
            <input name="matricula" value={form.matricula} onChange={handle} placeholder="Nº Matrícula" className="fa-input" />
          </div>
        </div>

        <div className="fa-grid-2" style={{ marginTop: 14 }}>
          <div className="fa-field">
            <label>Nome do Representante da Família</label>
            <input name="representante" value={form.representante} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Nº do NIS/BDC</label>
            <input name="nis" value={form.nis} onChange={handle} placeholder="Nº NIS/BDC" className="fa-input" />
          </div>
        </div>

        <SectionTitle>Demanda Apresentada / Orientação / Encaminhamentos</SectionTitle>
        <p className="fa-hint">Registrar com data e técnico responsável.</p>
        <div className="fa-field">
          <textarea name="demandas" value={form.demandas} onChange={handle}
            className="fa-textarea" rows={22}
            placeholder="Data — Técnico responsável — Demanda / Orientação / Encaminhamento..." />
        </div>

        {error && <p style={{ color: '#dc2626', margin: '8px 0' }}>{error}</p>}
        <div className="form-actions">
          <Link to={`/detalhes-familia/${familia.id}`} className="btn-secondary">← Voltar</Link>

          <button className="btn-primary btn-success" onClick={handleSubmit} disabled={saving}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {saving ? 'Salvando…' : 'Salvar folha de prosseguimento'}
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default FolhaProsseguimento;
