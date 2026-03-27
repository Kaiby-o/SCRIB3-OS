// ===== Approvals System =====
// Phase 9 — Handoff approval workflows
// Supports: pre-alignment sign-off, project handoffs, deliverable approvals

import { supabase } from './supabase';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';
export type ApprovalType = 'pre_alignment' | 'project_handoff' | 'deliverable' | 'scope_change';

export interface Approval {
  id: string;
  type: ApprovalType;
  resource_id: string;       // project code or resource ID
  resource_title: string;
  requested_by: string;      // user ID
  requested_by_name: string;
  approver_id: string;       // user ID of required approver
  approver_name: string;
  status: ApprovalStatus;
  notes: string;
  created_at: string;
  resolved_at: string | null;
}

// Mock approvals for development
export const mockApprovals: Approval[] = [
  {
    id: 'apr-1', type: 'pre_alignment', resource_id: 'RSK-001', resource_title: 'Rootstock Brand Refresh Phase 2',
    requested_by: 'tm-kevin', requested_by_name: 'Kevin Moran',
    approver_id: 'tm-omar', approver_name: 'Omar Anwar',
    status: 'pending', notes: 'All 17 fields complete. Ready for account lead sign-off.',
    created_at: '2026-03-27T10:00:00Z', resolved_at: null,
  },
  {
    id: 'apr-2', type: 'pre_alignment', resource_id: 'FT-005', resource_title: 'BENJI Content Series',
    requested_by: 'tm-sam', requested_by_name: 'Samantha Kelly',
    approver_id: 'tm-elena', approver_name: 'Elena Zheng',
    status: 'approved', notes: 'Alignment confirmed. Proceed to production.',
    created_at: '2026-03-25T14:00:00Z', resolved_at: '2026-03-25T16:30:00Z',
  },
  {
    id: 'apr-3', type: 'project_handoff', resource_id: 'CDN-014', resource_title: 'Cardano Social Content March',
    requested_by: 'tm-jake', requested_by_name: 'Jake Embleton',
    approver_id: 'tm-elena', approver_name: 'Elena Zheng',
    status: 'pending', notes: 'Content calendar ready for review before client delivery.',
    created_at: '2026-03-26T09:00:00Z', resolved_at: null,
  },
  {
    id: 'apr-4', type: 'deliverable', resource_id: 'MID-002', resource_title: 'Midnight Testnet Launch Campaign',
    requested_by: 'tm-sam', requested_by_name: 'Samantha Kelly',
    approver_id: 'tm-sixtyne', approver_name: 'Sixtyne Perez',
    status: 'changes_requested', notes: 'Messaging needs refinement. See comments on the brief.',
    created_at: '2026-03-24T11:00:00Z', resolved_at: '2026-03-24T15:00:00Z',
  },
  {
    id: 'apr-5', type: 'scope_change', resource_id: 'CTN-003', resource_title: 'Canton Enterprise Case Studies',
    requested_by: 'tm-cynthia', requested_by_name: 'Cynthia Gentry',
    approver_id: 'tm-elena', approver_name: 'Elena Zheng',
    status: 'pending', notes: 'Client requesting additional case study beyond original SOW scope.',
    created_at: '2026-03-27T08:00:00Z', resolved_at: null,
  },
];

export const approvalStatusColors: Record<ApprovalStatus, string> = {
  pending: '#F1C40F',
  approved: '#27AE60',
  rejected: '#E74C3C',
  changes_requested: '#E67E22',
};

export const approvalTypeLabels: Record<ApprovalType, string> = {
  pre_alignment: 'Pre-Alignment',
  project_handoff: 'Project Handoff',
  deliverable: 'Deliverable',
  scope_change: 'Scope Change',
};

// Supabase operations (fire-and-forget for now, tables may not exist yet)
export function submitApproval(approval: Omit<Approval, 'id' | 'created_at' | 'resolved_at'>) {
  void supabase.from('approvals').insert({
    ...approval,
    created_at: new Date().toISOString(),
  });
}

export function resolveApproval(id: string, status: 'approved' | 'rejected' | 'changes_requested', notes?: string) {
  void supabase.from('approvals').update({
    status,
    notes: notes ?? '',
    resolved_at: new Date().toISOString(),
  }).eq('id', id);
}
