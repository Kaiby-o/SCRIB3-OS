import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import {
  fetchIssues, fetchIssueDetail, fetchWorkflowStates,
  updateIssueState, addComment,
  type LinearIssue, type LinearState, type LinearLabel,
  PRIORITY_LABELS,
} from '../lib/linear';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Tasks Page — Linear Integration                                    */
/* ------------------------------------------------------------------ */

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<LinearIssue[]>([]);
  const [states, setStates] = useState<LinearState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<LinearIssue | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch issues and states
  const loadData = useCallback(async () => {
    try {
      const [issueData, stateData] = await Promise.all([
        fetchIssues(200),
        fetchWorkflowStates(),
      ]);
      setIssues(issueData);
      setStates(stateData);
      setError(null);
    } catch (e) {
      console.error('[tasks] Load failed:', e);
      setError(e instanceof Error ? e.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Open issue detail
  const openIssue = async (issue: LinearIssue) => {
    setDetailLoading(true);
    setSelectedIssue(issue);
    try {
      const full = await fetchIssueDetail(issue.id);
      setSelectedIssue(full);
    } catch (e) {
      console.error('[tasks] Detail load failed:', e);
    } finally {
      setDetailLoading(false);
    }
  };

  // Group issues by state
  const groupedByState = states.map((state) => ({
    state,
    issues: issues.filter((i) => i.state.id === state.id),
  })).filter((g) => g.issues.length > 0);

  return (
    <div className="os-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="flex items-center justify-between" style={{ height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Tasks</span>
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.3 }}>
            {issues.length} issues · Auto-refreshes every 30s
          </span>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer' }}>
          &larr; Dashboard
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Loading tasks from Linear...
          </span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', color: '#E74C3C' }}>{error}</span>
          <button onClick={loadData} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', padding: '8px 20px', borderRadius: '75.641px', border: '1px solid var(--border-default)', background: 'transparent', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      ) : (
        <div className="flex flex-1" style={{ overflow: 'hidden' }}>
          {/* Issue list */}
          <div style={{ flex: selectedIssue ? '0 0 55%' : '1', overflow: 'auto', padding: '24px' }}>
            {groupedByState.map(({ state, issues: stateIssues }) => (
              <div key={state.id} style={{ marginBottom: '32px' }}>
                {/* State header */}
                <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: state.color }} />
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
                    {state.name}
                  </span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>
                    {stateIssues.length}
                  </span>
                </div>

                {/* Issue rows */}
                {stateIssues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} selected={selectedIssue?.id === issue.id} onClick={() => openIssue(issue)} />
                ))}
              </div>
            ))}
          </div>

          {/* Issue detail panel */}
          {selectedIssue && (
            <IssueDetailPanel
              issue={selectedIssue}
              loading={detailLoading}
              states={states}
              onClose={() => setSelectedIssue(null)}
              onStateChange={async (stateId) => {
                await updateIssueState(selectedIssue.id, stateId);
                loadData();
              }}
              onComment={async (body) => {
                await addComment(selectedIssue.id, body);
                const updated = await fetchIssueDetail(selectedIssue.id);
                setSelectedIssue(updated);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Issue Row                                                          */
/* ------------------------------------------------------------------ */

const IssueRow: React.FC<{ issue: LinearIssue; selected: boolean; onClick: () => void }> = ({ issue, selected, onClick }) => {
  const priority = PRIORITY_LABELS[issue.priority] ?? PRIORITY_LABELS[0];
  const subCount = issue.children?.nodes?.length ?? 0;
  const subDone = issue.children?.nodes?.filter((c) => c.state.type === 'completed').length ?? 0;

  return (
    <div
      onClick={onClick}
      className="flex items-center"
      style={{
        padding: '10px 16px', marginBottom: '2px', borderRadius: '8px', cursor: 'pointer',
        background: selected ? 'var(--bg-surface)' : 'transparent',
        border: selected ? '0.733px solid var(--border-default)' : '0.733px solid transparent',
        transition: `background 100ms ${easing}`,
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--bg-surface)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Priority */}
      <span style={{ width: '24px', fontSize: '12px', opacity: 0.5, flexShrink: 0 }} title={priority.label}>
        {priority.icon}
      </span>

      {/* Identifier */}
      <span style={{ width: '80px', fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4, flexShrink: 0 }}>
        {issue.identifier}
      </span>

      {/* Title */}
      <span style={{ flex: 1, fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {issue.title}
      </span>

      {/* Sub-issues count */}
      {subCount > 0 && (
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, marginLeft: '8px', flexShrink: 0 }}>
          {subDone}/{subCount}
        </span>
      )}

      {/* Labels */}
      <div className="flex gap-1" style={{ marginLeft: '12px', flexShrink: 0 }}>
        {issue.labels.nodes.slice(0, 3).map((label) => (
          <LabelBadge key={label.id} label={label} />
        ))}
      </div>

      {/* Assignee */}
      {issue.assignee && (
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#333', overflow: 'hidden', marginLeft: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {issue.assignee.avatarUrl ? (
            <img src={issue.assignee.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#EAF2D7', fontSize: '9px', fontFamily: "'Kaio', sans-serif", fontWeight: 900 }}>
              {issue.assignee.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
            </span>
          )}
        </div>
      )}

      {/* Date */}
      {issue.dueDate && (
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, marginLeft: '8px', flexShrink: 0 }}>
          {new Date(issue.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
        </span>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Issue Detail Panel                                                 */
/* ------------------------------------------------------------------ */

const IssueDetailPanel: React.FC<{
  issue: LinearIssue;
  loading: boolean;
  states: LinearState[];
  onClose: () => void;
  onStateChange: (stateId: string) => Promise<void>;
  onComment: (body: string) => Promise<void>;
}> = ({ issue, loading: _loading, states, onClose, onStateChange, onComment }) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleComment = async () => {
    if (!comment.trim()) return;
    setSubmitting(true);
    await onComment(comment.trim());
    setComment('');
    setSubmitting(false);
  };

  const priority = PRIORITY_LABELS[issue.priority] ?? PRIORITY_LABELS[0];

  return (
    <div style={{ flex: '0 0 45%', borderLeft: '0.733px solid var(--border-default)', overflow: 'auto', background: 'var(--bg-primary)' }}>
      {/* Panel header */}
      <div className="flex items-center justify-between" style={{ padding: '16px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.4 }}>{issue.identifier}</span>
          <a href={issue.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.3, textDecoration: 'underline' }}>
            Open in Linear
          </a>
        </div>
        <button onClick={onClose} style={{ fontFamily: "'Kaio', sans-serif", fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', opacity: 0.4 }}>&times;</button>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Title */}
        <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '22px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 16px 0', lineHeight: 1.1 }}>
          {issue.title}
        </h2>

        {/* Description */}
        {issue.description && (
          <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, opacity: 0.7, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
            {issue.description}
          </p>
        )}

        {/* Properties */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          {/* Status */}
          <div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Status</span>
            <select
              value={issue.state.id}
              onChange={(e) => onStateChange(e.target.value)}
              style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '8px 14px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', appearance: 'none', width: '100%' }}
            >
              {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Priority</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{priority.icon} {priority.label}</span>
          </div>

          {/* Assignee */}
          <div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Assignee</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{issue.assignee?.name ?? 'Unassigned'}</span>
          </div>

          {/* Project */}
          <div>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '6px' }}>Project</span>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px' }}>{issue.project?.name ?? '—'}</span>
          </div>
        </div>

        {/* Labels */}
        {issue.labels.nodes.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '8px' }}>Labels</span>
            <div className="flex gap-2 flex-wrap">
              {issue.labels.nodes.map((l) => <LabelBadge key={l.id} label={l} />)}
            </div>
          </div>
        )}

        {/* Sub-issues */}
        {issue.children?.nodes?.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '8px' }}>
              Sub-issues · {issue.children.nodes.filter((c) => c.state.type === 'completed').length}/{issue.children.nodes.length}
            </span>
            {issue.children.nodes.map((child) => (
              <div key={child.id} className="flex items-center gap-2" style={{ padding: '6px 0', borderBottom: '0.5px solid rgba(0,0,0,0.04)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: child.state.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', flex: 1 }}>{child.title}</span>
                {child.assignee && (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#333', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {child.assignee.avatarUrl ? (
                      <img src={child.assignee.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#EAF2D7', fontSize: '7px', fontFamily: "'Kaio', sans-serif", fontWeight: 900 }}>
                        {child.assignee.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Comments / Activity */}
        {issue.comments?.nodes?.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '12px' }}>Activity</span>
            {issue.comments.nodes.map((c) => (
              <div key={c.id} style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-surface)', borderRadius: '10.258px' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
                  <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>{c.user?.name ?? 'Unknown'}</span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>
                    {new Date(c.createdAt).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' }}>{c.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Add comment */}
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Leave a comment..."
            rows={3}
            style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', width: '100%', background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '12px 16px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}
          />
          <button
            onClick={handleComment}
            disabled={!comment.trim() || submitting}
            style={{
              fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
              padding: '8px 20px', borderRadius: '75.641px', border: 'none', marginTop: '8px',
              background: comment.trim() ? '#000' : 'rgba(0,0,0,0.1)',
              color: comment.trim() ? '#EAF2D7' : 'var(--text-primary)',
              cursor: comment.trim() ? 'pointer' : 'default',
              opacity: comment.trim() ? 1 : 0.3,
            }}
          >
            {submitting ? 'Sending...' : 'Comment'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Label Badge                                                        */
/* ------------------------------------------------------------------ */

const LabelBadge: React.FC<{ label: LinearLabel }> = ({ label }) => (
  <span style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '9px', letterSpacing: '0.5px',
    padding: '2px 8px', borderRadius: '75.641px', whiteSpace: 'nowrap',
    background: `${label.color}20`, border: `1px solid ${label.color}40`, color: label.color,
  }}>
    {label.name}
  </span>
);

export default TasksPage;
