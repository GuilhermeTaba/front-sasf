import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import Layout from '../../Layout';
import './FichaAtualizacao.css';


const emptyMembro = () => ({
  nome: '', escola: '', serie: '', nascimento: '',
  m: false, t: false, n: false,
});

const SectionTitle = ({ children }) => (
  <div className="fa-section-divider">
    <span className="fa-section-label">{children}</span>
  </div>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const parseDateBR = (str) => {
  if (!str) return null;
  const p = str.split('/');
  if (p.length === 3 && p[2].length === 4) return `${p[2]}-${p[1]}-${p[0]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  return null;
};


const FichaAtualizacao = () => {
  const { id, fichaId } = useParams();
  const navigate = useNavigate();
  const [familia, setFamilia] = useState(null);

  const [form, setForm] = useState({
    nascResp:         '',
    nis:              '',
    cpf:              '',
    matricula:        '',
    nomeSocial:       '',
    /* faixa etária */
    fx0a5:   '', fx6a14: '', fx15a17: '', fx18a29: '',
    fx30a59: '', fx60m:  '', nPcd:    '',
    /* benefícios */
    bpcIdoso: '', bpcPcd: '', bolsaFamilia: '',
    condicionalidades: '', statusBenef: '',
    /* situação escolar */
    agCei0a5: '', freCei: '', freEmei: '', fora6a17: '', agVaga6a17: '',
    ensFund: '', ensMedio: '', ejaOuSimilar: '', pcdEspecial: '', cursoSup: '',
    /* rede socioassistencial */
    cca: '', ci: '', cedesp: '', nci: '', naispd: '',
    /* saúde */
    vacinados: '', gestantes: '', gestantesPreNatal: '',
    /* vulnerabilidade */
    sitRua: '', trabInfantil: '', alcoolDrogas: '',
    adolMSEAberto: '', adolMSEInternacao: '',
    adultoPrivLiberdade: '', criancaSaica: '', idosoAcolhimento: '',
    /* obs e técnico */
    observacoes: '',
    tipoProntuario: '',
    dt:            '',
    tecnicoId:     '',
    responsavel:   '',
  });

  const [membros, setMembros] = useState(Array.from({ length: 6 }, emptyMembro));
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [tecnicos, setTecnicos] = useState([]);

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
        setFamilia({ id: data.id, responsavel: data.nomeRepresentante || data.nomeRepresentanteFamilia || '' });
      })
      .catch(() => {});

    if (!fichaId) return;

    // Modo edição: busca ficha existente e pré-preenche
    fetch(`${API_URL}/familias/${id}/atualizacoes/${fichaId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const toDateBR = iso => {
          if (!iso) return '';
          const p = iso.split('-');
          return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
        };
        const str = v => (v != null ? String(v) : '');
        setForm(f => ({
          ...f,
          matricula:          data.numeroMatricula || '',
          nomeSocial:         data.nomeSocialRepresentante || '',
          nascResp:           toDateBR(data.dataNascimento),
          nis:                data.nis || '',
          cpf:                data.cpf || '',
          fx0a5:              str(data.zeroACinco),
          fx6a14:             str(data.seisAQuatorze),
          fx15a17:            str(data.quinzeADezessete),
          fx18a29:            str(data.dezoitoAVinteENove),
          fx30a59:            str(data.trintaACinquentaENove),
          fx60m:              str(data.sessentaMais),
          nPcd:               str(data.pcd),
          bpcIdoso:           str(data.bpcIdoso),
          bpcPcd:             str(data.bpcPcd),
          bolsaFamilia:       str(data.bolsaFamilia),
          condicionalidades:  data.condicionalidades || '',
          statusBenef:        data.status || '',
          agCei0a5:           str(data.aguardandoVagaEmei),
          freCei:             str(data.frequentaCei),
          freEmei:            str(data.frequentaEmei),
          fora6a17:           str(data.foraEscola),
          agVaga6a17:         str(data.aguardandoVagaEscola),
          ensFund:            str(data.ensinoFundamental),
          ensMedio:           str(data.ensinoMedio),
          ejaOuSimilar:       str(data.eja),
          pcdEspecial:        str(data.pcdEscola),
          cursoSup:           str(data.cursoSuperior),
          cca:                str(data.cca),
          ci:                 str(data.cj),
          cedesp:             str(data.cedesp),
          nci:                str(data.nci),
          naispd:             str(data.naispd),
          vacinados:          str(data.vacinaAtualizada),
          gestantes:          str(data.mulheresGestantes),
          gestantesPreNatal:  str(data.gestantesPreNatal),
          sitRua:             str(data.situacaoRua),
          trabInfantil:       str(data.trabalhoInfantil),
          alcoolDrogas:       str(data.dependencia),
          adolMSEAberto:      str(data.adolescenteMse),
          adolMSEInternacao:  str(data.adolescenteInternacao),
          adultoPrivLiberdade: str(data.adultoPrivado),
          criancaSaica:       str(data.criancasSaica),
          idosoAcolhimento:   str(data.idosoAcolhimento),
          observacoes:        data.observacoes || '',
          tipoProntuario:     data.pdf ? 'PDF' : data.pdu ? 'PDU' : '',
          dt:                 data.dt || '',
          tecnicoId:          data.tecnicoId ? String(data.tecnicoId) : '',
          responsavel:        data.responsavel || '',
        }));
        if (data.membrosAtualizados?.length) {
          setMembros(prev => {
            const next = [...prev];
            data.membrosAtualizados.forEach((m, i) => {
              if (i < next.length) next[i] = {
                nome:       m.nome || '',
                escola:     m.escola || '',
                serie:      m.serie != null ? String(m.serie) : '',
                nascimento: toDateBR(m.dataNascimento),
                m:          m.m  || false,
                t:          m.t  || false,
                n:          m.n  || false,
              };
            });
            return next;
          });
        }
      })
      .catch(() => {});
  }, [id, fichaId]);

  const maskDate = v => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
  };

  const DATE_FIELDS = new Set(['nascResp', 'dt']);

  const handle = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: DATE_FIELDS.has(name) ? maskDate(value) : value }));
  };

  const handleMembro = (idx, field, value) =>
    setMembros(prev => prev.map((mb, i) =>
      i === idx ? { ...mb, [field]: value } : mb
    ));

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    const membrosPayload = membros
      .filter(m => m.nome)
      .map(m => ({
        nome: m.nome,
        dataNascimento: parseDateBR(m.nascimento),
        escola: m.escola,
        serie: m.serie ? parseInt(m.serie) : null,
        m: m.m,
        t: m.t,
        n: m.n,
      }));
    const num = (v) => v !== '' ? Number(v) : null;
    const payload = {
      numeroMatricula: form.matricula,
      nomeRepresentanteFamilia: familia?.responsavel || '',
      nomeSocialRepresentante: form.nomeSocial || null,
      nis: form.nis,
      cpf: form.cpf,
      dataNascimento: parseDateBR(form.nascResp),
      membrosAtualizados: membrosPayload,
      zeroACinco: num(form.fx0a5),
      seisAQuatorze: num(form.fx6a14),
      quinzeADezessete: num(form.fx15a17),
      dezoitoAVinteENove: num(form.fx18a29),
      trintaACinquentaENove: num(form.fx30a59),
      sessentaMais: num(form.fx60m),
      pcd: num(form.nPcd),
      bpcIdoso: num(form.bpcIdoso),
      bpcPcd: num(form.bpcPcd),
      bolsaFamilia: num(form.bolsaFamilia),
      condicionalidades: form.condicionalidades,
      status: form.statusBenef,
      aguardandoVagaEmei: num(form.agCei0a5),
      frequentaCei: num(form.freCei),
      frequentaEmei: num(form.freEmei),
      foraEscola: num(form.fora6a17),
      aguardandoVagaEscola: num(form.agVaga6a17),
      ensinoFundamental: num(form.ensFund),
      ensinoMedio: num(form.ensMedio),
      eja: num(form.ejaOuSimilar),
      pcdEscola: num(form.pcdEspecial),
      cursoSuperior: num(form.cursoSup),
      cca: num(form.cca),
      cj: num(form.ci),
      cedesp: num(form.cedesp),
      nci: num(form.nci),
      naispd: num(form.naispd),
      vacinaAtualizada: num(form.vacinados),
      mulheresGestantes: num(form.gestantes),
      gestantesPreNatal: num(form.gestantesPreNatal),
      situacaoRua: num(form.sitRua),
      trabalhoInfantil: num(form.trabInfantil),
      dependencia: num(form.alcoolDrogas),
      adolescenteMse: num(form.adolMSEAberto),
      adolescenteInternacao: num(form.adolMSEInternacao),
      adultoPrivado: num(form.adultoPrivLiberdade),
      criancasSaica: num(form.criancaSaica),
      idosoAcolhimento: num(form.idosoAcolhimento),
      observacoes: form.observacoes,
      pdf: form.tipoProntuario === 'PDF',
      pdu: form.tipoProntuario === 'PDU',
      dt: form.dt || null,
      tecnicoId: Number(form.tecnicoId) || null,
      responsavel: form.responsavel,
    };
    const endpoint = fichaId
      ? `${API_URL}/familias/${id}/atualizacoes/${fichaId}`
      : `${API_URL}/familias/${id}/atualizacoes`;
    const method = fichaId ? 'PUT' : 'POST';
    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let msg = `Erro ${res.status}`;
        try { const b = await res.json(); msg = b.message || b.error || JSON.stringify(b); } catch {}
        throw new Error(msg);
      }
      navigate(`/detalhes-familia/${id}`, { state: { tab: 'atualizacao' } });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const NumInput = ({ name, placeholder = '0' }) => (
    <input
      type="number" min="0" name={name} value={form[name]}
      onChange={handle} placeholder={placeholder}
      className="fa-num-input"
    />
  );

  return (
    <Layout>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        {familia && (
          <>
            <span className="bc-sep">›</span>
            <Link to={`/detalhes-familia/${id}`} className="bc-link">{familia.responsavel}</Link>
          </>
        )}
        <span className="bc-sep">›</span>
        <span className="bc-current">Ficha de Atualização</span>
      </div>

      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <p className="page-section" style={{ color: '#16a34a', fontWeight: 700 }}>🔄 Atualização</p>
          <h1 className="page-title">Ficha de Atualização — Quadro Situacional</h1>
          <p className="page-sub">Composição Familiar · UNAS / SASF Chico Mendes</p>
        </div>
      </div>

      <div className="form-card">

        {/* ── IDENTIFICAÇÃO ── */}
        <SectionTitle>Identificação da Família</SectionTitle>
        <div className="fa-grid-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="fa-field">
            <label>Data de Nasc. do Responsável</label>
            <input name="nascResp" value={form.nascResp} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>NIS</label>
            <input name="nis" value={form.nis} onChange={handle} placeholder="Nº NIS" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>CPF</label>
            <input name="cpf" value={form.cpf} onChange={handle} placeholder="000.000.000-00" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Matrícula</label>
            <input name="matricula" value={form.matricula} onChange={handle} placeholder="Nº Matrícula" className="fa-input" />
          </div>
          <div className="fa-field" style={{ gridColumn: '1 / -1' }}>
            <label>Nome Social do Responsável</label>
            <input name="nomeSocial" value={form.nomeSocial} onChange={handle} placeholder="Nome social (se houver)" className="fa-input" />
          </div>
        </div>

        {/* ── COMPOSIÇÃO FAMILIAR ── */}
        <SectionTitle>Composição Familiar</SectionTitle>
        <p className="fa-hint">Preencha os dados de cada membro da família (até 6 membros).</p>

        <div className="fa-table-wrap">
          <table className="fa-table">
            <thead>
              <tr>
                <th className="fa-th-num">Nº</th>
                <th>Nome</th>
                <th>Escola</th>
                <th>Série</th>
                <th>Data de Nasc.</th>
                <th style={{ textAlign: 'center' }}>M</th>
                <th style={{ textAlign: 'center' }}>T</th>
                <th style={{ textAlign: 'center' }}>N</th>
              </tr>
            </thead>
            <tbody>
              {membros.map((mb, i) => (
                <tr key={i} className={i % 2 === 0 ? 'fa-tr-even' : 'fa-tr-odd'}>
                  <td className="fa-td-num">{i + 1}.</td>
                  <td>
                    <input className="fa-tbl-input" value={mb.nome}
                      onChange={e => handleMembro(i, 'nome', e.target.value)}
                      placeholder="Nome completo" />
                  </td>
                  <td>
                    <input className="fa-tbl-input fa-tbl-sm" value={mb.escola}
                      onChange={e => handleMembro(i, 'escola', e.target.value)}
                      placeholder="Nome da escola" />
                  </td>
                  <td>
                    <input className="fa-tbl-input fa-tbl-xs" value={mb.serie}
                      onChange={e => handleMembro(i, 'serie', e.target.value)}
                      placeholder="Ex: 5º" />
                  </td>
                  <td>
                    <input className="fa-tbl-input fa-tbl-xs" value={mb.nascimento}
                      onChange={e => handleMembro(i, 'nascimento', maskDate(e.target.value))}
                      placeholder="dd/mm/aaaa" />
                  </td>
                  {['m','t','n'].map(field => (
                    <td key={field} style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={mb[field]}
                        onChange={e => handleMembro(i, field, e.target.checked)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── FAIXA ETÁRIA ── */}
        <SectionTitle>Faixa Etária dos Membros da Família (informar quantidade em cada faixa)</SectionTitle>
        <div className="fa-faixa-grid">
          {[
            { name: 'fx0a5',   label: '0 a 5 anos'     },
            { name: 'fx6a14',  label: '6 a 14 anos'    },
            { name: 'fx15a17', label: '15 a 17 anos'   },
            { name: 'fx18a29', label: '18 a 29 anos'   },
            { name: 'fx30a59', label: '30 a 59 anos'   },
            { name: 'fx60m',   label: '60 anos ou mais' },
            { name: 'nPcd',    label: 'Nº PCD'          },
          ].map(f => (
            <div key={f.name} className="fa-faixa-cell">
              <span className="fa-faixa-label">{f.label}</span>
              <NumInput name={f.name} />
            </div>
          ))}
        </div>

        {/* ── BENEFÍCIOS ── */}
        <SectionTitle>Benefícios (informar quantidade) e Situação dos Benefícios</SectionTitle>
        <div className="fa-grid-3">
          <div className="fa-beneficio-grupo">
            <p className="fa-sub-label">Benefícios (qtde)</p>
            <div className="fa-beneficio-row">
              <div className="fa-field fa-field--sm">
                <label>BPC — Idoso</label>
                <NumInput name="bpcIdoso" />
              </div>
              <div className="fa-field fa-field--sm">
                <label>BPC / PCD</label>
                <NumInput name="bpcPcd" />
              </div>
              <div className="fa-field fa-field--sm">
                <label>Bolsa Família</label>
                <NumInput name="bolsaFamilia" />
              </div>
            </div>
          </div>
          <div className="fa-field">
            <label>Condicionalidades</label>
            <input name="condicionalidades" value={form.condicionalidades}
              onChange={handle} placeholder="Descrever" className="fa-input" />
          </div>
          <div className="fa-field">
            <label>Status dos Benefícios</label>
            <select name="statusBenef" value={form.statusBenef} onChange={handle} className="fa-input">
              <option value="">Selecione...</option>
              <option>Regular</option>
              <option>Irregular</option>
              <option>Suspenso</option>
              <option>Cancelado</option>
            </select>
          </div>
        </div>

        {/* ── SITUAÇÃO ESCOLAR ── */}
        <SectionTitle>Situação Escolar — informar quantidade</SectionTitle>
        <div className="fa-faixa-grid fa-faixa-grid--big">
          {[
            { name: 'agCei0a5',   label: '00 a 05 anos aguardando vaga em CEI/EMEI' },
            { name: 'freCei',     label: 'Frequenta CEI'                              },
            { name: 'freEmei',    label: 'Frequenta EMEI'                             },
            { name: 'fora6a17',   label: '06 a 17 anos fora da escola'               },
            { name: 'agVaga6a17', label: '06 a 17 anos aguardando vaga na escola'    },
            { name: 'ensFund',    label: 'Ens. Fundamental'                           },
            { name: 'ensMedio',   label: 'Ensino Médio'                              },
            { name: 'ejaOuSimilar', label: 'EJA / MOVA / CIEJa ou similar'         },
            { name: 'pcdEspecial',  label: 'PCD escola/sala de ed. especial'        },
            { name: 'cursoSup',     label: 'Curso Superior'                         },
          ].map(f => (
            <div key={f.name} className="fa-faixa-cell">
              <span className="fa-faixa-label">{f.label}</span>
              <NumInput name={f.name} />
            </div>
          ))}
        </div>

        {/* ── REDE SOCIOASSISTENCIAL + SAÚDE ── */}
        <SectionTitle>Rede Socioassistencial e Saúde — informar quantidade</SectionTitle>
        <div className="fa-grid-2">
          <div>
            <p className="fa-sub-label">Rede Socioassistencial (qtde)</p>
            <div className="fa-faixa-grid">
              {[
                { name: 'cca',    label: 'CCA'    },
                { name: 'ci',     label: 'CI'     },
                { name: 'cedesp', label: 'CEDESP' },
                { name: 'nci',    label: 'NCI'    },
                { name: 'naispd', label: 'NAISPD' },
              ].map(f => (
                <div key={f.name} className="fa-faixa-cell">
                  <span className="fa-faixa-label">{f.label}</span>
                  <NumInput name={f.name} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="fa-sub-label">Saúde (qtde)</p>
            <div className="fa-faixa-grid">
              {[
                { name: 'vacinados',          label: 'Crianças até 07 anos com carteira de vacinação atualizada' },
                { name: 'gestantes',          label: 'Mulheres gestantes na família'                              },
                { name: 'gestantesPreNatal',  label: 'Gestantes com Pré-Natal'                                    },
              ].map(f => (
                <div key={f.name} className="fa-faixa-cell">
                  <span className="fa-faixa-label">{f.label}</span>
                  <NumInput name={f.name} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── VULNERABILIDADE SOCIAL ── */}
        <SectionTitle>Situações de Vulnerabilidade Social — informar quantidade</SectionTitle>
        <div className="fa-faixa-grid fa-faixa-grid--big">
          {[
            { name: 'sitRua',             label: 'Em Situação de Rua'                          },
            { name: 'trabInfantil',       label: 'Em Situação de Trabalho Infantil'             },
            { name: 'alcoolDrogas',       label: 'Dependência de Álcool/Drogas'                 },
            { name: 'adolMSEAberto',      label: 'Adolescente em MSE — Meio Aberto'             },
            { name: 'adolMSEInternacao',  label: 'Adolescente em MSE — Internação'              },
            { name: 'adultoPrivLiberdade',label: 'Adultos em Privação de Liberdade'             },
            { name: 'criancaSaica',       label: 'Criança/Adolescente em SAICA'                 },
            { name: 'idosoAcolhimento',   label: 'Idoso em situação de Acolhimento Institucional' },
          ].map(f => (
            <div key={f.name} className="fa-faixa-cell">
              <span className="fa-faixa-label">{f.label}</span>
              <NumInput name={f.name} />
            </div>
          ))}
        </div>

        {/* ── OBSERVAÇÕES ── */}
        <SectionTitle>Observações</SectionTitle>
        <div className="fa-field">
          <textarea
            name="observacoes" value={form.observacoes} onChange={handle}
            className="fa-textarea" rows={4}
            placeholder="Registre aqui observações relevantes sobre a situação da família..." />
        </div>

        {/* ── TÉCNICO / PRONTUÁRIO ── */}
        <SectionTitle>Técnico e Prontuário</SectionTitle>
        <div className="fa-grid-4">
          <div className="fa-field">
            <label>Tipo de Prontuário</label>
            <div className="fa-check-row">
              {['PDF','PDU'].map(t => (
                <label key={t} className={`fa-check-opt${form.tipoProntuario === t ? ' fa-check-opt--on' : ''}`}>
                  <input type="radio" name="tipoProntuario" value={t}
                    checked={form.tipoProntuario === t} onChange={handle} />
                  {t}
                </label>
              ))}
            </div>
          </div>
          <div className="fa-field">
            <label>DT</label>
            <input name="dt" value={form.dt} onChange={handle} placeholder="dd/mm/aaaa" className="fa-input" />
          </div>
          <div className="fa-field fa-field--span2">
            <label>Técnico Responsável</label>
            <select name="tecnicoId" value={form.tecnicoId} onChange={handle} className="fa-input">
              <option value="">Selecione um técnico...</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── ASSINATURAS ── */}
        <SectionTitle>Assinatura</SectionTitle>
        <div className="fa-assin-wrap">
          <div className="fa-assin-grid">
            <div className="fa-assin-col">
              <input name="responsavel" value={form.responsavel} onChange={handle}
                placeholder="Nome do responsável" className="fa-input fa-assin-input" />
              <div className="fa-assin-line" />
              <p className="fa-assin-label">Responsável</p>
            </div>
          </div>
        </div>

        {/* ── AÇÕES ── */}
        {error && <p style={{ color: '#dc2626', margin: '8px 0' }}>{error}</p>}
        <div className="form-actions">
          <Link to={`/detalhes-familia/${id}`} className="btn-secondary">← Voltar</Link>

          <button className="btn-primary btn-success" onClick={handleSubmit} disabled={saving}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {saving ? 'Salvando…' : fichaId ? 'Salvar alterações' : 'Salvar ficha de atualização'}
          </button>
        </div>

      </div>
    </Layout>
  );
};

export default FichaAtualizacao;
