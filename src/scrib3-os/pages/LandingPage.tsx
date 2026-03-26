import React, { useState, useEffect, useCallback, useRef } from 'react';
import LogoScrib3 from '../components/LogoScrib3';
import LoginDialog from '../components/LoginDialog';
import { supabase } from '../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LANDING_LINKS = [
  { label: 'HOME', href: 'https://scrib3.co/', type: 'link' as const },
  { label: 'WORK', href: 'https://scrib3.co/', type: 'link' as const },
  { label: 'OUR TEAM', href: 'https://scrib3.co/', type: 'link' as const },
  { label: "LET\u2019S TALK", href: '', type: 'dialog' as const },
];

const SOCIAL_LINKS = [
  { label: 'Linkedin', href: 'https://www.linkedin.com/company/scrib3/' },
  { label: 'Twitter (X)', href: 'https://x.com/scrib3_co' },
  { label: 'Substack', href: 'https://scrib3.substack.com/' },
];

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Having Issues? email submission                                    */
/* ------------------------------------------------------------------ */

async function submitSupportEmail(email: string): Promise<boolean> {
  const subject = encodeURIComponent('SCRIB3 OS — Having Issues');
  const body = encodeURIComponent(`${email} is having issues with the SCRIB3 OS site.`);
  window.location.href = `mailto:ben.lydiat@scrib3.co?subject=${subject}&body=${body}`;
  return true;
}

/* ------------------------------------------------------------------ */
/*  Let's Talk Dialog                                                  */
/* ------------------------------------------------------------------ */

const LetsTalkDialog: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [heardAbout, setHeardAbout] = useState('');
  const [services, setServices] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const [emailError, setEmailError] = useState('');

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return;
    if (!isValidEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setSending(true);

    // Store in Supabase — this IS the submission (no mailto)
    const { error } = await supabase.from('support_requests').insert({
      email: email.trim(),
      status: 'contact_form',
      metadata: {
        name: name.trim(),
        heard_about: heardAbout.trim() || null,
        services: services.trim() || null,
        message: message.trim() || null,
        submitted_at: new Date().toISOString(),
      },
    });

    if (error) console.warn('Contact form insert failed:', error.message);

    setSending(false);
    setSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 70, background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#EAF2D7',
          borderRadius: '10.258px',
          padding: '40px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 20, fontFamily: "'Kaio', sans-serif", fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#000' }}>&times;</button>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center" style={{ padding: '40px 0' }}>
            {/* Checkmark SVG */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: '24px' }}>
              <circle cx="32" cy="32" r="30" stroke="#D7ABC5" strokeWidth="2" />
              <path d="M20 32L28 40L44 24" stroke="#D7ABC5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', textTransform: 'uppercase', textAlign: 'center', margin: '0 0 8px 0' }}>
              Your message has been submitted!
            </h2>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '13px', opacity: 0.6, textAlign: 'center' }}>
              We'll be in touch soon.
            </p>
            <button onClick={onClose} style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '24px', padding: '10px 32px', borderRadius: '75.641px', border: 'none', background: '#000', color: '#EAF2D7', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        ) : (
          /* Form */
          <>
            <h2 style={{ fontFamily: "'Kaio', sans-serif", fontWeight: 800, fontSize: '24px', textTransform: 'uppercase', fontFeatureSettings: "'ordn' 1, 'dlig' 1", margin: '0 0 8px 0' }}>
              Let's Talk
            </h2>
            <p style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', opacity: 0.5, marginBottom: '24px' }}>
              Tell us about your project. Fields marked * are required.
            </p>

            <div className="flex flex-col gap-4">
              <FormField label="Name *" value={name} onChange={setName} placeholder="Your name" />
              <div className="flex flex-col gap-1">
                <FormField label="Email *" value={email} onChange={(v) => { setEmail(v); setEmailError(''); }} placeholder="your@email.com" type="email" />
                {emailError && <span style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', color: '#E74C3C', paddingLeft: '16px' }}>{emailError}</span>}
              </div>
              <FormField label="Where did you hear about us?" value={heardAbout} onChange={setHeardAbout} placeholder="e.g. Twitter, referral, conference..." />
              <FormField label="What services got your attention?" value={services} onChange={setServices} placeholder="e.g. Brand, PR, Content, Strategy..." />
              <div className="flex flex-col gap-1">
                <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>Message</label>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your project..."
                  rows={4}
                  style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: '#fff', border: '0.733px solid #000', borderRadius: '10.258px', padding: '12px 16px', color: '#000', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!name.trim() || !email.trim() || sending}
                style={{
                  fontFamily: "'Owners Wide', sans-serif", fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase',
                  padding: '12px 32px', borderRadius: '75.641px', border: 'none',
                  background: name.trim() && email.trim() ? '#000' : 'rgba(0,0,0,0.2)',
                  color: '#EAF2D7', cursor: name.trim() && email.trim() ? 'pointer' : 'default',
                  transition: `opacity 200ms ${easing}`, marginTop: '8px',
                }}
                onMouseEnter={(e) => { if (name.trim() && email.trim()) e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {sending ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const FormField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="flex flex-col gap-1">
    <label style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.5 }}>{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      style={{ fontFamily: "'Owners Wide', sans-serif", fontSize: '14px', background: '#fff', border: '0.733px solid #000', borderRadius: '75.641px', padding: '10px 16px', color: '#000', outline: 'none' }} />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Landing Nav Overlay                                                */
/* ------------------------------------------------------------------ */

const LandingNavOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onLetsTalk: () => void;
}> = ({ isOpen, onClose, onLetsTalk }) => {
  const [issueEmail, setIssueEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  /* escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* body scroll lock */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* handle email submit */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueEmail.trim() || !issueEmail.includes('@')) return;
    const ok = await submitSupportEmail(issueEmail.trim());
    if (ok) {
      setEmailSent(true);
      setIssueEmail('');
      setTimeout(() => setEmailSent(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0"
      style={{
        zIndex: 50,
        background: '#000000',
        clipPath: isOpen
          ? 'circle(150% at 100% 0%)'
          : 'circle(0% at 100% 0%)',
        transition: `clip-path 400ms ${easing}`,
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {/* Top-left: SCRIB3 logo — 30% larger */}
      <div
        className="absolute"
        style={{ top: 32, left: 40, transform: 'scale(1.3)', transformOrigin: 'top left' }}
      >
        <LogoScrib3 height={22} color="#EAF2D7" />
      </div>

      {/* Top-right: Close button — 30% larger */}
      <button
        onClick={onClose}
        className="absolute"
        style={{
          fontFamily: "'Kaio', sans-serif",
          top: 32,
          right: 40,
          color: '#EAF2D7',
          fontSize: '36px',
          lineHeight: 1,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          transform: 'scale(1.3)',
          transformOrigin: 'top right',
        }}
        aria-label="Close navigation"
      >
        &times;
      </button>

      {/* Centre: Main nav links — Kaio Black 80px, line-height 90% */}
      <div className="flex flex-col items-center justify-center h-full" style={{ gap: '16px' }}>
        {LANDING_LINKS.map((link) => (
          link.type === 'dialog' ? (
            <button
              key={link.label}
              onClick={() => { onLetsTalk(); }}
              style={{
                fontFamily: "'Kaio', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(36px, 5.5vw, 80px)',
                lineHeight: '0.9',
                letterSpacing: '0px',
                color: '#EAF2D7',
                background: 'none',
                border: 'none',
                textDecoration: 'none',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
                transition: `opacity 200ms ${easing}`,
                fontFeatureSettings: "'ordn' 1, 'dlig' 1",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {link.label}
            </button>
          ) : (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'Kaio', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(36px, 5.5vw, 80px)',
                lineHeight: '0.9',
                letterSpacing: '0px',
                color: '#EAF2D7',
                background: 'none',
                textDecoration: 'none',
                textTransform: 'uppercase' as const,
                cursor: 'pointer',
                transition: `opacity 200ms ${easing}`,
                fontFeatureSettings: "'ordn' 1, 'dlig' 1",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {link.label}
            </a>
          )
        ))}
      </div>

      {/* Bottom-left: "Having Issues?" — 30% larger, Owners Wide */}
      <form
        onSubmit={handleEmailSubmit}
        className="absolute flex flex-col"
        style={{
          bottom: 32,
          left: 40,
          gap: '8px',
          transform: 'scale(1.3)',
          transformOrigin: 'bottom left',
        }}
      >
        <span
          style={{ fontFamily: "'Owners Wide', sans-serif", color: '#EAF2D7', opacity: 0.7, fontSize: '13px', letterSpacing: '0.96px' }}
        >
          Having Issues?
        </span>
        <div
          className="flex items-center gap-2"
          style={{
            border: '1px solid #EAF2D7',
            borderRadius: '75.641px',
            padding: '10px 20px',
            minWidth: '240px',
          }}
        >
          <svg width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="#EAF2D7" strokeWidth="1.5">
            <rect x="1" y="1" width="22" height="16" rx="2" />
            <path d="M1 1l11 9 11-9" />
          </svg>
          <input
            ref={emailInputRef}
            type="email"
            value={issueEmail}
            onChange={(e) => setIssueEmail(e.target.value)}
            placeholder={emailSent ? 'Sent! We\u2019ll be in touch.' : 'Your Email'}
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              background: 'transparent',
              border: 'none',
              color: '#EAF2D7',
              outline: 'none',
              flex: 1,
              fontSize: '13px',
              letterSpacing: '0.96px',
            }}
          />
        </div>
      </form>

      {/* Bottom-right: Social links — 30% larger, Owners Wide */}
      <div
        className="absolute flex items-center"
        style={{
          bottom: 32,
          right: 40,
          gap: '24px',
          transform: 'scale(1.3)',
          transformOrigin: 'bottom right',
        }}
      >
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'Owners Wide', sans-serif",
              color: '#EAF2D7',
              textDecoration: 'none',
              fontSize: '13px',
              letterSpacing: '0.96px',
              transition: `opacity 200ms ${easing}`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Landing Page                                                       */
/* ------------------------------------------------------------------ */

const LandingPage: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [letsTalkOpen, setLetsTalkOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);
  const closeLetsTalk = useCallback(() => setLetsTalkOpen(false), []);

  return (
    <div className="os-root flex flex-col items-center justify-center min-h-screen relative">

      {/* Burger menu — top right */}
      <button
        onClick={() => setMenuOpen(true)}
        className="absolute top-8 right-10"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          padding: '8px',
        }}
        aria-label="Open navigation"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M42.5 33.7998H13.5V31.8662H42.5V33.7998ZM42.5 24.1338H13.5V22.2002H42.5V24.1338Z"
            fill="var(--text-primary)"
          />
        </svg>
      </button>

      {/* Laptop frame background — centred, shrinks away when login opens */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: loginOpen
            ? 'translate(-50%, calc(-50% - 25px)) scale(0)'
            : 'translate(-50%, calc(-50% - 25px)) scale(1)',
          width: 'min(66vw, 66vh)',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: loginOpen ? 0 : 1,
          transition: `transform 400ms ${easing}, opacity 300ms ${easing}`,
        }}
      >
        <img
          src="/assets/laptop-frame.svg"
          alt=""
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Content on top of laptop — shifted up 50px, scaled down 20%, hides when login opens */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          position: 'relative',
          zIndex: 1,
          gap: '10px',
          transform: loginOpen
            ? 'translateY(-70px) scale(0)'
            : 'translateY(-70px) scale(0.8)',
          opacity: loginOpen ? 0 : 1,
          transition: `transform 400ms ${easing}, opacity 300ms ${easing}`,
        }}
      >
        {/* SCRIB3 Logo SVG */}
        <LogoScrib3
          height="clamp(28px, 4vw, 50px)"
          color="var(--text-primary)"
        />

        {/* OPERATING SYSTEM subtitle */}
        <p
          className="text-body"
          style={{ opacity: 0.7, margin: 0 }}
        >
          OPERATING SYSTEM
        </p>

        {/* ENTER button — offwhite default, dusty blue on hover */}
        <button
          onClick={() => setLoginOpen(true)}
          className="rounded-pill text-body-sml uppercase font-owners"
          style={{
            border: '1px solid var(--border-default)',
            padding: '6px 48px',
            color: 'var(--text-primary)',
            background: '#EAF2D7',
            cursor: 'pointer',
            transition: `background 200ms ${easing}, color 200ms ${easing}, border-color 200ms ${easing}`,
            marginTop: '0px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#6E93C3';
            e.currentTarget.style.borderColor = '#6E93C3';
            e.currentTarget.style.color = '#EAF2D7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#EAF2D7';
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          ENTER
        </button>
      </div>

      {/* Login dialog — expands from center */}
      <LoginDialog isOpen={loginOpen} onClose={closeLogin} />

      {/* Nav overlay */}
      <LandingNavOverlay isOpen={menuOpen} onClose={closeMenu} onLetsTalk={() => setLetsTalkOpen(true)} />

      {/* Let's Talk dialog */}
      <LetsTalkDialog isOpen={letsTalkOpen} onClose={closeLetsTalk} />
    </div>
  );
};

export default LandingPage;
