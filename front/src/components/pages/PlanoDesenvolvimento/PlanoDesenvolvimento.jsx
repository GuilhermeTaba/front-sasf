import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import Layout from '../../Layout';
import '../FichaAtualizacao/FichaAtualizacao.css';
import '../NovoCadastro/NovosCadastro.css';
import './PlanoDesenvolvimento.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const ANALISE_ITENS = [
  { key: 'composicao', label: 'Composição Familiar' },
  { key: 'moradia',    label: 'Moradia'              },
  { key: 'saude',      label: 'Saúde'                },
  { key: 'educacao',   label: 'Educação'             },
  { key: 'divida',     label: 'Dívida'               },
];

const emptyAcao = () => ({ estrategia: '', acaoCras: '', acaoFamilia: '', prazo: '', resultado: '' });

const emptyForm = () => ({
  servico: 'SASF Chico Mendes',
  cas: '', cras: '',
  representante: '',
  matricula: '', nis: '', rg: '',
  composicao: '', moradia: '', saude: '', educacao: '', divida: '',
  objetivo: '',
  planoNum: '', dataElaboracao: '', dataValidade: '',
  dataReavaliacao: '', dataDesligamento: '',
  tecnico: '',
});

const SectionTitle = ({ children }) => (
  <div className="fa-section-divider">
    <span className="fa-section-label">{children}</span>
  </div>
);

const parseDateBR = (str) => {
  if (!str) return null;
  const p = str.split('/');
  if (p.length === 3 && p[2].length === 4) {
    const d = parseInt(p[0]), m = parseInt(p[1]), y = parseInt(p[2]);
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return null;
    return `${p[2]}-${p[1]}-${p[0]}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return null;
};

const toDateBR = (iso) => {
  if (!iso) return '';
  const p = iso.split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
};

const parseAnalise = (str) => {
  const result = { composicao: '', moradia: '', saude: '', educacao: '', divida: '' };
  if (!str) return result;
  str.split('\n').forEach(line => {
    if (line.startsWith('Composição Familiar: ')) result.composicao = line.slice('Composição Familiar: '.length);
    else if (line.startsWith('Moradia: '))   result.moradia   = line.slice('Moradia: '.length);
    else if (line.startsWith('Saúde: '))     result.saude     = line.slice('Saúde: '.length);
    else if (line.startsWith('Educação: '))  result.educacao  = line.slice('Educação: '.length);
    else if (line.startsWith('Dívida: '))    result.divida    = line.slice('Dívida: '.length);
  });
  return result;
};

const PlanoDesenvolvimento = () => {
  const { id, planoId } = useParams();
  const navigate = useNavigate();

  const [familia,  setFamilia]  = useState(null);
  const [tecnicos, setTecnicos] = useState([]);
  const [form,     setForm]     = useState(emptyForm());
  const [acoes,    setAcoes]    = useState(Array.from({ length: 8 }, emptyAcao));
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    fetch(`${API_URL}/tecnicos`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTecnicos(Array.isArray(data) ? data : []))
      .catch(() => {});

    if (!id) return;

    fetch(`${API_URL}/familias/${id}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const responsavel = data.nomeRepresentante || data.nomeRepresentanteFamilia || '';
        setFamilia({ id: data.id, responsavel });
        if (!planoId) setForm(f => ({ ...f, representante: responsavel }));
      })
      .catch(() => {});

    if (!planoId) {
      setForm(emptyForm());
      setAcoes(Array.from({ length: 8 }, emptyAcao));
      return;
    }

    fetch(`${API_URL}/familias/${id}/desenvolvimentos/${planoId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const analise = parseAnalise(data.analiseDiagnostica);
        setForm({
          servico:        data.nomeServicoSASF       || 'SASF Chico Mendes',
          cas:            data.CAS                   || '',
          cras:           data.CRAS                  || '',
          representante:  data.nomeRepresentanteFamilia || '',
          matricula:      data.numeroMatricula        || '',
          nis:            data.numeroNIS_BDC          || '',
          rg:             data.numeroRG               || '',
          composicao:     analise.composicao,
          moradia:        analise.moradia,
          saude:          analise.saude,
          educacao:       analise.educacao,
          divida:         analise.divida,
          objetivo:       data.objetivo              || '',
          planoNum:       data.numeroPlano           || '',
          dataElaboracao: toDateBR(data.dataElaboracaoPlano),
          dataValidade:   toDateBR(data.dataValidadePlano),
          dataReavaliacao: toDateBR(data.dataReavaliacaoPlano),
          dataDesligamento: toDateBR(data.dataDesligamento),
          tecnico:        data.tecnico               || '',
        });
        if (data.itens?.length) {
          const novos = Array.from({ length: 8 }, emptyAcao);
          data.itens.forEach((item, i) => {
            if (i < novos.length) novos[i] = {
              estrategia:  item.estrategiasIntervencao || '',
              acaoCras:    item.CRAS                   || '',
              acaoFamilia: item.familia                || '',
              prazo:       item.prazo                  || '',
              resultado:   item.resultadosEsperados    || '',
            };
          });
          setAcoes(novos);
        }
      })
      .catch(() => {});
  }, [id, planoId]);

  const maskDate = v => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  };

  const DATE_FIELDS = new Set(['dataElaboracao', 'dataValidade', 'dataReavaliacao', 'dataDesligamento']);

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: DATE_FIELDS.has(name) ? maskDate(value) : value }));
  };

  const handleAcao = (idx, field, value) =>
    setAcoes(a => a.map((ac, i) => i === idx ? { ...ac, [field]: value } : ac));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    const analiseDiagnostica = [
      form.composicao && `Composição Familiar: ${form.composicao}`,
      form.moradia    && `Moradia: ${form.moradia}`,
      form.saude      && `Saúde: ${form.saude}`,
      form.educacao   && `Educação: ${form.educacao}`,
      form.divida     && `Dívida: ${form.divida}`,
    ].filter(Boolean).join('\n');
    const itensFiltered = acoes
      .filter(a => a.estrategia || a.acaoCras || a.acaoFamilia || a.prazo || a.resultado)
      .map(a => ({
        estrategiasIntervencao: a.estrategia  || null,
        CRAS:                   a.acaoCras    || null,
        familia:                a.acaoFamilia || null,
        prazo:                  a.prazo       || null,
        resultadosEsperados:    a.resultado   || null,
      }));
    const itens = itensFiltered.length > 0 ? itensFiltered : null;
    const payload = {
      nomeServicoSASF:          form.servico,
      CAS:                      form.cas,
      CRAS:                     form.cras,
      nomeRepresentanteFamilia: form.representante,
      numeroMatricula:          form.matricula,
      numeroNIS_BDC:            form.nis,
      numeroRG:                 form.rg,
      analiseDiagnostica,
      objetivo:                 form.objetivo,
      itens,
      numeroPlano:              form.planoNum,
      dataElaboracaoPlano:      parseDateBR(form.dataElaboracao),
      dataValidadePlano:        parseDateBR(form.dataValidade),
      dataReavaliacaoPlano:     parseDateBR(form.dataReavaliacao),
      dataDesligamento:         parseDateBR(form.dataDesligamento),
      tecnico:                  form.tecnico || null,
    };
    console.log('[PlanoDesenvolvimento] payload enviado:', JSON.stringify(payload, null, 2));
    const endpoint = planoId
      ? `${API_URL}/familias/${id}/desenvolvimentos/${planoId}`
      : `${API_URL}/familias/${id}/desenvolvimentos`;
    try {
      const res = await fetch(endpoint, {
        method: planoId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let detail = `Erro ${res.status}`;
        try { const body = await res.json(); detail = JSON.stringify(body); } catch {}
        console.error('[PlanoDesenvolvimento] erro backend:', detail);
        throw new Error(detail);
      }
      navigate(`/detalhes-familia/${id}`, { state: { tab: 'planoDesenvolvimento' } });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        {familia && (
          <>
            <span className="bc-sep">›</span>
            <Link to={`/detalhes-familia/${id}`} className="bc-link">{familia.responsavel}</Link>
          </>
        )}
        <span className="bc-sep">›</span>
        <span className="bc-current">Plano de Desenvolvimento Familiar</span>
      </div>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#0d9488', fontWeight: 700 }}>Desenvolvimento familiar</p>
          <h1 className="page-title">Plano de Desenvolvimento Familiar</h1>
          <p className="page-sub">UNAS / SASF Chico Mendes · Fl. 1/2 e 2/2</p>
        </div>
      </div>

      <div className="form-card">

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

        <SectionTitle>Datas e Técnico</SectionTitle>
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
          <div className="fa-field">
            <label>Técnico de Referência</label>
            <select name="tecnico" value={form.tecnico} onChange={handle} className="fa-input">
              <option value="">Selecione um técnico...</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.nome}>{t.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {error && <p style={{ color: '#dc2626', margin: '8px 0' }}>{error}</p>}
        <div className="form-actions">
          <Link to={`/detalhes-familia/${id}`} className="btn-secondary">← Voltar</Link>

          <button className="btn-primary btn-success" onClick={handleSubmit} disabled={saving}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {saving ? 'Salvando…' : planoId ? 'Salvar alterações' : 'Salvar plano de desenvolvimento'}
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default PlanoDesenvolvimento;
