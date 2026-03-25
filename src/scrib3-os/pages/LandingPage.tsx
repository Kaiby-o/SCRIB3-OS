import React, { useState, useEffect, useCallback, useRef } from 'react';
import LogoScrib3 from '../components/LogoScrib3';
import LoginDialog from '../components/LoginDialog';
import { supabase } from '../lib/supabase';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const LANDING_LINKS = [
  { label: 'HOME', href: 'https://scrib3.co/' },
  { label: 'WORK', href: 'https://scrib3.co/' },
  { label: 'OUR TEAM', href: 'https://scrib3.co/' },
  { label: "LET\u2019S TALK", href: 'https://scrib3.co/' },
];

const SOCIAL_LINKS = [
  { label: 'Linkedin', href: 'https://scrib3.co/' },
  { label: 'Twitter (X)', href: 'https://scrib3.co/' },
  { label: 'Substack', href: 'https://scrib3.co/' },
];

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

/* ------------------------------------------------------------------ */
/*  Having Issues? email submission                                    */
/* ------------------------------------------------------------------ */

async function submitSupportEmail(email: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('support_requests')
      .insert({ email, status: 'pending' });

    if (error) {
      console.error('Support request insert failed:', error);
      /* Fallback: open mailto link */
      window.location.href = `mailto:ben@scrib3.co?subject=SCRIB3 OS Support Request&body=User email: ${encodeURIComponent(email)} needs assistance with SCRIB3 OS.`;
      return true;
    }
    return true;
  } catch {
    /* Fallback: open mailto link */
    window.location.href = `mailto:ben@scrib3.co?subject=SCRIB3 OS Support Request&body=User email: ${encodeURIComponent(email)} needs assistance with SCRIB3 OS.`;
    return true;
  }
}

/* ------------------------------------------------------------------ */
/*  Landing Nav Overlay                                                */
/* ------------------------------------------------------------------ */

const LandingNavOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
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
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

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

        {/* ENTER button — hover = off-white bg (#EAF2D7) */}
        <button
          onClick={() => setLoginOpen(true)}
          className="rounded-pill text-body-sml uppercase font-owners"
          style={{
            border: '1px solid var(--border-default)',
            padding: '6px 48px',
            color: 'var(--text-primary)',
            background: 'transparent',
            cursor: 'pointer',
            transition: `background 200ms ${easing}, color 200ms ${easing}`,
            marginTop: '0px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#EAF2D7';
            e.currentTarget.style.color = '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
        >
          ENTER
        </button>
      </div>

      {/* Login dialog — expands from center */}
      <LoginDialog isOpen={loginOpen} onClose={closeLogin} />

      {/* Nav overlay */}
      <LandingNavOverlay isOpen={menuOpen} onClose={closeMenu} />
    </div>
  );
};

export default LandingPage;
