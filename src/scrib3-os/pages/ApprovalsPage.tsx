import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import {
  mockApprovals, approvalStatusColors, approvalTypeLabels,
  type Approval, type ApprovalStatus,
} from '../lib/approvals';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const ApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ApprovalStatus | 'all'>('all');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

  const filtered = filter === 'all' ? mockApprovals : mockApprovals.filter((a) => a.status === filter);
  const pendingCount = mockApprovals.filter((a) => a.status === 'pending').length;

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '1px solid #000' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '16px', textTransform: 'uppercase' }}>Approvals</span>
          {pendingCount > 0 && (
            <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', background: '#F1C40F', color: '#000', padding: '2px 8px', borderRadius: '75.641px' }}>
              {pendingCount} pending
            </span>
          )}
        </div>
        <BurgerButton />
      </header>

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Stats */}
        <div className="flex gap-6" style={{ marginBottom: '24px' }}>
          <Stat value={mockApprovals.length.toString()} label="total" />
          <Stat value={pendingCount.toString()} label="pending" accent={pendingCount > 0} />
          <Stat value={mockApprovals.filter((a) => a.status === 'approved').length.toString()} label="approved" />
          <Stat value={mockApprovals.filter((a) => a.status === 'changes_requested').length.toString()} label="changes requested" />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2" style={{ marginBottom: '24px' }}>
          {(['all', 'pending', 'approved', 'rejected', 'changes_requested'] as const).map((f) => (
            <Pill key={f} label={f === 'changes_requested' ? 'Changes' : f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>

        <div className="flex" style={{ gap: '24px' }}>
          {/* List */}
          <div style={{ flex: selectedApproval ? '0 0 55%' : '1' }}>
            {filtered.map((approval) => (
              <div key={approval.id} onClick={() => setSelectedApproval(approval)}
                style={{
                  padding: '16px 20px', marginBottom: '8px', borderRadius: '10.258px', cursor: 'pointer',
                  border: selectedApproval?.id === approval.id ? '0.733px solid var(--border-default)' : '0.733px solid transparent',
                  background: selectedApproval?.id === approval.id ? 'var(--bg-surface)' : 'transparent',
                  transition: `background 100ms ${easing}`,
                }}
                onMouseEnter={(e) => { if (selectedApproval?.id !== approval.id) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                onMouseLeave={(e) => { if (selectedApproval?.id !== approval.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>{approval.resource_id}</span>
                    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '75.641px', background: `${approvalStatusColors[approval.status]}20`, border: `1px solid ${approvalStatusColors[approval.status]}40`, color: approvalStatusColors[approval.status] }}>
                      {approval.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>
                    {new Date(approval.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', display: 'block' }}>{approval.resource_title}</span>
                <div className="flex items-center gap-2" style={{ marginTop: '4px' }}>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>{approvalTypeLabels[approval.type]}</span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>· Requested by {approval.requested_by_name}</span>
                  <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4 }}>· Approver: {approval.approver_name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selectedApproval && (
            <div style={{ flex: '0 0 40%', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '24px' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
                <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', opacity: 0.4 }}>{selectedApproval.resource_id}</span>
                <button onClick={() => setSelectedApproval(null)} style={{ fontFamily: "'Kaio', sans-serif", fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>&times;</button>
              </div>
              <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '20px', textTransform: 'uppercase', lineHeight: 1.1, margin: '0 0 12px 0' }}>
                {selectedApproval.resource_title}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <PropCard label="Type" value={approvalTypeLabels[selectedApproval.type]} />
                <PropCard label="Status" value={selectedApproval.status.replace('_', ' ')} />
                <PropCard label="Requested By" value={selectedApproval.requested_by_name} />
                <PropCard label="Approver" value={selectedApproval.approver_name} />
                <PropCard label="Created" value={new Date(selectedApproval.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
                <PropCard label="Resolved" value={selectedApproval.resolved_at ? new Date(selectedApproval.resolved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending'} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '8px' }}>Notes</span>
                <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', lineHeight: 1.6, margin: 0, opacity: 0.7 }}>{selectedApproval.notes}</p>
              </div>
              {selectedApproval.status === 'pending' && (
                <div className="flex gap-2">
                  <button style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '75.641px', border: 'none', background: '#27AE60', color: '#fff', cursor: 'pointer' }}>
                    Approve
                  </button>
                  <button style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '75.641px', border: '1px solid #E67E22', background: 'transparent', color: '#E67E22', cursor: 'pointer' }}>
                    Request Changes
                  </button>
                  <button style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '75.641px', border: '1px solid #E74C3C', background: 'transparent', color: '#E74C3C', cursor: 'pointer' }}>
                    Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ value: string; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className="flex flex-col gap-1">
    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', color: accent ? '#F1C40F' : 'var(--text-primary)' }}>{value}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>{label}</span>
  </div>
);

const Pill: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
    padding: '6px 16px', borderRadius: '75.641px',
    border: active ? '1px solid var(--text-primary)' : '1px solid var(--border-default)',
    background: active ? 'var(--text-primary)' : 'transparent',
    color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
    cursor: 'pointer', opacity: active ? 1 : 0.6,
  }}>{label}</button>
);

const PropCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '12px 16px' }}>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.4, display: 'block', marginBottom: '4px' }}>{label}</span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', textTransform: 'capitalize' }}>{value}</span>
  </div>
);

export default ApprovalsPage;
