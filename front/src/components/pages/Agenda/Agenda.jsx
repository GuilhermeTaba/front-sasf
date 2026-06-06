import { useState, useEffect } from 'react';
import Layout from '../../Layout';
import './Agenda.css';
import {
  listarEventos,
  criarEvento,
  cancelarEvento,
  listarOrientadores,
  listarTecnicos,
  listarFamilias,
} from '../../../services/agendaService';

const H_START  = 8;
const H_END    = 18;
const H_PX     = 68;
const TOTAL_PX = (H_END - H_START) * H_PX;
const DIAS_PT  = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const PALETA = [
  { cor: '#1d4ed8', bg: '#dbeafe' },
  { cor: '#f59e0b', bg: '#fef3c7' },
  { cor: '#8b5cf6', bg: '#ede9fe' },
  { cor: '#0891b2', bg: '#cffafe' },
  { cor: '#16a34a', bg: '#dcfce7' },
  { cor: '#dc2626', bg: '#fee2e2' },
];

const getCor   = (idx) => idx < 0 ? '#6b7280' : PALETA[idx % PALETA.length].cor;
const getCorBg = (idx) => idx < 0 ? '#f3f4f6' : PALETA[idx % PALETA.length].bg;

const toMin    = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const topPx    = (t) => ((toMin(t) - H_START * 60) / 60) * H_PX;
const heightPx = (s, e) => Math.max(((toMin(e) - toMin(s)) / 60) * H_PX - 4, 22);
const fmtISO   = (d) => d.toISOString().split('T')[0];
const fmtShort = (d) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;

const toCalendario = (evt) => {
  const inicio = evt.dataHoraInicio.substring(11, 16);
  const fim    = evt.dataHoraFim.substring(11, 16);
  const data   = evt.dataHoraInicio.substring(0, 10);
  return {
    id:          evt.id,
    data,
    inicio,
    fim,
    tipo:        evt.tipo,
    titulo:      evt.titulo,
    status:      evt.status,
    tecnico:     evt.tecnico?.nome    || '—',
    tecnicoId:   evt.tecnico?.id      || null,
    orientador:  evt.orientador?.nome || '—',
    familia:     evt.familia?.codigoFamilia || '—',
    familiaId:   evt.familia?.id      || null,
    temConflito: evt.temConflito,
  };
};

const getSegundaAtual = () => {
  const hoje = new Date();
  const dia  = hoje.getDay();
  const diff = dia === 0 ? -6 : 1 - dia;
  const seg  = new Date(hoje);
  seg.setDate(hoje.getDate() + diff);
  seg.setHours(0, 0, 0, 0);
  return seg;
};
const BASE = getSegundaAtual();

const getWeek = (offset) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(BASE);
    d.setDate(BASE.getDate() + offset * 7 + i);
    return d;
  });

const Agenda = () => {
  const [weekOff, setWeekOff]   = useState(0);
  const [filtroTec, setFiltroTec] = useState(null);
  const [apts, setApts]         = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [orientadores, setOrientadores] = useState([]);
  const [familias, setFamilias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro]         = useState('');
  const [modal, setModal]       = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [selected, setSelected] = useState(null);
  const [conflito, setConflito] = useState(null);

  const [form, setForm] = useState({
    data: fmtISO(new Date()), inicio: '09:00', fim: '10:00',
    titulo: '', tipo: '', tecnicoId: '', orientadorId: '', familiaId: '',
  });

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const [evts, tecs, ors, fams] = await Promise.all([
          listarEventos(),
          listarTecnicos(),
          listarOrientadores(),
          listarFamilias(),
        ]);
        setApts(evts.filter(e => e.status !== 'CANCELADO').map(toCalendario));
        setTecnicos(tecs);
        setOrientadores(ors);
        setFamilias(fams);
      } catch (e) {
        setErro('Erro ao carregar agenda. Verifique sua conexão.');
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const tecIdx = (tecnicoId) => tecnicos.findIndex(t => t.id === tecnicoId);

  const week     = getWeek(weekOff);
  const hoje     = fmtISO(new Date());
  const semLabel = `${fmtShort(week[0])} – ${fmtShort(week[6])} · ${week[6].toLocaleString('pt-BR',{month:'long'})} de ${week[6].getFullYear()}`;

  const visibles = filtroTec === null ? apts : apts.filter(a => a.tecnicoId === filtroTec);
  const forDay   = (d) => { const s = fmtISO(d); return visibles.filter(a => a.data === s); };

  const salvar = async () => {
    if (!form.titulo || !form.tipo) return;
    setSalvando(true);
    try {
      const payload = {
        titulo:       form.titulo,
        tipo:         form.tipo,
        dataHoraInicio: `${form.data}T${form.inicio}:00`,
        dataHoraFim:    `${form.data}T${form.fim}:00`,
        tecnicoId:    form.tecnicoId    ? Number(form.tecnicoId)    : null,
        orientadorId: form.orientadorId ? Number(form.orientadorId) : null,
        familiaId:    form.familiaId    ? Number(form.familiaId)    : null,
      };

      const criado = await criarEvento(payload);
      setApts(p => [...p, toCalendario(criado)]);

      if (criado.temConflito) {
        setConflito(criado.conflitos);
      }

      setModal(false);
      setForm({ data: fmtISO(new Date()), inicio: '09:00', fim: '10:00', titulo: '', tipo: '', tecnicoId: '', orientadorId: '', familiaId: '' });
    } catch {
      setErro('Erro ao salvar evento.');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = async (id) => {
    try {
      await cancelarEvento(id);
      setApts(p => p.filter(a => a.id !== id));
      setSelected(null);
    } catch {
      setErro('Erro ao cancelar evento.');
    }
  };

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const hours = Array.from({ length: H_END - H_START }, (_, i) => H_START + i);

  return (
    <Layout>
      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Organização</p>
          <h1 className="page-title">Agenda</h1>
          <p className="page-sub">Atendimentos marcados para a semana</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          + Marcar atendimento
        </button>
      </div>

      {/* ── ERRO GLOBAL ── */}
      {erro && (
        <div className="ag-erro" onClick={() => setErro('')}>
          ⚠ {erro} <span style={{ opacity: 0.6, fontSize: 11 }}>clique para fechar</span>
        </div>
      )}

      {/* ── AVISO DE CONFLITO ── */}
      {conflito && (
        <div className="ag-conflito">
          <strong>⚠ Conflito de horário detectado!</strong> O evento foi salvo, mas há sobreposição com:
          {conflito.map((c, i) => (
            <span key={i}> "{c.titulo}" ({c.usuarioConflitante})</span>
          ))}
          <button onClick={() => setConflito(null)}>✕</button>
        </div>
      )}

      {/* ── FILTRO DE TÉCNICOS ── */}
      <div className="ag-bar">
        <button
          className={`ag-tec-btn${filtroTec === null ? ' ag-tec-btn--on' : ''}`}
          onClick={() => setFiltroTec(null)}
        >
          Todos
        </button>
        {tecnicos.map((t, i) => {
          const ativo = filtroTec === t.id;
          return (
            <button
              key={t.id}
              className={`ag-tec-btn${ativo ? ' ag-tec-btn--on' : ''}`}
              style={ativo ? { background: getCor(i), borderColor: getCor(i), color: '#fff' } : {}}
              onClick={() => setFiltroTec(t.id)}
            >
              <span className="ag-tec-dot" style={{ background: ativo ? '#fff' : getCor(i) }} />
              {t.nome}
            </button>
          );
        })}
      </div>

      {/* ── CALENDÁRIO ── */}
      <div className="ag-card">

        {/* Navegação de semana */}
        <div className="ag-nav">
          <button className="ag-nav-btn" onClick={() => setWeekOff(o => o - 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span className="ag-nav-label">{semLabel}</span>
          <button className="ag-nav-btn" onClick={() => setWeekOff(o => o + 1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          {weekOff !== 0 && (
            <button className="ag-hoje-btn" onClick={() => setWeekOff(0)}>Hoje</button>
          )}
        </div>

        {/* Estado de carregamento */}
        {carregando ? (
          <div className="ag-loading">Carregando agenda...</div>
        ) : (
          <div className="ag-grid-outer">

            {/* Coluna de horas */}
            <div className="ag-h-col">
              <div className="ag-h-top" />
              {hours.map(h => (
                <div key={h} className="ag-h-slot" style={{ height: H_PX }}>
                  <span>{String(h).padStart(2,'0')}:00</span>
                </div>
              ))}
            </div>

            {/* Colunas dos dias */}
            <div className="ag-days">
              {week.map((date, i) => {
                const isHoje = fmtISO(date) === hoje;
                const dayApts = forDay(date);
                return (
                  <div key={i} className="ag-day">
                    <div className={`ag-day-hd${isHoje ? ' ag-day-hd--hoje' : ''}`}>
                      <span className="ag-day-name">{DIAS_PT[i]}</span>
                      <span className={`ag-day-num${isHoje ? ' ag-day-num--hoje' : ''}`}>
                        {date.getDate()}
                      </span>
                    </div>

                    <div className="ag-day-body" style={{ height: TOTAL_PX }}>
                      {hours.map(h => (
                        <div key={h} className="ag-line" style={{ top: (h - H_START) * H_PX }} />
                      ))}
                      {dayApts.map(apt => {
                        const idx = tecIdx(apt.tecnicoId);
                        const cancelado = apt.status === 'CANCELADO';
                        return (
                          <div
                            key={apt.id}
                            className={`ag-apt${cancelado ? ' ag-apt--cancelado' : ''}`}
                            style={{
                              top:             topPx(apt.inicio),
                              height:          heightPx(apt.inicio, apt.fim),
                              background:      cancelado ? '#f3f4f6' : getCorBg(idx),
                              borderLeftColor: cancelado ? '#d1d5db' : getCor(idx),
                            }}
                            onClick={() => setSelected(apt)}
                          >
                            <span className="ag-apt-time">{apt.inicio}–{apt.fim}</span>
                            <span className="ag-apt-resp">{apt.titulo}</span>
                            {heightPx(apt.inicio, apt.fim) > 44 && (
                              <span className="ag-apt-tipo">{apt.tipo}</span>
                            )}
                            {filtroTec === null && heightPx(apt.inicio, apt.fim) > 56 && (
                              <span className="ag-apt-tec" style={{ color: getCor(idx) }}>
                                {apt.tecnico}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Detalhes do evento ── */}
      {selected && (
        <div className="ag-overlay" onClick={() => setSelected(null)}>
          <div className="ag-modal ag-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="ag-modal-hd">
              <span className="ag-modal-dot" style={{ background: getCor(tecIdx(selected.tecnicoId)) }} />
              <h2 className="ag-modal-title">{selected.titulo}</h2>
              <button className="ag-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="ag-modal-body">
              <div className="ag-detail-row">
                <span className="ag-detail-key">Tipo</span>
                <span className="ag-detail-val">{selected.tipo}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Técnico</span>
                <span className="ag-detail-val" style={{ color: getCor(tecIdx(selected.tecnicoId)) }}>{selected.tecnico}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Orientador</span>
                <span className="ag-detail-val">{selected.orientador}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Família</span>
                <span className="ag-detail-val">{selected.familia}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Data</span>
                <span className="ag-detail-val">{selected.data.split('-').reverse().join('/')}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Horário</span>
                <span className="ag-detail-val">{selected.inicio} – {selected.fim}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Status</span>
                <span className={`ag-badge ag-badge--${selected.status.toLowerCase()}`}>{selected.status}</span>
              </div>
            </div>
            <div className="ag-modal-ft">
              {selected.status !== 'CANCELADO' && (
                <button className="btn-danger" onClick={() => handleCancelar(selected.id)}>
                  Cancelar evento
                </button>
              )}
              <button className="btn-secondary" onClick={() => setSelected(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Novo evento ── */}
      {modal && (
        <div className="ag-overlay" onClick={() => setModal(false)}>
          <div className="ag-modal" onClick={e => e.stopPropagation()}>
            <div className="ag-modal-hd">
              <h2 className="ag-modal-title">Marcar atendimento</h2>
              <button className="ag-modal-close" onClick={() => setModal(false)}>✕</button>
            </div>

            <div className="ag-modal-body">
              {/* Título */}
              <div className="ag-field">
                <label className="ag-label">Título *</label>
                <input type="text" className="ag-input" placeholder="Ex: Triagem inicial" value={form.titulo} onChange={set('titulo')} />
              </div>

              {/* Data + Tipo */}
              <div className="ag-form-row2">
                <div className="ag-field">
                  <label className="ag-label">Data *</label>
                  <input type="date" className="ag-input" value={form.data} onChange={set('data')} />
                </div>
                <div className="ag-field">
                  <label className="ag-label">Tipo *</label>
                  <input type="text" className="ag-input" placeholder="Ex: Atendimento" value={form.tipo} onChange={set('tipo')} />
                </div>
              </div>

              {/* Início + Fim */}
              <div className="ag-form-row2">
                <div className="ag-field">
                  <label className="ag-label">Início</label>
                  <input type="time" className="ag-input" value={form.inicio} onChange={set('inicio')} />
                </div>
                <div className="ag-field">
                  <label className="ag-label">Fim</label>
                  <input type="time" className="ag-input" value={form.fim} onChange={set('fim')} />
                </div>
              </div>

              {/* Técnico */}
              <div className="ag-field">
                <label className="ag-label">Técnico</label>
                <select className="ag-input" value={form.tecnicoId} onChange={set('tecnicoId')}>
                  <option value="">Sem técnico</option>
                  {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>

              {/* Orientador */}
              <div className="ag-field">
                <label className="ag-label">Orientador</label>
                <select className="ag-input" value={form.orientadorId} onChange={set('orientadorId')}>
                  <option value="">Sem orientador</option>
                  {orientadores.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </div>

              {/* Família */}
              <div className="ag-field">
                <label className="ag-label">Família</label>
                <select className="ag-input" value={form.familiaId} onChange={set('familiaId')}>
                  <option value="">Sem família</option>
                  {familias.map(f => <option key={f.id} value={f.id}>{f.nomeRepresentante || f.codigoFamilia || `Família ${f.id}`}</option>)}
                </select>
              </div>
            </div>

            <div className="ag-modal-ft">
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={salvar}
                disabled={salvando || !form.titulo || !form.tipo}
                style={{ opacity: (!form.titulo || !form.tipo) ? 0.5 : 1 }}
              >
                {salvando ? 'Salvando...' : 'Marcar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Agenda;
