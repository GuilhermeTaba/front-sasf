import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import Layout from '../../Layout';
import './NovoAtendimento.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AI_SIMULATION =
  'Com base no áudio registrado, o atendimento indica situação de vulnerabilidade ' +
  'socioeconômica. Recomenda-se encaminhamento ao CRAS para inclusão no Programa ' +
  'Bolsa Família e verificação de acesso ao benefício de habitação. A família demonstra ' +
  'interesse em participação nos grupos de fortalecimento de vínculos comunitários.';

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const TIPOS_ATENDIMENTO = [
  'VisitaDomiciliar',
  'AtendimentoNaSede',
];

const TIPOS_LABEL = {
  VisitaDomiciliar:  'Visita Domiciliar',
  AtendimentoNaSede: 'Atendimento na Sede',
};

const emptyForm = () => ({
  tipo: '',
  tecnicoId: '',
  data: new Date().toISOString().split('T')[0],
  local: '',
  observacoes: '',
});

const NovoAtendimento = () => {
  const navigate = useNavigate();
  const { familiaId, atendimentoId } = useParams();

  const [familia, setFamilia]     = useState(null);
  const [familias, setFamilias]   = useState([]);
  const [tecnicos, setTecnicos]   = useState([]);
  const [form, setForm]           = useState(emptyForm());
  const [selectedFamiliaId, setSelectedFamiliaId] = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState('');

  /* ── gravação ── */
  const [recState, setRecState] = useState('idle');
  const [audioUrl, setAudioUrl] = useState(null);
  const [aiText, setAiText]     = useState('');
  const [recTime, setRecTime]   = useState(0);

  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const timerRef  = useRef(null);

  useEffect(() => {
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };

    fetch(`${API_URL}/tecnicos`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTecnicos(Array.isArray(data) ? data : []))
      .catch(() => {});

    if (!familiaId) {
      fetch(`${API_URL}/familias`, { headers })
        .then(r => r.ok ? r.json() : [])
        .then(data => setFamilias(Array.isArray(data) ? data : (data?.content ?? [])))
        .catch(() => {});
      return;
    }

    fetch(`${API_URL}/familias/${familiaId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setFamilia({
          id: data.id,
          responsavel: data.nomeRepresentante || data.nomeRepresentanteFamilia || '',
        });
      })
      .catch(() => {});

    if (!atendimentoId) {
      setForm(emptyForm());
      return;
    }

    // Modo edição: busca atendimento específico
    fetch(`${API_URL}/familias/${familiaId}/audio-atendimento/${atendimentoId}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setForm({
          tipo:        data.tipoAtendimento || '',
          tecnicoId:   data.tecnicoId ? String(data.tecnicoId) : '',
          data:        data.data ? data.data.split('T')[0] : '',
          local:       data.local || '',
          observacoes: data.relatorio || '',
        });
      })
      .catch(() => {});
  }, [familiaId, atendimentoId]);

  const startRecording = async () => {
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setRecState('recorded');
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecState('recording');
      setRecTime(0);
      timerRef.current = setInterval(() => setRecTime((t) => t + 1), 1000);
    } catch {
      alert('Permita o acesso ao microfone para gravar.');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    mediaRef.current?.stop();
  };

  const handleRecord = () => {
    if (recState === 'recording') {
      stopRecording();
    } else {
      setAudioUrl(null);
      setAiText('');
      startRecording();
    }
  };

  const sendToAI = () => {
    setRecState('processing');
    setTimeout(() => {
      setAiText(AI_SIMULATION);
      setRecState('done');
    }, 2400);
  };

  const useAiText = () =>
    setForm((f) => ({ ...f, observacoes: aiText }));

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    console.log('[NovoAtendimento] handleSave chamado');
    const fid = familiaId || selectedFamiliaId;
    console.log('[NovoAtendimento] familiaId URL:', familiaId, '| selectedFamiliaId:', selectedFamiliaId, '| fid usado:', fid);
    console.log('[NovoAtendimento] form:', form);

    setSaving(true);
    setSaveError('');
    try {
      let endpoint, method;
      if (!fid) {
        console.warn('[NovoAtendimento] nenhuma família selecionada — abortando');
        setSaveError('Selecione uma família antes de salvar.');
        setSaving(false);
        return;
      }
      if (atendimentoId) {
        endpoint = `${API_URL}/familias/${fid}/audio-atendimento/${atendimentoId}`;
        method = 'PUT';
      } else {
        endpoint = `${API_URL}/familias/${fid}/audio-atendimento`;
        method = 'POST';
      }

      const payload = {
        tipoAtendimento: form.tipo || null,
        local:           form.local,
        data:            form.data ? `${form.data}T00:00:00` : null,
        relatorio:       form.observacoes,
        tecnicoId:       form.tecnicoId ? Number(form.tecnicoId) : null,
      };

      console.log('[NovoAtendimento]', method, endpoint);
      console.log('[NovoAtendimento] payload:', JSON.stringify(payload, null, 2));

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('[NovoAtendimento] response status:', res.status);
      if (!res.ok) {
        let msg = `Erro ${res.status}`;
        try {
          const body = await res.json();
          console.error('[NovoAtendimento] erro backend:', JSON.stringify(body, null, 2));
          msg = body.message || body.error || body.detalhe || body.errors?.[0]?.defaultMessage || JSON.stringify(body);
        } catch { /* body não é JSON */ }
        throw new Error(msg);
      }
      navigate(fid ? `/detalhes-familia/${fid}` : '/atendimentos', { state: { tab: 'atendimentos' } });
    } catch (e) {
      console.error('[NovoAtendimento] catch:', e.message);
      setSaveError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const backPath = familiaId ? `/detalhes-familia/${familiaId}` : '/atendimentos';

  return (
    <Layout>
      {/* ── BREADCRUMB ── */}
      <div className="breadcrumb">
        <Link to="/familias" className="bc-link">Famílias</Link>
        {familia && (
          <>
            <span className="bc-sep">›</span>
            <Link to={`/detalhes-familia/${familiaId}`} className="bc-link">{familia.responsavel}</Link>
          </>
        )}
        <span className="bc-sep">›</span>
        <span className="bc-current">{atendimentoId ? 'Editar Atendimento' : 'Novo Atendimento'}</span>
      </div>

      {/* ── HEADER ── */}
      <div className="page-header">
        <div>
          <p className="page-section">Atendimentos</p>
          <h1 className="page-title">{atendimentoId ? 'Editar Atendimento' : 'Novo Atendimento'}</h1>
          <p className="page-sub">Preencha os dados e registre o atendimento</p>
        </div>
        <div className="na-header-actions">
          <button className="btn-secondary" onClick={() => navigate(backPath)}>
            ← Voltar
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : atendimentoId ? 'Salvar alterações' : 'Salvar atendimento'}
          </button>
        </div>
      </div>

      {saveError && <p style={{ color: '#dc2626', marginBottom: 12 }}>{saveError}</p>}

      {/* ── GRID 2 colunas ── */}
      <div className="na-grid">

        {/* ── COLUNA ESQUERDA: formulário ── */}
        <div className="na-card">
          <h2 className="na-card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            Dados do atendimento
          </h2>

          <div className="na-field">
            <label className="na-label">Tipo de atendimento</label>
            <select className="na-select" value={form.tipo} onChange={set('tipo')}>
              <option value="">Selecione o tipo...</option>
              {TIPOS_ATENDIMENTO.map(t => (
                <option key={t} value={t}>{TIPOS_LABEL[t]}</option>
              ))}
            </select>
          </div>

          <div className="na-row2">
            <div className="na-field">
              <label className="na-label">Técnico responsável</label>
              <select className="na-select" value={form.tecnicoId} onChange={set('tecnicoId')}>
                <option value="">Selecione um técnico...</option>
                {tecnicos.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
            <div className="na-field">
              <label className="na-label">Data do atendimento</label>
              <input
                type="date"
                className="na-input"
                value={form.data}
                onChange={set('data')}
              />
            </div>
          </div>

          <div className="na-field">
            <label className="na-label">Local</label>
            <input
              className="na-input"
              value={form.local}
              onChange={set('local')}
              placeholder="Ex: Residência, CRAS, SASF, UBS..."
            />
          </div>

          <div className="na-field">
            <label className="na-label">Observações / Relatório</label>
            <textarea
              className="na-textarea"
              rows={6}
              placeholder="Descreva o atendimento realizado..."
              value={form.observacoes}
              onChange={set('observacoes')}
            />
          </div>
        </div>

        {/* ── COLUNA DIREITA: gravação de voz ── */}
        <div className="na-card na-voice-card">
          <h2 className="na-card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
              <path d="M19 10v2a7 7 0 01-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Registro em áudio
          </h2>
          <p className="na-voice-sub">
            Grave um relato verbal do atendimento — a IA irá transcrever e sugerir o relatório.
          </p>

          <div className="na-rec-area">
            <button
              className={`na-rec-btn${recState === 'recording' ? ' na-rec-btn--on' : ''}`}
              onClick={handleRecord}
              aria-label={recState === 'recording' ? 'Parar gravação' : 'Iniciar gravação'}
            >
              {recState === 'recording' ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="5" width="14" height="14" rx="3"/>
                </svg>
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                  <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              )}
            </button>

            {recState === 'recording' && (
              <div className="na-rec-status">
                <span className="na-rec-dot" />
                <span className="na-rec-time">{fmt(recTime)}</span>
                <span className="na-rec-hint">Gravando… clique para parar</span>
              </div>
            )}

            {recState === 'idle' && (
              <p className="na-rec-hint-idle">Clique no microfone para iniciar a gravação</p>
            )}
          </div>

          {audioUrl && recState !== 'idle' && recState !== 'recording' && (
            <div className="na-audio-section">
              <div className="na-audio-header">
                <span className="na-audio-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                  </svg>
                  Áudio salvo
                </span>
                <button className="na-regravar" onClick={handleRecord}>
                  ↺ Regravar
                </button>
              </div>

              <audio controls src={audioUrl} className="na-player" />

              {recState === 'recorded' && (
                <button className="na-ai-btn" onClick={sendToAI}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  Enviar para IA
                </button>
              )}

              {recState === 'processing' && (
                <div className="na-ai-loading">
                  <div className="na-spinner" />
                  <span>Analisando áudio com IA…</span>
                </div>
              )}

              {recState === 'done' && aiText && (
                <div className="na-ai-result">
                  <div className="na-ai-result-title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                    Análise gerada pela IA
                  </div>
                  <p className="na-ai-text">{aiText}</p>
                  <button className="na-use-btn" onClick={useAiText}>
                    ✓ Usar no relatório
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NovoAtendimento;
