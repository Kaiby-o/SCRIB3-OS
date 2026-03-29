import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import BurgerButton from '../components/BurgerButton';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  mockVendors,
  mockInvoices,
  invoiceStatusColors,
  type VendorProfile,
  type Invoice,
  type InvoiceStatus,
} from '../lib/vendors';
import { useSupabaseQuery } from '../hooks/useSupabase';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Shared                                                             */
/* ------------------------------------------------------------------ */

const PageHeader: React.FC<{ title: string; navigate: ReturnType<typeof useNavigate> }> = ({
  title,
  navigate: nav,
}) => (
  <header
    className="flex items-center justify-between"
    style={{
      position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px',
      padding: '0 40px',
      borderBottom: '0.733px solid var(--border-default)',
    }}
  >
    <button onClick={() => nav('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <LogoScrib3 height={18} color="var(--text-primary)" />
    </button>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
      {title}
    </span>
    <button
      onClick={() => nav('/dashboard')}
      style={{
        fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px',
        textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5,
        background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
    >
      &larr; Dashboard
    </button>
  <BurgerButton />
      </header>
);

const StatusBadge: React.FC<{ status: string; color: string }> = ({ status, color }) => (
  <span
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px',
      textTransform: 'uppercase', padding: '3px 10px', borderRadius: '75.641px',
      background: `${color}15`, border: `1px solid ${color}40`,
    }}
  >
    <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
    {status}
  </span>
);

const Pill: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px',
      textTransform: 'uppercase', padding: '6px 16px', borderRadius: '75.641px',
      border: active ? '1px solid var(--text-primary)' : '1px solid var(--border-default)',
      background: active ? 'var(--text-primary)' : 'transparent',
      color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
      cursor: 'pointer', transition: 'all 0.2s', opacity: active ? 1 : 0.6,
    }}
  >
    {label}
  </button>
);

const TH: React.FC<{ width: string; children: React.ReactNode }> = ({ width, children }) => (
  <span style={{ width, fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
    {children}
  </span>
);

/* ------------------------------------------------------------------ */
/*  Tab: Vendors                                                       */
/* ------------------------------------------------------------------ */

const VendorsTab: React.FC<{ onOnboard: () => void }> = ({ onOnboard }) => {
  const { data: dbVendors } = useSupabaseQuery<Record<string, unknown>>('vendor_profiles', '*');
  const vendors: VendorProfile[] = useMemo(() => {
    if (dbVendors.length > 0) {
      return dbVendors.map((v) => ({
        id: v.id as string,
        name: (v.name ?? '') as string,
        email: (v.email ?? '') as string,
        businessName: (v.business_name ?? '') as string,
        mailingAddress: (v.mailing_address ?? '') as string,
        scrib3Poc: '',
        workType: (v.work_type ?? '') as string,
        bankDetailsSubmitted: (v.bank_details_submitted ?? false) as boolean,
        taxFormType: (v.tax_form_type ?? null) as VendorProfile['taxFormType'],
        taxFormSubmitted: (v.tax_form_submitted ?? false) as boolean,
        onboardingComplete: (v.onboarding_complete ?? false) as boolean,
        activeProjects: [] as string[],
        createdAt: (v.created_at ?? '') as string,
      }));
    }
    return mockVendors;
  }, [dbVendors]);

  const complete = vendors.filter((v) => v.onboardingComplete);
  const pending = vendors.filter((v) => !v.onboardingComplete);

  return (
    <>
      {/* Stats */}
      <div className="flex gap-6" style={{ marginBottom: '24px' }}>
        <Stat value={vendors.length.toString()} label="total vendors" />
        <Stat value={complete.length.toString()} label="onboarded" />
        <Stat value={pending.length.toString()} label="pending" accent={pending.length > 0} />
      </div>

      {/* + New Vendor */}
      <div className="flex justify-end" style={{ marginBottom: '16px' }}>
        <button
          onClick={onOnboard}
          style={{
            fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px',
            textTransform: 'uppercase', background: '#000', color: '#EAF2D7',
            border: 'none', borderRadius: '75.641px', padding: '10px 24px',
            cursor: 'pointer', transition: `opacity 0.2s ${easing}`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          + New Vendor
        </button>
      </div>

      {/* Vendor table */}
      <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: '700px' }}>
            <div className="flex items-center" style={{ padding: '14px 24px', borderBottom: '0.733px solid var(--border-default)', opacity: 0.5 }}>
              <TH width="18%">Vendor</TH>
              <TH width="18%">Business</TH>
              <TH width="14%">Work Type</TH>
              <TH width="14%">SCRIB3 POC</TH>
              <TH width="10%">Bank</TH>
              <TH width="10%">Tax Form</TH>
              <TH width="16%">Status</TH>
            </div>
            {vendors.map((v) => (
              <VendorRow key={v.id} vendor={v} />
            ))}
          </div>
        </div>
      </div>

      {/* Rule callout */}
      <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.35, marginTop: '20px', textAlign: 'center' }}>
        No invoice accepted without completed onboarding — bank details + tax form required
      </p>
    </>
  );
};

const VendorRow: React.FC<{ vendor: VendorProfile }> = ({ vendor: v }) => (
  <div
    className="flex items-center"
    style={{
      padding: '14px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)',
      transition: `background 0.15s ${easing}`,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <div style={{ width: '18%' }}>
      <div className="flex flex-col">
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase' }}>{v.name}</span>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.5 }}>{v.email}</span>
      </div>
    </div>
    <div style={{ width: '18%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{v.businessName}</span>
    </div>
    <div style={{ width: '14%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{v.workType}</span>
    </div>
    <div style={{ width: '14%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{v.scrib3Poc}</span>
    </div>
    <div style={{ width: '10%' }}>
      <StatusBadge status={v.bankDetailsSubmitted ? 'Yes' : 'No'} color={v.bankDetailsSubmitted ? '#27AE60' : '#E74C3C'} />
    </div>
    <div style={{ width: '10%' }}>
      <StatusBadge
        status={v.taxFormSubmitted ? (v.taxFormType ?? '—').toUpperCase() : 'Missing'}
        color={v.taxFormSubmitted ? '#27AE60' : '#E74C3C'}
      />
    </div>
    <div style={{ width: '16%' }}>
      <StatusBadge
        status={v.onboardingComplete ? 'Complete' : 'Incomplete'}
        color={v.onboardingComplete ? '#27AE60' : '#E67E22'}
      />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Tab: Invoices                                                      */
/* ------------------------------------------------------------------ */

const InvoicesTab: React.FC = () => {
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');

  const { data: dbInvoices } = useSupabaseQuery<Record<string, unknown>>('invoices', '*, vendor_profiles(name)');
  const allInvoices: Invoice[] = useMemo(() => {
    if (dbInvoices.length > 0) {
      return dbInvoices.map((inv) => ({
        id: inv.id as string,
        vendorId: (inv.vendor_id ?? '') as string,
        vendorName: ((inv.vendor_profiles as Record<string, unknown>)?.name ?? '') as string,
        lineItems: (inv.line_items ?? []) as Invoice['lineItems'],
        totalAmount: Number(inv.total_amount ?? 0),
        currency: (inv.currency ?? 'USD') as string,
        submittedAt: inv.submitted_at ? new Date(inv.submitted_at as string).toISOString().split('T')[0] : '',
        status: (inv.status ?? 'submitted') as InvoiceStatus,
        validatedBy: (inv.validated_by ?? null) as string | null,
        validatedAt: inv.validated_at ? new Date(inv.validated_at as string).toISOString().split('T')[0] : null,
        notes: (inv.notes ?? '') as string,
      }));
    }
    return mockInvoices;
  }, [dbInvoices]);

  const filtered = filter === 'all' ? allInvoices : allInvoices.filter((i) => i.status === filter);

  const totalPending = allInvoices.filter((i) => i.status === 'submitted').reduce((a, i) => a + i.totalAmount, 0);
  const totalProcessing = allInvoices.filter((i) => i.status === 'processing' || i.status === 'validated').reduce((a, i) => a + i.totalAmount, 0);
  const totalPaid = allInvoices.filter((i) => i.status === 'paid').reduce((a, i) => a + i.totalAmount, 0);

  return (
    <>
      {/* Stats */}
      <div className="flex gap-6" style={{ marginBottom: '24px' }}>
        <Stat value={`$${totalPending.toLocaleString()}`} label="awaiting review" accent={totalPending > 0} />
        <Stat value={`$${totalProcessing.toLocaleString()}`} label="in processing" />
        <Stat value={`$${totalPaid.toLocaleString()}`} label="paid" />
        <Stat value={allInvoices.length.toString()} label="total invoices" />
      </div>

      {/* Filters */}
      <div className="flex gap-2" style={{ marginBottom: '16px' }}>
        {(['all', 'submitted', 'validated', 'processing', 'paid', 'rejected'] as const).map((f) => (
          <Pill key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>

      {/* Invoice table */}
      <div style={{ border: '0.733px solid var(--border-default)', borderRadius: '10.258px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: '750px' }}>
            <div className="flex items-center" style={{ padding: '14px 24px', borderBottom: '0.733px solid var(--border-default)', opacity: 0.5 }}>
              <TH width="12%">Invoice</TH>
              <TH width="14%">Vendor</TH>
              <TH width="28%">Line Items</TH>
              <TH width="10%">Amount</TH>
              <TH width="12%">Submitted</TH>
              <TH width="12%">Validated By</TH>
              <TH width="12%">Status</TH>
            </div>
            {filtered.map((inv) => (
              <InvoiceRow key={inv.id} invoice={inv} />
            ))}
            {filtered.length === 0 && (
              <div className="flex items-center justify-center" style={{ padding: '48px', opacity: 0.4 }}>
                <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  No invoices match this filter
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice flow callout */}
      <div
        style={{
          marginTop: '24px', padding: '20px', background: 'var(--bg-surface)',
          border: '0.733px solid var(--border-default)', borderRadius: '10.258px',
        }}
      >
        <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '13px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Invoice Flow
        </span>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.6, lineHeight: 1.6, margin: 0 }}>
          1. Vendor submits invoice with project code(s) — multiple clients = separate line items
          <br />2. Submission notifies SCRIB3 POC (person who assigned the work)
          <br />3. POC validates: amount correct + work satisfactorily completed → marks approved
          <br />4. Approved invoice routes to Camila for payment processing
          <br />5. No invoice accepted without completed vendor onboarding
        </p>
      </div>
    </>
  );
};

const InvoiceRow: React.FC<{ invoice: Invoice }> = ({ invoice: inv }) => (
  <div
    className="flex items-center"
    style={{ padding: '14px 24px', borderBottom: '0.5px solid rgba(0,0,0,0.06)', transition: `background 0.15s ${easing}` }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <div style={{ width: '12%' }}>
      <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>
        {inv.id.toUpperCase()}
      </span>
    </div>
    <div style={{ width: '14%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px' }}>{inv.vendorName}</span>
    </div>
    <div style={{ width: '28%' }}>
      <div className="flex flex-col gap-1">
        {inv.lineItems.map((li, i) => (
          <span key={i} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.8 }}>
            {li.projectCode} — {li.clientName}: ${li.amount.toLocaleString()}
          </span>
        ))}
      </div>
    </div>
    <div style={{ width: '10%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', fontWeight: 600 }}>
        ${inv.totalAmount.toLocaleString()}
      </span>
    </div>
    <div style={{ width: '12%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.6 }}>{inv.submittedAt}</span>
    </div>
    <div style={{ width: '12%' }}>
      <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', opacity: 0.6 }}>{inv.validatedBy ?? '—'}</span>
    </div>
    <div style={{ width: '12%' }}>
      <StatusBadge status={inv.status} color={invoiceStatusColors[inv.status]} />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Stat                                                               */
/* ------------------------------------------------------------------ */

const Stat: React.FC<{ value: string; label: string; accent?: boolean }> = ({ value, label, accent }) => (
  <div className="flex flex-col gap-1">
    <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', color: accent ? '#E74C3C' : 'var(--text-primary)' }}>
      {value}
    </span>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.45 }}>
      {label}
    </span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const VendorManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<'vendors' | 'invoices'>('vendors');

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <PageHeader title="Vendor & Invoice Management" navigate={navigate} />

      <div style={{ padding: isMobile ? '16px' : '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Title */}
        <h1
          style={{
            fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: isMobile ? '24px' : '32px',
            textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 24px 0',
          }}
        >
          Vendors & Invoices
        </h1>

        {/* Tab switcher */}
        <div className="flex gap-2" style={{ marginBottom: '32px' }}>
          <Pill label="Vendors" active={tab === 'vendors'} onClick={() => setTab('vendors')} />
          <Pill label="Invoices" active={tab === 'invoices'} onClick={() => setTab('invoices')} />
        </div>

        {tab === 'vendors' ? (
          <VendorsTab onOnboard={() => navigate('/vendors/onboard')} />
        ) : (
          <InvoicesTab />
        )}
      </div>
    </div>
  );
};

export default VendorManagementPage;
