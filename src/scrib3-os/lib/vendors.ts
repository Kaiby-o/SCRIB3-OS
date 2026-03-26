// ===== Vendor & Invoice Types + Mock Data =====
// Plan v4 §3F — Vendor & Invoice System (Sixtyne — Montana gap)
// Invoicing POC: Camila

export interface VendorProfile {
  id: string;
  name: string;
  email: string;
  businessName: string;
  mailingAddress: string;
  scrib3Poc: string;        // SCRIB3 point of contact
  workType: string;         // PR / Development / Design / etc.
  bankDetailsSubmitted: boolean;
  taxFormType: 'w9' | 'w8ben-e' | null;
  taxFormSubmitted: boolean;
  onboardingComplete: boolean;
  activeProjects: string[]; // project codes
  createdAt: string;
}

export type InvoiceStatus = 'submitted' | 'validated' | 'processing' | 'paid' | 'rejected';

export interface InvoiceLineItem {
  description: string;
  projectCode: string;
  clientName: string;
  amount: number;
}

export interface Invoice {
  id: string;
  vendorId: string;
  vendorName: string;
  lineItems: InvoiceLineItem[];
  totalAmount: number;
  currency: string;
  submittedAt: string;
  status: InvoiceStatus;
  validatedBy: string | null;
  validatedAt: string | null;
  notes: string;
}

export function isOnboardingComplete(v: VendorProfile): boolean {
  return (
    !!v.businessName &&
    !!v.mailingAddress &&
    !!v.scrib3Poc &&
    !!v.workType &&
    v.bankDetailsSubmitted &&
    v.taxFormSubmitted
  );
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

export const mockVendors: VendorProfile[] = [
  {
    id: 'v1',
    name: 'Tolani Daniel',
    email: 'tolani@scrib3.co',
    businessName: 'Tolani Motion Studio',
    mailingAddress: 'Lagos, Nigeria',
    scrib3Poc: 'Ben Lydiatt',
    workType: 'Motion Graphics / Animation',
    bankDetailsSubmitted: true,
    taxFormType: 'w8ben-e',
    taxFormSubmitted: true,
    onboardingComplete: true,
    activeProjects: ['CDN-012', 'RSK-003'],
    createdAt: '2025-08-15',
  },
  {
    id: 'v2',
    name: 'Jake Embleton',
    email: 'jake@scrib3.co',
    businessName: 'Embleton Creative',
    mailingAddress: 'Manila, Philippines',
    scrib3Poc: 'Kevin Moran',
    workType: 'Content / Social',
    bankDetailsSubmitted: true,
    taxFormType: 'w8ben-e',
    taxFormSubmitted: true,
    onboardingComplete: true,
    activeProjects: ['FT-005', 'CDN-014'],
    createdAt: '2025-09-02',
  },
  {
    id: 'v3',
    name: 'Studio Parallax',
    email: 'hello@studioparallax.com',
    businessName: 'Studio Parallax LLC',
    mailingAddress: '142 Design Ave, Brooklyn, NY 11201',
    scrib3Poc: 'Samantha Kelly',
    workType: 'Brand Design',
    bankDetailsSubmitted: true,
    taxFormType: 'w9',
    taxFormSubmitted: true,
    onboardingComplete: true,
    activeProjects: ['RSK-001'],
    createdAt: '2025-10-20',
  },
  {
    id: 'v4',
    name: 'ChainDev Co',
    email: 'ops@chaindev.co',
    businessName: 'ChainDev Co',
    mailingAddress: '88 Blockchain Blvd, Austin, TX 78701',
    scrib3Poc: 'Elena Zheng',
    workType: 'Development',
    bankDetailsSubmitted: true,
    taxFormType: 'w9',
    taxFormSubmitted: false,
    onboardingComplete: false,
    activeProjects: [],
    createdAt: '2026-02-10',
  },
  {
    id: 'v5',
    name: 'Narrative PR',
    email: 'accounts@narrativepr.io',
    businessName: 'Narrative PR Inc',
    mailingAddress: '501 PR Lane, Miami, FL 33101',
    scrib3Poc: 'Matthew Brannon',
    workType: 'PR',
    bankDetailsSubmitted: false,
    taxFormType: null,
    taxFormSubmitted: false,
    onboardingComplete: false,
    activeProjects: [],
    createdAt: '2026-03-18',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    vendorId: 'v1',
    vendorName: 'Tolani Daniel',
    lineItems: [
      { description: 'Motion graphics — Cardano Q1 campaign', projectCode: 'CDN-012', clientName: 'Cardano', amount: 3500 },
      { description: 'Animation — Rootstock explainer', projectCode: 'RSK-003', clientName: 'Rootstock', amount: 2200 },
    ],
    totalAmount: 5700,
    currency: 'USD',
    submittedAt: '2026-03-20',
    status: 'validated',
    validatedBy: 'Ben Lydiatt',
    validatedAt: '2026-03-21',
    notes: '',
  },
  {
    id: 'inv-002',
    vendorId: 'v2',
    vendorName: 'Jake Embleton',
    lineItems: [
      { description: 'Social content — Franklin Templeton March', projectCode: 'FT-005', clientName: 'Franklin Templeton', amount: 4200 },
    ],
    totalAmount: 4200,
    currency: 'USD',
    submittedAt: '2026-03-22',
    status: 'submitted',
    validatedBy: null,
    validatedAt: null,
    notes: 'Awaiting Kevin review',
  },
  {
    id: 'inv-003',
    vendorId: 'v3',
    vendorName: 'Studio Parallax',
    lineItems: [
      { description: 'Brand design — Rootstock refresh phase 2', projectCode: 'RSK-001', clientName: 'Rootstock', amount: 8500 },
    ],
    totalAmount: 8500,
    currency: 'USD',
    submittedAt: '2026-03-15',
    status: 'paid',
    validatedBy: 'Samantha Kelly',
    validatedAt: '2026-03-16',
    notes: '',
  },
  {
    id: 'inv-004',
    vendorId: 'v1',
    vendorName: 'Tolani Daniel',
    lineItems: [
      { description: 'Motion graphics — Cardano Feb batch', projectCode: 'CDN-012', clientName: 'Cardano', amount: 3200 },
    ],
    totalAmount: 3200,
    currency: 'USD',
    submittedAt: '2026-02-28',
    status: 'paid',
    validatedBy: 'Ben Lydiatt',
    validatedAt: '2026-03-01',
    notes: '',
  },
  {
    id: 'inv-005',
    vendorId: 'v2',
    vendorName: 'Jake Embleton',
    lineItems: [
      { description: 'Social content — Cardano March', projectCode: 'CDN-014', clientName: 'Cardano', amount: 2800 },
      { description: 'Social content — Franklin Templeton Feb', projectCode: 'FT-005', clientName: 'Franklin Templeton', amount: 3600 },
    ],
    totalAmount: 6400,
    currency: 'USD',
    submittedAt: '2026-03-10',
    status: 'processing',
    validatedBy: 'Kevin Moran',
    validatedAt: '2026-03-11',
    notes: 'Routed to Camila for payment',
  },
];

export const invoiceStatusColors: Record<InvoiceStatus, string> = {
  submitted: '#6E93C3',
  validated: '#F1C40F',
  processing: '#E67E22',
  paid: '#27AE60',
  rejected: '#E74C3C',
};
