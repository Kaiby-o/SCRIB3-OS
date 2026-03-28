import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { mockTeam } from '../lib/team';
import {
  fetchIssues, fetchIssueDetail, fetchWorkflowStates, fetchLinearUsers, fetchTeamId, createIssue,
  updateIssueState, updateIssueAssignee, updateIssuePriority, updateIssueDueDate, addComment,
  type LinearIssue, type LinearState, type LinearLabel, type LinearUser,
  PRIORITY_LABELS,
} from '../lib/linear';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';


// Map Linear user → Supabase avatar (prefer name match, then email)
function getSupabaseAvatar(name?: string, email?: string): string | null {
  if (name) {
    const byName = mockTeam.find((m) => m.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().startsWith(m.name.toLowerCase()));
    if (byName?.avatarUrl) return byName.avatarUrl;
  }
  if (email) {
    const byEmail = mockTeam.find((m) => m.email === email);
    if (byEmail?.avatarUrl) return byEmail.avatarUrl;
  }
  return null;
}

// Render Linear markdown description with clickable links
function renderDescription(text: string): React.ReactNode[] {
  // Match markdown links [text](url) and bare URLs
  const parts: React.ReactNode[] = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s)<>]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] && match[2]) {
      // Markdown link
      parts.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: '#6E93C3', textDecoration: 'underline', wordBreak: 'break-all' }}>{match[1]}</a>
      );
    } else if (match[3]) {
      // Bare URL
      parts.push(
        <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer"
          style={{ color: '#6E93C3', textDecoration: 'underline', wordBreak: 'break-all' }}>{match[3]}</a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/* Priority dot */
const PriorityDot: React.FC<{ priority: number; size?: number }> = ({ priority, size = 8 }) => {
  const p = PRIORITY_LABELS[priority] ?? PRIORITY_LABELS[0];
  return <div style={{ width: size, height: size, borderRadius: '50%', background: p.color, flexShrink: 0 }} title={p.label} />;
};

/* Mini avatar */
const Avatar: React.FC<{ name: string; email?: string; url?: string | null; size?: number; style?: React.CSSProperties }> = ({ name, email, url, size = 22, style: s }) => {
  // Always prefer Supabase avatar over Linear avatar
  const supabaseAvatar = getSupabaseAvatar(name, email);
  const avatarUrl = supabaseAvatar || url || null;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...s }}>
      {avatarUrl ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
        <span style={{ color: '#EAF2D7', fontSize: size * 0.35, fontFamily: "'Kaio', sans-serif", fontWeight: 900 }}>{name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
    </div>
  );
};

/* Label badge */
const LabelBadge: React.FC<{ label: LinearLabel }> = ({ label }) => (
  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 9, letterSpacing: '0.5px', padding: '2px 8px', borderRadius: '75.641px', whiteSpace: 'nowrap', background: `${label.color}20`, border: `1px solid ${label.color}40`, color: label.color }}>{label.name}</span>
);

/* Styled select */
const StyledSelect: React.FC<{ value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }> = ({ value, onChange, options }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 12, background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '8px 12px', color: '#000', outline: 'none', cursor: 'pointer', appearance: 'none', width: '100%' }}>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

/* ------------------------------------------------------------------ */
/*  Tasks Page                                                         */
/* ------------------------------------------------------------------ */

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<LinearIssue[]>([]);
  const [states, setStates] = useState<LinearState[]>([]);
  const [linearUsers, setLinearUsers] = useState<LinearUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<LinearIssue | null>(null);
  const [collapsedStates, setCollapsedStates] = useState<Set<string>>(new Set());
  const [showNewIssue, setShowNewIssue] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState(3);
  const [newAssignee, setNewAssignee] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [i, s, u] = await Promise.all([fetchIssues(200), fetchWorkflowStates(), fetchLinearUsers()]);
      setIssues(i); setStates(s); setLinearUsers(u); setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  // Auto-refresh every 30s, but only when tab is visible
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') loadData(); }, 30000);
    return () => clearInterval(t);
  }, [loadData]);

  const openIssue = async (issue: LinearIssue) => {
    setSelectedIssue(issue);
    try { setSelectedIssue(await fetchIssueDetail(issue.id)); } catch { /* keep partial */ }
  };

  const toggleState = (id: string) => setCollapsedStates((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Deduplicate states by name
  const uniqueStates = useMemo(() => {
    const seen = new Set<string>();
    return states.filter((s) => { if (seen.has(s.name)) return false; seen.add(s.name); return true; });
  }, [states]);

  // Group top-level issues
  const childIds = new Set(issues.flatMap((i) => i.children?.nodes?.map((c) => c.id) ?? []));
  const topLevel = issues.filter((i) => !childIds.has(i.id));
  const grouped = uniqueStates.map((s) => ({ state: s, issues: topLevel.filter((i) => i.state.name === s.name) })).filter((g) => g.issues.length > 0);

  return (
    <div className="os-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><LogoScrib3 height={18} color="var(--text-primary)" /></button>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Tasks</span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.3 }}>{issues.length} issues · Live</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowNewIssue(true)} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 18px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer' }}>+ New Issue</button>
      <BurgerButton />
        </div>
      </header>

      {/* New issue modal */}
      {showNewIssue && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowNewIssue(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '32px', width: '480px', maxWidth: '90vw' }}>
            <h3 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '18px', textTransform: 'uppercase', margin: '0 0 20px 0' }}>New Issue</h3>
            <div className="flex flex-col gap-3">
              <div>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Title</span>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Issue title..."
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '10px 16px', outline: 'none' }} />
              </div>
              <div>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Description</span>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe the issue..." rows={3}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', width: '100%', background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '10px 16px', outline: 'none', resize: 'vertical' }} />
              </div>
              <div className="flex gap-3">
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Priority</span>
                  <StyledSelect value={String(newPriority)} onChange={(v) => setNewPriority(Number(v))}
                    options={[0,1,2,3,4].map((p) => ({ value: String(p), label: PRIORITY_LABELS[p]?.label ?? 'None' }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Assignee</span>
                  <StyledSelect value={newAssignee} onChange={setNewAssignee}
                    options={[{ value: '', label: 'Unassigned' }, ...linearUsers.map((u) => ({ value: u.id, label: u.name }))]} />
                </div>
              </div>
              <div className="flex gap-2" style={{ marginTop: '8px' }}>
                <button disabled={!newTitle.trim() || creating} onClick={async () => {
                  setCreating(true);
                  try {
                    const teamId = await fetchTeamId();
                    await createIssue({ title: newTitle.trim(), description: newDesc.trim() || undefined, priority: newPriority, assigneeId: newAssignee || undefined, teamId });
                    setShowNewIssue(false); setNewTitle(''); setNewDesc(''); setNewPriority(3); setNewAssignee('');
                    loadData();
                  } catch { /* ignore */ }
                  setCreating(false);
                }}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: 'none', background: newTitle.trim() ? '#000' : 'rgba(0,0,0,0.1)', color: '#EAF2D7', cursor: newTitle.trim() ? 'pointer' : 'default' }}>
                  {creating ? 'Creating...' : 'Create Issue'}
                </button>
                <button onClick={() => setShowNewIssue(false)}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 24px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center" style={{ marginTop: '86px', flex: 1 }}><span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 14, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px' }}>Loading from Linear...</span></div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 14, color: '#E74C3C' }}>{error}</span>
          <button onClick={loadData} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 12, padding: '8px 20px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>Retry</button>
        </div>
      ) : (
        <div className="flex" style={{ overflow: 'hidden', height: 'calc(100vh - 86px)', marginTop: '86px' }}>
          {/* Left panel — independent scroll */}
          <div style={{ flex: selectedIssue ? '0 0 55%' : '1', overflow: 'auto', padding: '24px' }}>
            {grouped.map(({ state, issues: si }) => {
              const collapsed = collapsedStates.has(state.id);
              return (
                <div key={state.id} style={{ marginBottom: 24 }}>
                  <button onClick={() => toggleState(state.id)} className="flex items-center gap-2" style={{ marginBottom: collapsed ? 0 : 8, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', width: '100%', textAlign: 'left' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="var(--text-primary)" style={{ transform: collapsed ? 'rotate(-90deg)' : '', transition: `transform 150ms ${easing}`, opacity: 0.3 }}><polygon points="0,0 10,5 0,10" /></svg>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: state.color }} />
                    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: 13, textTransform: 'uppercase' }}>{state.name}</span>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 11, opacity: 0.4 }}>{si.length}</span>
                  </button>
                  {!collapsed && si.map((issue) => (
                    <IssueRowNested key={issue.id} issue={issue} allIssues={issues} selected={selectedIssue?.id === issue.id} onClick={() => openIssue(issue)} onChildClick={openIssue} />
                  ))}
                </div>
              );
            })}
          </div>

          {/* Right panel — independent scroll */}
          {selectedIssue && (
            <DetailPanel issue={selectedIssue} states={uniqueStates} users={linearUsers}
              onClose={() => setSelectedIssue(null)}
              onStateChange={async (sid) => {
                const newState = states.find((s) => s.id === sid);
                if (newState) {
                  const updated = { ...selectedIssue, state: newState };
                  setSelectedIssue(updated);
                  setIssues((prev) => prev.map((i) => i.id === selectedIssue.id ? updated : i));
                }
                await updateIssueState(selectedIssue.id, sid);
                loadData();
              }}
              onAssigneeChange={async (uid) => {
                const newAssignee = uid ? linearUsers.find((u) => u.id === uid) ?? null : null;
                const updated = { ...selectedIssue, assignee: newAssignee };
                setSelectedIssue(updated);
                setIssues((prev) => prev.map((i) => i.id === selectedIssue.id ? updated : i));
                await updateIssueAssignee(selectedIssue.id, uid);
                loadData();
              }}
              onPriorityChange={async (p) => {
                const updated = { ...selectedIssue, priority: p };
                setSelectedIssue(updated);
                setIssues((prev) => prev.map((i) => i.id === selectedIssue.id ? updated : i));
                await updateIssuePriority(selectedIssue.id, p);
                loadData();
              }}
              onDueDateChange={async (d) => {
                const updated = { ...selectedIssue, dueDate: d };
                setSelectedIssue(updated);
                setIssues((prev) => prev.map((i) => i.id === selectedIssue.id ? updated : i));
                await updateIssueDueDate(selectedIssue.id, d);
                loadData();
              }}
              onSubIssueClick={(child) => openIssue(child)}
              onComment={async (body) => { await addComment(selectedIssue.id, body); setSelectedIssue(await fetchIssueDetail(selectedIssue.id)); }} />
          )}
        </div>
      )}
    </div>
  );
};

/* Issue row with nested children */
const IssueRowNested: React.FC<{ issue: LinearIssue; allIssues: LinearIssue[]; selected: boolean; onClick: () => void; onChildClick: (i: LinearIssue) => void }> = ({ issue, allIssues, selected, onClick, onChildClick }) => {
  const [open, setOpen] = useState(false);
  const kids = issue.children?.nodes ?? [];
  
  const sc = kids.length; const sd = kids.filter((c) => c.state.type === 'completed').length;

  return (
    <>
      <div className="flex items-center">
        {sc > 0 ? (
          <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginRight: 2, flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="var(--text-primary)" style={{ transform: open ? 'rotate(90deg)' : '', transition: `transform 150ms ${easing}`, opacity: 0.3 }}><polygon points="0,0 8,4 0,8" /></svg>
          </button>
        ) : <div style={{ width: 16 }} />}
        <div onClick={onClick} className="flex items-center" style={{ padding: '8px 12px', flex: 1, borderRadius: 6, cursor: 'pointer', background: selected ? 'var(--bg-surface)' : 'transparent', border: selected ? '0.733px solid var(--border-default)' : '0.733px solid transparent', transition: `background 100ms ${easing}` }}
          onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--bg-surface)'; }} onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}>
          <PriorityDot priority={issue.priority} />
          <span style={{ width: 75, fontFamily: "'Owners Wide', sans-serif", fontSize: 11, opacity: 0.35, flexShrink: 0, marginLeft: 8 }}>{issue.identifier}</span>
          <span style={{ flex: 1, fontFamily: "'Owners Wide', sans-serif", fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.title}</span>
          {sc > 0 && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 10, opacity: 0.4, marginLeft: 8, flexShrink: 0 }}>{sd}/{sc}</span>}
          <div className="flex gap-1" style={{ marginLeft: 12, flexShrink: 0 }}>{issue.labels.nodes.slice(0, 3).map((l) => <LabelBadge key={l.id} label={l} />)}</div>
          {issue.assignee && <Avatar name={issue.assignee.name} email={issue.assignee.email} url={issue.assignee.avatarUrl} size={22} style={{ marginLeft: 8 }} />}
          {issue.dueDate && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 10, opacity: 0.4, marginLeft: 8, flexShrink: 0 }}>{new Date(issue.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>}
        </div>
      </div>
      {open && kids.length > 0 && (
        <div style={{ paddingLeft: 32, borderLeft: '1px solid rgba(0,0,0,0.06)', marginLeft: 8 }}>
          {kids.map((c) => {
            const full = allIssues.find((i) => i.id === c.id);
            return (
              <div key={c.id} onClick={() => full && onChildClick(full)} className="flex items-center" style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', transition: `background 100ms ${easing}` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.state.color, flexShrink: 0, marginRight: 8 }} />
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 12, flex: 1 }}>{c.title}</span>
                {c.assignee && <Avatar name={c.assignee.name} url={c.assignee.avatarUrl} size={20} />}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

/* Detail panel */
const DetailPanel: React.FC<{
  issue: LinearIssue; states: LinearState[]; users: LinearUser[];
  onClose: () => void; onStateChange: (s: string) => Promise<void>;
  onAssigneeChange: (u: string | null) => Promise<void>;
  onPriorityChange: (p: number) => Promise<void>;
  onDueDateChange: (d: string | null) => Promise<void>;
  onSubIssueClick: (child: LinearIssue) => void;
  onComment: (b: string) => Promise<void>;
}> = ({ issue, states, users, onClose, onStateChange, onAssigneeChange, onPriorityChange, onDueDateChange, onSubIssueClick, onComment }) => {
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [kidsOpen, setKidsOpen] = useState(true);
  const comments = [...(issue.comments?.nodes ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const send = async () => { if (!comment.trim()) return; setSending(true); await onComment(comment.trim()); setComment(''); setSending(false); };

  return (
    <div style={{ flex: '0 0 45%', borderLeft: '0.733px solid var(--border-default)', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 11, opacity: 0.4 }}>{issue.identifier}</span>
          <a href={issue.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 10, opacity: 0.3, textDecoration: 'underline' }}>Open in Linear</a>
        </div>
        <button onClick={onClose} style={{ fontFamily: "'Kaio', sans-serif", fontSize: 18, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>&times;</button>
      </div>

      {/* Scrollable content — independent from left panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: 20, textTransform: 'uppercase', lineHeight: 1.1, margin: '0 0 16px' }}>{issue.title}</h2>
        {issue.description && <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 13, lineHeight: 1.6, opacity: 0.7, marginBottom: 24, whiteSpace: 'pre-wrap' }}>{renderDescription(issue.description)}</p>}

        {/* Editable properties */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div>
            <PropLabel>Status</PropLabel>
            <StyledSelect value={issue.state.id} onChange={onStateChange}
              options={states.map((s) => ({ value: s.id, label: s.name }))} />
          </div>
          <div>
            <PropLabel>Priority</PropLabel>
            <StyledSelect value={String(issue.priority)} onChange={(v) => onPriorityChange(Number(v))}
              options={[0,1,2,3,4].map((p) => ({ value: String(p), label: PRIORITY_LABELS[p]?.label ?? 'None' }))} />
          </div>
          <div>
            <PropLabel>Assignee</PropLabel>
            <StyledSelect value={issue.assignee?.id ?? ''} onChange={(v) => onAssigneeChange(v || null)}
              options={[{ value: '', label: 'Unassigned' }, ...users.map((u) => ({ value: u.id, label: u.name }))]} />
          </div>
          <div>
            <PropLabel>Project</PropLabel>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 12 }}>{issue.project?.name ?? '—'}</span>
          </div>
          <div>
            <PropLabel>Due Date</PropLabel>
            <input type="date" value={issue.dueDate ?? ''} onChange={(e) => onDueDateChange(e.target.value || null)}
              style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 12, background: '#EAF2D7', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '6px 12px', color: '#000', outline: 'none', cursor: 'pointer', width: '100%' }} />
          </div>
        </div>

        {/* Labels */}
        {issue.labels.nodes.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <PropLabel>Labels</PropLabel>
            <div className="flex gap-2 flex-wrap">{issue.labels.nodes.map((l) => <LabelBadge key={l.id} label={l} />)}</div>
          </div>
        )}

        {/* Sub-issues */}
        {issue.children?.nodes?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <button onClick={() => setKidsOpen(!kidsOpen)} className="flex items-center gap-2" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 8px' }}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="var(--text-primary)" style={{ transform: kidsOpen ? 'rotate(90deg)' : '', transition: `transform 150ms ${easing}`, opacity: 0.3 }}><polygon points="0,0 8,4 0,8" /></svg>
              <PropLabel style={{ margin: 0 }}>Sub-issues · {issue.children.nodes.filter((c) => c.state.type === 'completed').length}/{issue.children.nodes.length}</PropLabel>
            </button>
            {kidsOpen && issue.children.nodes.map((c) => {
              const childP = PRIORITY_LABELS[(c as unknown as LinearIssue).priority] ?? PRIORITY_LABELS[0];
              const childLabels = ((c as unknown as LinearIssue).labels?.nodes ?? []);
              const childDue = (c as unknown as LinearIssue).dueDate;
              return (
                <div key={c.id} onClick={() => onSubIssueClick(c as unknown as LinearIssue)}
                  className="flex items-center gap-2" style={{ padding: '8px 8px', borderBottom: '0.5px solid rgba(0,0,0,0.04)', cursor: 'pointer', borderRadius: 4, transition: `background 100ms ${easing}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')} onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.state.color, flexShrink: 0 }} />
                  {childP.color !== '#95A5A6' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: childP.color, flexShrink: 0 }} title={childP.label} />}
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 12, flex: 1 }}>{c.title}</span>
                  {childLabels.slice(0, 2).map((l: LinearLabel) => <LabelBadge key={l.id} label={l} />)}
                  {childDue && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 9, opacity: 0.4, flexShrink: 0 }}>{new Date(childDue).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</span>}
                  {c.assignee && <Avatar name={c.assignee.name} url={c.assignee.avatarUrl} size={20} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Comments */}
        <div>
          <PropLabel>Activity · {comments.length}</PropLabel>
          <div className="flex flex-col gap-3">
            {comments.map((c) => (
              <div key={c.id} style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: 11, textTransform: 'uppercase' }}>{c.user?.name ?? 'Unknown'}</span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 10, opacity: 0.4 }}>
                    {new Date(c.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} · {new Date(c.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 12, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comment input — fixed at bottom */}
      <div style={{ padding: '16px 24px', borderTop: '0.733px solid var(--border-default)', flexShrink: 0 }}>
        <div className="flex gap-2">
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Leave a comment..." rows={2}
            style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 12, flex: 1, background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none', resize: 'none' }} />
          <button onClick={send} disabled={!comment.trim() || sending}
            style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase', padding: '8px 16px', borderRadius: '75.641px', border: 'none', background: comment.trim() ? '#000' : 'rgba(0,0,0,0.1)', color: comment.trim() ? '#EAF2D7' : 'var(--text-primary)', cursor: comment.trim() ? 'pointer' : 'default', alignSelf: 'flex-end' }}>
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PropLabel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: 10, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: 8, ...style }}>{children}</span>
);

export default TasksPage;
