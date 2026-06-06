import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import Layout from '../../Layout';
import './NovoAtendimento.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';


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
  const [recState, setRecState]       = useState('idle');
  const [audioUrl, setAudioUrl]       = useState(null);
  const [audioBlob, setAudioBlob]     = useState(null);
  const [aiText, setAiText]           = useState('');
  const [resumoText, setResumoText]   = useState('');
  const [resumoLoading, setResumoLoading] = useState(false);
  const [resumoError, setResumoError] = useState('');
  const [recTime, setRecTime]         = useState(0);
  const [transcError, setTranscError] = useState('');

  const mediaRef     = useRef(null);
  const chunksRef    = useRef([]);
  const timerRef     = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

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
    clearInterval(timerRef.current);
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
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
    timerRef.current = null;
    mediaRef.current?.stop();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setAiText('');
    setResumoText('');
    setResumoError('');
    setTranscError('');
    setRecState('recorded');
    e.target.value = '';
  };

  const handleRecord = () => {
    if (recState === 'recording') {
      stopRecording();
    } else {
      setAudioUrl(null);
      setAudioBlob(null);
      setAiText('');
      setResumoText('');
      setResumoError('');
      setTranscError('');
      startRecording();
    }
  };

  const sendToAI = async () => {
    if (!audioBlob) return;
    setRecState('processing');
    setTranscError('');
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'gravacao.webm');
      const res = await fetch(`${API_URL}/api/transcricao`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const texto = await res.text();
      setAiText(texto);
      setRecState('done');
    } catch (e) {
      setTranscError('Falha na transcrição: ' + e.message);
      setRecState('recorded');
    }
  };

  const sendResumo = async () => {
    setResumoLoading(true);
    setResumoError('');
    try {
      const res = await fetch(`${API_URL}/resumo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(aiText),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const dto = await res.json();
      const texto = dto.response || dto.resumo || dto.texto || dto.conteudo || dto.summary || JSON.stringify(dto);
      setResumoText(texto);
    } catch (e) {
      setResumoError('Falha ao gerar resumo: ' + e.message);
    } finally {
      setResumoLoading(false);
    }
  };

  const useAiText = () =>
    setForm((f) => ({ ...f, observacoes: resumoText || aiText }));

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
            Assistente de áudio
          </h2>

          {/* etapas */}
          <div className="na-steps">
            {[
              { n: 1, label: 'Gravar',      done: recState !== 'idle' },
              { n: 2, label: 'Transcrever', done: recState === 'done' },
              { n: 3, label: 'Relatório',   done: !!resumoText },
            ].map((s, i, arr) => (
              <div key={s.n} className="na-step-item">
                <div className={`na-step-dot${s.done ? ' na-step-dot--done' : ''}`}>
                  {s.done
                    ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    : s.n}
                </div>
                <span className={`na-step-label${s.done ? ' na-step-label--done' : ''}`}>{s.label}</span>
                {i < arr.length - 1 && <div className={`na-step-line${s.done ? ' na-step-line--done' : ''}`} />}
              </div>
            ))}
          </div>

          <div className="na-rec-area">
            <button
              className={`na-rec-btn${recState === 'recording' ? ' na-rec-btn--on' : ''}`}
              onClick={handleRecord}
              disabled={recState === 'processing'}
              aria-label={recState === 'recording' ? 'Parar gravação' : 'Iniciar gravação'}
            >
              {recState === 'recording' ? (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="5" y="5" width="14" height="14" rx="3"/>
                </svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <p className="na-rec-hint-idle">Clique no microfone para iniciar</p>
            )}

            {recState !== 'recording' && (
              <div className="na-import-row">
                <span className="na-import-sep">ou</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  style={{ display: 'none' }}
                  onChange={handleImport}
                />
                <button
                  className="na-import-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={recState === 'processing'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Importar áudio
                </button>
              </div>
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
                  Áudio gravado
                </span>
                <button className="na-regravar" onClick={handleRecord}>
                  ↺ Regravar
                </button>
              </div>

              <audio controls src={audioUrl} className="na-player" />

              {transcError && (
                <p className="na-error-msg">{transcError}</p>
              )}

              {recState === 'recorded' && (
                <button className="na-ai-btn" onClick={sendToAI}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                  Transcrever
                </button>
              )}

              {recState === 'processing' && (
                <div className="na-ai-loading">
                  <div className="na-spinner" />
                  <span>Transcrevendo áudio…</span>
                </div>
              )}

              {recState === 'done' && aiText && (
                <>
                  <div className="na-transc-block">
                    <p className="na-transc-label">Transcrição</p>
                    <p className="na-ai-text">{aiText}</p>
                  </div>

                  {!resumoText && !resumoLoading && (
                    <>
                      {resumoError && <p className="na-error-msg">{resumoError}</p>}
                      <button className="na-ai-btn na-ai-btn--green" onClick={sendResumo}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="1"/>
                          <line x1="9" y1="12" x2="15" y2="12"/>
                          <line x1="9" y1="16" x2="13" y2="16"/>
                        </svg>
                        Gerar o relatório com IA
                      </button>
                    </>
                  )}

                  {resumoLoading && (
                    <div className="na-ai-loading na-ai-loading--green">
                      <div className="na-spinner na-spinner--green" />
                      <span>Gerando relatório…</span>
                    </div>
                  )}

                  {resumoText && (
                    <div className="na-resumo-block">
                      <p className="na-resumo-label">Relatório gerado pela IA</p>
                      <p className="na-ai-text">{resumoText}</p>
                      <button className="na-use-btn" onClick={useAiText}>
                        ✓ Usar no relatório
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NovoAtendimento;
