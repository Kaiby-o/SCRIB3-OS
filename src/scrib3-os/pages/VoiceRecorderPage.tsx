import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';

/* ------------------------------------------------------------------ */
/*  Voice Recorder Page                                                */
/*  Record mic / computer audio / both, playback, transcription stub   */
/* ------------------------------------------------------------------ */

type RecordingMode = 'mic' | 'computer' | 'both';
type PageState = 'idle' | 'recording' | 'recorded';

interface PastRecording {
  id: string;
  title: string;
  date: string;
  duration: string;
}

const MOCK_PAST_RECORDINGS: PastRecording[] = [
  { id: '1', title: 'Weekly sync — content strategy', date: '2026-03-27', duration: '4:32' },
  { id: '2', title: 'Client call — Aave rebrand', date: '2026-03-25', duration: '12:07' },
  { id: '3', title: 'Quick note — newsletter outline', date: '2026-03-22', duration: '1:48' },
];

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const VoiceRecorderPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [mode, setMode] = useState<RecordingMode>('mic');
  const [pageState, setPageState] = useState<PageState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcriptionMsg, setTranscriptionMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamsRef = useRef<MediaStream[]>([]);

  /* Cleanup streams + timer on unmount */
  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      streamsRef.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
    };
  }, []);

  /* ---- Start recording ---- */
  const startRecording = useCallback(async () => {
    try {
      chunksRef.current = [];
      streamsRef.current = [];
      let stream: MediaStream;

      if (mode === 'mic') {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamsRef.current.push(stream);
      } else if (mode === 'computer') {
        stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false });
        streamsRef.current.push(stream);
      } else {
        /* both — merge mic + display audio */
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: false });
        streamsRef.current.push(micStream, displayStream);
        const ctx = new AudioContext();
        const dest = ctx.createMediaStreamDestination();
        ctx.createMediaStreamSource(micStream).connect(dest);
        ctx.createMediaStreamSource(displayStream).connect(dest);
        stream = dest.stream;
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        streamsRef.current.forEach((s) => s.getTracks().forEach((t) => t.stop()));
      };
      recorder.start();
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
      setPageState('recording');
    } catch (err) {
      console.error('Recording failed:', err);
      alert('Could not access audio source. Check browser permissions.');
    }
  }, [mode]);

  /* ---- Stop recording ---- */
  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = null;
    setPageState('recorded');
  }, []);

  /* ---- Reset ---- */
  const resetRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setPageState('idle');
    setElapsed(0);
    setTranscriptionMsg(null);
  }, [audioUrl]);

  /* ---- Shared styles ---- */
  const pad = isMobile ? '16px' : '40px';
  const headingSize = isMobile ? '24px' : '32px';

  const pillStyle = (active: boolean): React.CSSProperties => ({
    fontFamily: "'Owners Wide', sans-serif",
    fontSize: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '8px 20px',
    borderRadius: '75.641px',
    border: active ? '1px solid #D7ABC5' : '1px solid var(--border-default)',
    background: active ? 'rgba(215,171,197,0.15)' : 'transparent',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: `all 200ms ${easing}`,
  });

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "'Kaio', sans-serif",
    fontWeight: 800,
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 0 16px 0',
    fontFeatureSettings: "'ordn' 1, 'dlig' 1",
  };

  const cardStyle: React.CSSProperties = {
    border: '0.733px solid var(--border-default)',
    borderRadius: '10.258px',
    padding: '24px',
  };

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      {/* ---- Header ---- */}
      <header
        className="flex items-center justify-between"
        style={{
          position: 'fixed' as const,
          top: 0, left: 0, right: 0,
          zIndex: 40,
          background: 'var(--bg-primary)',
          height: '85px',
          padding: isMobile ? '0 16px' : '0 40px',
          borderBottom: '0.733px solid var(--border-default)',
        }}
      >
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
          Voice Recorder
        </span>
        <BurgerButton />
      </header>

      {/* ---- Content ---- */}
      <div style={{ paddingTop: '85px' }}>
        <div style={{ padding: pad, maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontFamily: "'Kaio', sans-serif",
            fontWeight: 800,
            fontSize: headingSize,
            textTransform: 'uppercase',
            fontFeatureSettings: "'ordn' 1, 'dlig' 1",
            margin: '0 0 32px 0',
          }}>
            Voice Recorder
          </h1>

          {/* ---- Mode Selection ---- */}
          {pageState === 'idle' && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={sectionTitleStyle}>Recording Source</h2>
              <div className="flex gap-2 flex-wrap">
                {([
                  ['mic', 'Mic Only'],
                  ['computer', 'Computer Audio'],
                  ['both', 'Both'],
                ] as [RecordingMode, string][]).map(([key, label]) => (
                  <button key={key} style={pillStyle(mode === key)} onClick={() => setMode(key)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ---- Idle — Record Button ---- */}
          {pageState === 'idle' && (
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
              <button
                onClick={startRecording}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: '#D7ABC5', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: `transform 200ms ${easing}, opacity 200ms ${easing}`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
              >
                {/* Mic icon */}
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="1" width="6" height="12" rx="3" />
                  <path d="M5 10a7 7 0 0 0 14 0" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                </svg>
              </button>
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Tap to record ({mode === 'mic' ? 'microphone' : mode === 'computer' ? 'computer audio' : 'mic + computer'})
              </span>
            </div>
          )}

          {/* ---- Recording State ---- */}
          {pageState === 'recording' && (
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginBottom: '40px' }}>
              {/* Pulse indicator */}
              <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(215,80,80,0.15)',
                  animation: 'voiceRecorderPulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#D75050',
                }} />
              </div>

              {/* Timer */}
              <span style={{
                fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '40px',
                fontFeatureSettings: "'tnum' 1",
              }}>
                {formatTime(elapsed)}
              </span>

              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Recording...
              </span>

              {/* Stop button */}
              <button
                onClick={stopRecording}
                style={{
                  fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
                  padding: '10px 32px', borderRadius: '75.641px',
                  border: '1px solid #D75050', background: 'rgba(215,80,80,0.1)',
                  color: '#D75050', cursor: 'pointer',
                  transition: `opacity 200ms ${easing}`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Stop Recording
              </button>

              {/* Keyframe injection */}
              <style>{`
                @keyframes voiceRecorderPulse {
                  0%, 100% { transform: scale(1); opacity: 0.4; }
                  50% { transform: scale(1.3); opacity: 0.1; }
                }
              `}</style>
            </div>
          )}

          {/* ---- Post-Recording: Playback ---- */}
          {pageState === 'recorded' && audioUrl && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="flex items-center justify-between">
                  <h2 style={{ ...sectionTitleStyle, margin: 0 }}>Recording</h2>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5 }}>
                    Duration: {formatTime(elapsed)}
                  </span>
                </div>

                {/* Waveform placeholder */}
                <div style={{
                  height: '48px', borderRadius: '6px',
                  background: 'var(--bg-surface, rgba(0,0,0,0.03))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '3px', overflow: 'hidden',
                }}>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} style={{
                      width: '3px',
                      height: `${10 + Math.sin(i * 0.5) * 18 + Math.random() * 10}px`,
                      borderRadius: '2px',
                      background: 'rgba(215,171,197,0.4)',
                      flexShrink: 0,
                    }} />
                  ))}
                </div>

                {/* Audio player */}
                <audio controls src={audioUrl} style={{ width: '100%' }} />

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={resetRecording}
                    style={{
                      fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
                      padding: '10px 24px', borderRadius: '75.641px',
                      border: '1px solid var(--border-default)', background: 'transparent',
                      color: 'var(--text-primary)', cursor: 'pointer',
                      transition: `opacity 200ms ${easing}`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.6')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    New Recording
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---- Transcription Section ---- */}
          {pageState === 'recorded' && (
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <h2 style={sectionTitleStyle}>Transcription</h2>
              {transcriptionMsg ? (
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, margin: 0 }}>
                  {transcriptionMsg}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, margin: 0 }}>
                    Convert your recording to text using Whisper / Groq transcription.
                  </p>
                  <button
                    onClick={() => setTranscriptionMsg('Transcription API key required — configure in Settings to enable.')}
                    style={{
                      fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
                      padding: '10px 24px', borderRadius: '75.641px',
                      border: '1px solid #D7ABC5', background: 'rgba(215,171,197,0.1)',
                      color: 'var(--text-primary)', cursor: 'pointer',
                      transition: `opacity 200ms ${easing}`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Transcribe
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ---- Summary Section ---- */}
          {pageState === 'recorded' && (
            <div style={{ ...cardStyle, marginBottom: '40px' }}>
              <h2 style={sectionTitleStyle}>AI Summary + Actionables</h2>
              <div style={{
                padding: '20px', borderRadius: '6px',
                background: 'var(--bg-surface, rgba(0,0,0,0.03))',
                display: 'flex', flexDirection: 'column', gap: '12px',
              }}>
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.4, margin: 0, fontStyle: 'italic' }}>
                  Summary will appear here once transcription is complete.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {['Key points extracted from recording', 'Action items assigned to team members', 'Follow-up reminders pushed to Notion'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(215,171,197,0.3)', flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.3 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---- Past Recordings ---- */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={sectionTitleStyle}>Past Recordings</h2>
            <div className="flex flex-col gap-3">
              {MOCK_PAST_RECORDINGS.map((rec) => (
                <div key={rec.id} style={{ ...cardStyle, padding: '16px 24px' }} className="flex items-center justify-between">
                  <div className="flex flex-col" style={{ gap: '4px' }}>
                    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>
                      {rec.title}
                    </span>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>
                      {rec.date}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px',
                    padding: '4px 12px', borderRadius: '75.641px',
                    background: 'rgba(215,171,197,0.08)', border: '1px solid rgba(215,171,197,0.2)',
                  }}>
                    {rec.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorderPage;
