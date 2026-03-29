import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';

/* ------------------------------------------------------------------ */
/*  VoxPilot / Vibe Checker — AI Content Analysis Tool                 */
/*  Brand team: paste content, select client + analysis type, review   */
/* ------------------------------------------------------------------ */

const CLIENTS = ['Cardano', 'Franklin Templeton', 'Rootstock', 'Lisk', 'Canton Network', 'World Mobile'];

const ANALYSIS_TYPES = ['Spelling', 'Tone of Voice', 'Brand Guidelines', 'Full Check'] as const;
type AnalysisType = typeof ANALYSIS_TYPES[number];

interface Issue {
  type: 'spelling' | 'tone' | 'cta';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

const mockIssues: Issue[] = [
  { type: 'spelling', severity: 'low', description: 'Line 3: "decentralised" — client style guide uses US English ("decentralized").', suggestion: 'Switch to US spelling per client brand guidelines.' },
  { type: 'tone', severity: 'medium', description: 'Paragraph 2 reads overly casual for this client\'s enterprise audience.', suggestion: 'Elevate register — replace "super exciting" with "significant" or "compelling".' },
  { type: 'cta', severity: 'high', description: 'No call-to-action detected. All client-facing content requires a CTA per brand playbook.', suggestion: 'Add a closing CTA directing to the relevant landing page or resource.' },
];

interface KBEntry {
  title: string;
  client: string;
  score: number;
  date: string;
  type: string;
}

const mockKB: KBEntry[] = [
  { title: 'Cardano Summit 2025 Recap Thread', client: 'Cardano', score: 9.4, date: '2025-11-20', type: 'Twitter Thread' },
  { title: 'Franklin Templeton DeFi Explainer', client: 'Franklin Templeton', score: 9.1, date: '2026-01-15', type: 'Blog Post' },
  { title: 'Rootstock Brand Refresh Announcement', client: 'Rootstock', score: 8.8, date: '2026-02-28', type: 'Twitter Thread' },
  { title: 'Canton Network Technical Deep Dive', client: 'Canton Network', score: 8.7, date: '2026-01-05', type: 'Long-form Article' },
  { title: 'Lisk Sidechain Launch Thread', client: 'Lisk', score: 8.5, date: '2026-03-10', type: 'Twitter Thread' },
  { title: 'World Mobile Kenya Expansion Post', client: 'World Mobile', score: 8.3, date: '2026-02-14', type: 'Blog Post' },
];

const severityColor: Record<Issue['severity'], string> = {
  low: '#6E93C3',
  medium: '#E67E22',
  high: '#E74C3C',
};

const VoxPilotPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [content, setContent] = useState('');
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0]);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('Full Check');
  const [showResults, setShowResults] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [toast, setToast] = useState('');
  const [kbFilter, setKbFilter] = useState('all');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleAnalyze = () => {
    if (!content.trim()) return;
    setAnalyzing(true);
    setShowResults(false);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResults(true);
    }, 1200);
  };

  const filteredKB = kbFilter === 'all' ? mockKB : mockKB.filter((e) => e.client === kbFilter);
  const score = 8.2;

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="flex items-center justify-between" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>VoxPilot</span>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Dashboard
        </button>
        <BurgerButton />
      </header>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, padding: '12px 28px', borderRadius: '75.641px', background: '#000', color: '#EAF2D7', fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {toast}
        </div>
      )}

      {/* Content */}
      <div style={{ paddingTop: '105px', padding: isMobile ? '105px 16px 40px' : '105px 40px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: isMobile ? '24px' : '32px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 8px 0' }}>VoxPilot</h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.5, marginBottom: '32px' }}>
          AI content analysis — check spelling, tone, and brand alignment before publishing
        </p>

        {/* Input Section */}
        <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px', marginBottom: '24px' }}>
          {/* Client selector + Analysis type */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                style={{
                  fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', padding: '8px 16px', borderRadius: '75.641px',
                  border: '0.733px solid var(--border-default)', background: 'var(--bg-primary)', color: 'var(--text-primary)',
                  cursor: 'pointer', minWidth: '180px',
                }}
              >
                {CLIENTS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Analysis Type</label>
              <div className="flex gap-2 flex-wrap">
                {ANALYSIS_TYPES.map((t) => (
                  <button key={t} onClick={() => setAnalysisType(t)} style={{
                    fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
                    padding: '6px 16px', borderRadius: '75.641px',
                    border: analysisType === t ? '1px solid var(--text-primary)' : '1px solid var(--border-default)',
                    background: analysisType === t ? 'var(--text-primary)' : 'transparent',
                    color: analysisType === t ? 'var(--bg-primary)' : 'var(--text-primary)',
                    cursor: 'pointer', transition: 'all 0.2s', opacity: analysisType === t ? 1 : 0.6,
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste tweet, article, or content here..."
            rows={8}
            style={{
              width: '100%', fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', lineHeight: 1.7,
              padding: '16px', borderRadius: '10.258px', border: '0.733px solid var(--border-default)',
              background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />

          {/* Analyze button */}
          <div className="flex items-center gap-3" style={{ marginTop: '16px' }}>
            <button onClick={handleAnalyze} disabled={!content.trim() || analyzing} style={{
              fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase',
              padding: '12px 32px', borderRadius: '75.641px', border: 'none',
              background: content.trim() ? '#D7ABC5' : 'var(--border-default)',
              color: '#000', cursor: content.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', opacity: analyzing ? 0.6 : 1,
            }}>
              {analyzing ? 'Analyzing...' : 'Analyze'}
            </button>
            {content.trim() && (
              <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>
                {content.trim().split(/\s+/).length} words &middot; {selectedClient} &middot; {analysisType}
              </span>
            )}
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div style={{ marginBottom: '32px' }}>
            {/* Score */}
            <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px', marginBottom: '16px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', margin: 0 }}>Score</h2>
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '28px', color: '#D7ABC5' }}>{score}/10</span>
              </div>
              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'var(--border-default)', overflow: 'hidden' }}>
                <div style={{ width: `${score * 10}%`, height: '100%', borderRadius: '4px', background: '#D7ABC5', transition: 'width 0.6s cubic-bezier(0.22, 0.61, 0.36, 1)' }} />
              </div>
              <div className="flex items-center justify-between" style={{ marginTop: '8px' }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>Ranked #3 out of 47 past pieces for {selectedClient}</span>
                <button onClick={() => showToast('Added to content calendar')} style={{
                  fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
                  padding: '6px 16px', borderRadius: '75.641px', border: '0.733px solid var(--border-default)',
                  background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', opacity: 0.6, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}>
                  Add to Calendar
                </button>
              </div>
            </div>

            {/* Issues Found */}
            <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px' }}>
              <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 16px 0' }}>Issues Found ({mockIssues.length})</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mockIssues.map((issue, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: '8px', border: `0.733px solid ${severityColor[issue.severity]}30`, background: `${severityColor[issue.severity]}08` }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                      <span style={{
                        fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase',
                        padding: '2px 10px', borderRadius: '75.641px',
                        background: `${severityColor[issue.severity]}20`,
                        border: `1px solid ${severityColor[issue.severity]}40`,
                        color: severityColor[issue.severity],
                      }}>
                        {issue.severity}
                      </span>
                      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4 }}>
                        {issue.type === 'spelling' ? 'Spelling' : issue.type === 'tone' ? 'Tone of Voice' : 'Missing CTA'}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: '0 0 8px 0' }}>{issue.description}</p>
                    <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5, margin: 0, opacity: 0.6, fontStyle: 'italic' }}>{issue.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Section */}
        <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px' }}>
          <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase', margin: '0 0 8px 0' }}>Knowledge Base</h2>
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, margin: '0 0 16px 0' }}>
            High-performing content stored per client for reference and benchmarking.
          </p>

          {/* Client filter */}
          <div className="flex gap-2 flex-wrap" style={{ marginBottom: '20px' }}>
            <KBPill label="All" active={kbFilter === 'all'} onClick={() => setKbFilter('all')} />
            {CLIENTS.map((c) => (
              <KBPill key={c} label={c} active={kbFilter === c} onClick={() => setKbFilter(c)} />
            ))}
          </div>

          {/* KB cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {filteredKB.map((entry, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: '8px', border: '0.733px solid var(--border-default)', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4 }}>{entry.client}</span>
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', color: '#D7ABC5' }}>{entry.score}</span>
                </div>
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', margin: '0 0 6px 0' }}>{entry.title}</p>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>{entry.type} &middot; {entry.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KBPill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
    padding: '6px 16px', borderRadius: '75.641px',
    border: active ? '1px solid var(--text-primary)' : '1px solid var(--border-default)',
    background: active ? 'var(--text-primary)' : 'transparent',
    color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
    cursor: 'pointer', transition: 'all 0.2s', opacity: active ? 1 : 0.6,
  }}>{label}</button>
);

export default VoxPilotPage;
