import { useState } from 'react';
import { Link, useParams } from 'react-router';
import Layout from '../../Layout';
import '../FichaAtualizacao/FichaAtualizacao.css';
import '../NovoCadastro/NovosCadastro.css';
import './PlanoDesenvolvimento.css';

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

const ANALISE_ITENS = [
  { key: 'composicao', label: 'Composição Familiar' },
  { key: 'moradia',    label: 'Moradia'              },
  { key: 'saude',      label: 'Saúde'                },
  { key: 'educacao',   label: 'Educação'             },
  { key: 'divida',     label: 'Dívida'               },
];

const emptyAcao = () => ({ estrategia: '', acaoCras: '', acaoFamilia: '', prazo: '', resultado: '' });

const SectionTitle = ({ children }) => (
  <div className="fa-section-divider">
    <span className="fa-section-label">{children}</span>
  </div>
);

const PlanoDesenvolvimento = () => {
  const { id }   = useParams();
  const familia  = FAMILIAS.find(f => f.id === Number(id)) || FAMILIAS[0];

  const [form, setForm] = useState({
    servico: 'SASF Chico Mendes',
    cas: '', cras: '',
    representante: familia.responsavel,
    matricula: '', nis: '', rg: '',
    composicao: '', moradia: '', saude: '', educacao: '', divida: '',
    objetivo: '',
    planoNum: '', dataElaboracao: '', dataValidade: '',
    dataReavaliacao: '', dataDesligamento: '',
    tecnicoRef: familia.tecnico,
    assinatura: '',
  });

  const [acoes, setAcoes] = useState(Array.from({ length: 8 }, emptyAcao));

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAcao = (idx, field, value) =>
    setAcoes(a => a.map((ac, i) => i === idx ? { ...ac, [field]: value } : ac));

  return (
    <Layout>
      {/* breadcrumb */}
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        <span className="bc-sep">›</span>
        <Link to={`/detalhes-familia/${familia.id}`} className="bc-link">{familia.responsavel}</Link>
        <span className="bc-sep">›</span>
        <span className="bc-current">Plano de Desenvolvimento Familiar</span>
      </div>

      {/* header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#0d9488', fontWeight: 700 }}>Desenvolvimento familiar</p>
          <h1 className="page-title">Plano de Desenvolvimento Familiar</h1>
          <p className="page-sub">UNAS / SASF Chico Mendes · Fl. 1/2 e 2/2</p>
        </div>
      </div>

      <div className="form-card">

        {/* ── FL. 1/2 ── */}
        <SectionTitle>Identificação — Fl. 1/2</SectionTitle>
        <div className="fa-grid-3">
          <div className="fa-field">
            <label>Nome do Serviço SASF</label>
            <input name="servico" value={form.servico} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>CAS</label>
            <input name="cas" value={form.cas} onChange={handle} placeholder="Código CAS" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>CRAS</label>
            <input name="cras" value={form.cras} onChange={handle} placeholder="Nome do CRAS" className="fa-input" />
          </div>
        </div>

        <div className="fa-grid-2" style={{ marginTop: 14 }}>
          <div className="fa-field">
            <label>Nome do Representante da Família</label>
            <input name="representante" value={form.representante} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>N. de Matrícula</label>
            <input name="matricula" value={form.matricula} onChange={handle} placeholder="Nº Matrícula" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Nº do NIS/BDC</label>
            <input name="nis" value={form.nis} onChange={handle} placeholder="Nº NIS/BDC" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Nº do RG</label>
            <input name="rg" value={form.rg} onChange={handle} placeholder="Nº RG" className="fa-input" />
          </div>
        </div>

        <SectionTitle>Análise Diagnóstica — Síntese do histórico familiar</SectionTitle>
        <div className="pd-analise-grid">
          {ANALISE_ITENS.map(item => (
            <div key={item.key} className="pd-analise-item">
              <div className="pd-analise-label">{item.label}</div>
              <textarea
                name={item.key}
                value={form[item.key]}
                onChange={handle}
                className="fa-textarea"
                rows={3}
                placeholder={`Síntese sobre ${item.label.toLowerCase()}...`}
              />
            </div>
          ))}
        </div>

        <SectionTitle>Objetivo</SectionTitle>
        <div className="fa-field">
          <textarea name="objetivo" value={form.objetivo} onChange={handle}
            className="fa-textarea" rows={6}
            placeholder="Descreva o objetivo do plano de desenvolvimento familiar..." />
        </div>

        {/* ── FL. 2/2 ── */}
        <SectionTitle>Estratégias e Ações — Fl. 2/2</SectionTitle>
        <div className="fa-table-wrap">
          <table className="fa-table pd-table">
            <thead>
              <tr>
                <th style={{ width: '28%' }}>Estratégias de Intervenção</th>
                <th style={{ width: '20%' }}>Ações CRAS</th>
                <th style={{ width: '20%' }}>Ações Família</th>
                <th style={{ width: '14%' }}>Prazo</th>
                <th style={{ width: '18%' }}>Resultados Esperados</th>
              </tr>
            </thead>
            <tbody>
              {acoes.map((ac, i) => (
                <tr key={i} className={i % 2 === 0 ? 'fa-tr-even' : 'fa-tr-odd'}>
                  <td><textarea className="pd-tbl-area" rows={2} value={ac.estrategia}
                    onChange={e => handleAcao(i, 'estrategia', e.target.value)} /></td>
                  <td><textarea className="pd-tbl-area" rows={2} value={ac.acaoCras}
                    onChange={e => handleAcao(i, 'acaoCras', e.target.value)} /></td>
                  <td><textarea className="pd-tbl-area" rows={2} value={ac.acaoFamilia}
                    onChange={e => handleAcao(i, 'acaoFamilia', e.target.value)} /></td>
                  <td><input className="fa-tbl-input" value={ac.prazo}
                    onChange={e => handleAcao(i, 'prazo', e.target.value)} placeholder="dd/mm/aa" /></td>
                  <td><textarea className="pd-tbl-area" rows={2} value={ac.resultado}
                    onChange={e => handleAcao(i, 'resultado', e.target.value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SectionTitle>Datas e Assinaturas</SectionTitle>
        <div className="fa-grid-3">
          <div className="fa-field">
            <label>Plano Nº</label>
            <input name="planoNum" value={form.planoNum} onChange={handle} placeholder="Nº do Plano" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Data de Elaboração</label>
            <input name="dataElaboracao" value={form.dataElaboracao} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Data de Validade</label>
            <input name="dataValidade" value={form.dataValidade} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Data para Reavaliação</label>
            <input name="dataReavaliacao" value={form.dataReavaliacao} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Data de Desligamento</label>
            <input name="dataDesligamento" value={form.dataDesligamento} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
        </div>
        <div className="fa-grid-2" style={{ marginTop: 14 }}>
          <div className="fa-field">
            <label>Técnico de Referência do Atendimento</label>
            <input name="tecnicoRef" value={form.tecnicoRef} onChange={handle} className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Assinatura do Responsável pela Família</label>
            <input name="assinatura" value={form.assinatura} onChange={handle} placeholder="Nome para assinatura" className="fa-input" />
          </div>
        </div>

        <div className="form-actions">
          <Link to={`/detalhes-familia/${familia.id}`} className="btn-secondary">← Voltar</Link>
          <button className="btn-secondary" onClick={() => {}}>Salvar rascunho</button>
          <button className="btn-primary btn-success">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Salvar plano de desenvolvimento
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default PlanoDesenvolvimento;
