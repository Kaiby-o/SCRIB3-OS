import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoScrib3 from '../components/LogoScrib3';
import { supabaseInsert } from '../hooks/useSupabase';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

interface VendorForm {
  name: string;
  email: string;
  businessName: string;
  mailingAddress: string;
  scrib3Poc: string;
  workType: string;
  bankDetailsSubmitted: boolean;
  taxFormType: string;
  taxFormSubmitted: boolean;
  currency: string;
}

const defaultForm: VendorForm = {
  name: '',
  email: '',
  businessName: '',
  mailingAddress: '',
  scrib3Poc: 'Ben Lydiat',
  workType: '',
  bankDetailsSubmitted: false,
  taxFormType: 'w9',
  taxFormSubmitted: false,
  currency: 'USD',
};

const VendorOnboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<VendorForm>(defaultForm);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof VendorForm, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const { error } = await supabaseInsert('vendor_profiles', {
      name: form.name,
      email: form.email,
      business_name: form.businessName,
      mailing_address: form.mailingAddress,
      work_type: form.workType,
      bank_details_submitted: form.bankDetailsSubmitted,
      tax_form_type: form.taxFormType || null,
      tax_form_submitted: form.taxFormSubmitted,
      onboarding_complete: form.bankDetailsSubmitted && form.taxFormSubmitted,
    });
    if (error) console.error('[vendor-onboard] Insert failed:', error);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="os-root flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '36px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", marginBottom: '16px' }}>
          Vendor Registered
        </h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', opacity: 0.6, marginBottom: '32px' }}>
          {form.businessName || form.name} has been added. They can now submit invoices once onboarding is complete.
        </p>
        <div className="flex gap-3">
          <PillBtn label="View Vendors" onClick={() => navigate('/vendors')} />
          <PillBtn label="Dashboard" onClick={() => navigate('/dashboard')} secondary />
        </div>
      </div>
    );
  }

  return (
    <div className="os-root" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between" style={{ position: 'fixed' as const, top: 0, left: 0, right: 0, zIndex: 40, background: 'var(--bg-primary)', height: '85px', padding: '0 40px', borderBottom: '0.733px solid var(--border-default)' }}>
        <button onClick={() => navigate('/vendors')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <LogoScrib3 height={18} color="var(--text-primary)" />
        </button>
        <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>
          New Vendor Onboarding
        </span>
        <button onClick={() => navigate('/vendors')} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-primary)', opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}>
          &larr; Vendors
        </button>
      </header>

      <div style={{ padding: '40px', maxWidth: '640px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '28px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 8px 0' }}>
          Vendor Onboarding
        </h1>
        <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '32px' }}>
          All fields required before vendor can submit invoices. Currency: USD, US format.
        </p>

        <div style={{ background: 'var(--bg-surface)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '32px' }}>
          <div className="flex flex-col gap-4">
            <Field label="Contact Name" value={form.name} onChange={(v) => update('name', v)} placeholder="Full name" />
            <Field label="Email" value={form.email} onChange={(v) => update('email', v)} placeholder="vendor@company.com" type="email" />
            <Field label="Business Name" value={form.businessName} onChange={(v) => update('businessName', v)} placeholder="Legal business name" />
            <Field label="Mailing Address" value={form.mailingAddress} onChange={(v) => update('mailingAddress', v)} placeholder="Full mailing address" multiline />
            <Select label="Primary SCRIB3 Point of Contact" value={form.scrib3Poc} onChange={(v) => update('scrib3Poc', v)}
              options={['Ben Lydiat', 'Elena Zheng', 'Omar Anwar', 'Kevin Moran', 'Samantha Kelly', 'Matthew Brannon', 'Madisen', 'Kim']} />
            <Select label="Type of Work" value={form.workType} onChange={(v) => update('workType', v)}
              options={['', 'PR', 'Development', 'Design', 'Motion Graphics / Animation', 'Content / Social', 'Strategy / Consulting', 'Other']} />

            <div style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)', paddingTop: '16px', marginTop: '8px' }}>
              <span style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
                Payment Details
              </span>

              <Checkbox label="Bank / ACH details submitted" checked={form.bankDetailsSubmitted} onChange={(v) => update('bankDetailsSubmitted', v)} />

              <Select label="Tax Form Type" value={form.taxFormType} onChange={(v) => update('taxFormType', v)}
                options={['w9', 'w8ben-e']} />
              <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '10px', opacity: 0.4, margin: '-8px 0 4px 0' }}>
                W9 for US vendors · W8BEN-E for international vendors
              </p>

              <Checkbox label="Tax form submitted" checked={form.taxFormSubmitted} onChange={(v) => update('taxFormSubmitted', v)} />
            </div>
          </div>
        </div>

        <div className="flex justify-end" style={{ marginTop: '24px' }}>
          <PillBtn label="Register Vendor" onClick={handleSubmit} accent />
        </div>
      </div>
    </div>
  );
};

/* Form components */

const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; multiline?: boolean }> = ({ label, value, onChange, placeholder, type = 'text', multiline }) => (
  <div className="flex flex-col gap-1">
    <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>{label}</label>
    {multiline ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2}
        style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '10.258px', padding: '10px 16px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 16px', color: 'var(--text-primary)', outline: 'none' }} />
    )}
  </div>
);

const Select: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1">
    <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: 'var(--bg-primary)', border: '0.733px solid var(--border-default)', borderRadius: '75.641px', padding: '10px 16px', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', appearance: 'none' }}>
      {options.map((o) => <option key={o} value={o}>{o || '— Select —'}</option>)}
    </select>
  </div>
);

const Checkbox: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2" style={{ cursor: 'pointer', padding: '6px 0' }}>
    <div style={{ width: 18, height: 18, borderRadius: 4, border: '1px solid var(--border-default)', background: checked ? '#D7ABC5' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: `background 0.15s ${easing}` }}
      onClick={() => onChange(!checked)}>
      {checked && <span style={{ color: '#000', fontSize: '12px', lineHeight: 1 }}>✓</span>}
    </div>
    <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', letterSpacing: '0.5px' }}>{label}</span>
  </label>
);

const PillBtn: React.FC<{ label: string; onClick: () => void; secondary?: boolean; accent?: boolean }> = ({ label, onClick, secondary, accent }) => (
  <button onClick={onClick} style={{
    fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
    padding: '10px 24px', borderRadius: '75.641px',
    border: secondary ? '1px solid var(--border-default)' : 'none',
    background: accent ? '#D7ABC5' : secondary ? 'transparent' : '#000',
    color: accent ? '#000' : secondary ? 'var(--text-primary)' : '#EAF2D7',
    cursor: 'pointer', transition: `opacity 0.2s ${easing}`,
  }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
    {label}
  </button>
);

export default VendorOnboardPage;
