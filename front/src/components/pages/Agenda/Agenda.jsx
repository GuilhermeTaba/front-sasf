import { useState } from 'react';
import Layout from '../../Layout';
import './Agenda.css';

/* ── Constantes ── */
const H_START  = 8;   // 08:00
const H_END    = 18;  // 18:00
const H_PX     = 68;  // px por hora
const TOTAL_PX = (H_END - H_START) * H_PX;

const DIAS_PT  = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const TECNICOS = ['Todos', 'Ana Silva', 'Carlos Mendes', 'Beatriz Rocha', 'Elisa Tavares'];

const COR = {
  'Ana Silva':     '#1d4ed8',
  'Carlos Mendes': '#f59e0b',
  'Beatriz Rocha': '#8b5cf6',
  'Elisa Tavares': '#0891b2',
};
const COR_BG = {
  'Ana Silva':     '#dbeafe',
  'Carlos Mendes': '#fef3c7',
  'Beatriz Rocha': '#ede9fe',
  'Elisa Tavares': '#cffafe',
};

const RESPONSAVEIS = [
  'Carlos Oliveira', 'Marta Lima', 'João Ribeiro', 'Fernanda Souza',
  'Paulo Costa', 'Lúcia Pereira', 'Ricardo Mendes', 'Sandra Almeida',
];
const TIPOS = [
  'Visita domiciliar', 'Acompanhamento', 'Entrevista social',
  'Encaminhamento', 'Reunião de grupo',
];

/* ── Dados iniciais ── */
const INIT = [
  { id:1,  data:'2026-05-25', inicio:'09:00', fim:'10:00', tipo:'Visita domiciliar',  responsavel:'Carlos Oliveira', tecnico:'Ana Silva'     },
  { id:2,  data:'2026-05-25', inicio:'11:00', fim:'11:30', tipo:'Acompanhamento',     responsavel:'Marta Lima',      tecnico:'Carlos Mendes' },
  { id:3,  data:'2026-05-25', inicio:'14:00', fim:'15:00', tipo:'Entrevista social',  responsavel:'Paulo Costa',     tecnico:'Beatriz Rocha' },
  { id:4,  data:'2026-05-26', inicio:'09:00', fim:'10:00', tipo:'Entrevista social',  responsavel:'João Ribeiro',    tecnico:'Ana Silva'     },
  { id:5,  data:'2026-05-26', inicio:'14:00', fim:'15:00', tipo:'Encaminhamento',     responsavel:'Fernanda Souza',  tecnico:'Beatriz Rocha' },
  { id:6,  data:'2026-05-27', inicio:'10:00', fim:'11:00', tipo:'Visita domiciliar',  responsavel:'Paulo Costa',     tecnico:'Carlos Mendes' },
  { id:7,  data:'2026-05-27', inicio:'14:00', fim:'15:00', tipo:'Acompanhamento',     responsavel:'Lúcia Pereira',   tecnico:'Elisa Tavares' },
  { id:8,  data:'2026-05-28', inicio:'08:00', fim:'09:00', tipo:'Reunião de grupo',   responsavel:'Ricardo Mendes',  tecnico:'Ana Silva'     },
  { id:9,  data:'2026-05-28', inicio:'11:00', fim:'12:00', tipo:'Visita domiciliar',  responsavel:'Sandra Almeida',  tecnico:'Beatriz Rocha' },
  { id:10, data:'2026-05-29', inicio:'09:00', fim:'10:30', tipo:'Entrevista social',  responsavel:'Carlos Oliveira', tecnico:'Elisa Tavares' },
  { id:11, data:'2026-05-29', inicio:'13:00', fim:'14:00', tipo:'Acompanhamento',     responsavel:'Marta Lima',      tecnico:'Ana Silva'     },
];

/* ── Helpers ── */
const toMin    = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const topPx    = (t) => ((toMin(t) - H_START * 60) / 60) * H_PX;
const heightPx = (s, e) => Math.max(((toMin(e) - toMin(s)) / 60) * H_PX - 4, 22);
const fmtISO   = (d) => d.toISOString().split('T')[0];
const fmtShort = (d) => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;

/* Semana base: seg 25/05/2026 */
const BASE = new Date(2026, 4, 25);

const getWeek = (offset) =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(BASE);
    d.setDate(BASE.getDate() + offset * 7 + i);
    return d;
  });

/* ── Componente ── */
const Agenda = () => {
  const [weekOff, setWeekOff]   = useState(0);
  const [filtro, setFiltro]     = useState('Todos');
  const [apts, setApts]         = useState(INIT);
  const [modal, setModal]       = useState(false);
  const [selected, setSelected] = useState(null); // apt selecionado para ver detalhes
  const [form, setForm]         = useState({
    data: '2026-05-25', inicio: '09:00', fim: '10:00',
    tipo: '', responsavel: '', tecnico: 'Ana Silva',
  });

  const week     = getWeek(weekOff);
  const semLabel = `${fmtShort(week[0])} – ${fmtShort(week[6])} · ${week[6].toLocaleString('pt-BR',{month:'long'})} de ${week[6].getFullYear()}`;

  const visibles = filtro === 'Todos' ? apts : apts.filter(a => a.tecnico === filtro);
  const forDay   = (d) => { const s = fmtISO(d); return visibles.filter(a => a.data === s); };

  const salvar = () => {
    if (!form.tipo || !form.responsavel) return;
    setApts(p => [...p, { ...form, id: Date.now() }]);
    setModal(false);
    setForm({ data: '2026-05-25', inicio: '09:00', fim: '10:00', tipo: '', responsavel: '', tecnico: 'Ana Silva' });
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

      {/* ── SELETOR DE TÉCNICOS ── */}
      <div className="ag-bar">
        {TECNICOS.map(t => {
          const ativo = filtro === t;
          return (
            <button
              key={t}
              className={`ag-tec-btn${ativo ? ' ag-tec-btn--on' : ''}`}
              style={ativo && t !== 'Todos'
                ? { background: COR[t], borderColor: COR[t], color: '#fff' }
                : {}}
              onClick={() => setFiltro(t)}
            >
              {t !== 'Todos' && (
                <span className="ag-tec-dot" style={{ background: ativo ? '#fff' : COR[t] }} />
              )}
              {t}
            </button>
          );
        })}
      </div>

      {/* ── CALENDÁRIO ── */}
      <div className="ag-card">

        {/* Navegação */}
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

        {/* Grade */}
        <div className="ag-grid-outer">

          {/* Coluna de horas */}
          <div className="ag-h-col">
            <div className="ag-h-top" /> {/* espaço do header dos dias */}
            {hours.map(h => (
              <div key={h} className="ag-h-slot" style={{ height: H_PX }}>
                <span>{String(h).padStart(2,'0')}:00</span>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          <div className="ag-days">
            {week.map((date, i) => {
              const isHoje = fmtISO(date) === '2026-05-25';
              const dayApts = forDay(date);
              return (
                <div key={i} className="ag-day">

                  {/* Header do dia */}
                  <div className={`ag-day-hd${isHoje ? ' ag-day-hd--hoje' : ''}`}>
                    <span className="ag-day-name">{DIAS_PT[i]}</span>
                    <span className={`ag-day-num${isHoje ? ' ag-day-num--hoje' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Corpo com linhas e agendamentos */}
                  <div className="ag-day-body" style={{ height: TOTAL_PX }}>
                    {hours.map(h => (
                      <div
                        key={h}
                        className="ag-line"
                        style={{ top: (h - H_START) * H_PX }}
                      />
                    ))}

                    {dayApts.map(apt => (
                      <div
                        key={apt.id}
                        className="ag-apt"
                        style={{
                          top:             topPx(apt.inicio),
                          height:          heightPx(apt.inicio, apt.fim),
                          background:      COR_BG[apt.tecnico] || '#f0f4ff',
                          borderLeftColor: COR[apt.tecnico]    || '#1d4ed8',
                        }}
                        onClick={() => setSelected(apt)}
                      >
                        <span className="ag-apt-time">{apt.inicio}–{apt.fim}</span>
                        <span className="ag-apt-resp">{apt.responsavel}</span>
                        {heightPx(apt.inicio, apt.fim) > 44 && (
                          <span className="ag-apt-tipo">{apt.tipo}</span>
                        )}
                        {filtro === 'Todos' && heightPx(apt.inicio, apt.fim) > 56 && (
                          <span className="ag-apt-tec" style={{ color: COR[apt.tecnico] }}>
                            {apt.tecnico}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MODAL: Ver detalhes de um apt ── */}
      {selected && (
        <div className="ag-overlay" onClick={() => setSelected(null)}>
          <div className="ag-modal ag-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="ag-modal-hd">
              <span
                className="ag-modal-dot"
                style={{ background: COR[selected.tecnico] || '#1d4ed8' }}
              />
              <h2 className="ag-modal-title">{selected.tipo}</h2>
              <button className="ag-modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="ag-modal-body">
              <div className="ag-detail-row">
                <span className="ag-detail-key">Responsável</span>
                <span className="ag-detail-val">{selected.responsavel}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Técnico</span>
                <span className="ag-detail-val" style={{ color: COR[selected.tecnico] }}>{selected.tecnico}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Data</span>
                <span className="ag-detail-val">{selected.data.split('-').reverse().join('/')}</span>
              </div>
              <div className="ag-detail-row">
                <span className="ag-detail-key">Horário</span>
                <span className="ag-detail-val">{selected.inicio} – {selected.fim}</span>
              </div>
            </div>
            <div className="ag-modal-ft">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Marcar novo atendimento ── */}
      {modal && (
        <div className="ag-overlay" onClick={() => setModal(false)}>
          <div className="ag-modal" onClick={e => e.stopPropagation()}>
            <div className="ag-modal-hd">
              <h2 className="ag-modal-title">Marcar atendimento</h2>
              <button className="ag-modal-close" onClick={() => setModal(false)}>✕</button>
            </div>

            <div className="ag-modal-body">
              {/* Data + Técnico */}
              <div className="ag-form-row2">
                <div className="ag-field">
                  <label className="ag-label">Data</label>
                  <input type="date" className="ag-input" value={form.data} onChange={set('data')} />
                </div>
                <div className="ag-field">
                  <label className="ag-label">Técnico</label>
                  <select className="ag-input" value={form.tecnico} onChange={set('tecnico')}>
                    {TECNICOS.filter(t => t !== 'Todos').map(t => <option key={t}>{t}</option>)}
                  </select>
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

              {/* Tipo */}
              <div className="ag-field">
                <label className="ag-label">Tipo de atendimento</label>
                <select className="ag-input" value={form.tipo} onChange={set('tipo')}>
                  <option value="">Selecione o tipo...</option>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              {/* Responsável */}
              <div className="ag-field">
                <label className="ag-label">Responsável pela família</label>
                <select className="ag-input" value={form.responsavel} onChange={set('responsavel')}>
                  <option value="">Selecione o responsável...</option>
                  {RESPONSAVEIS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="ag-modal-ft">
              <button className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button
                className="btn-primary"
                onClick={salvar}
                disabled={!form.tipo || !form.responsavel}
                style={{ opacity: (!form.tipo || !form.responsavel) ? 0.5 : 1 }}
              >
                Marcar
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Agenda;
