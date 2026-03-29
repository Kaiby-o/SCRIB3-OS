import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import LogoScrib3 from './LogoScrib3';

const easing = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const ICON_BASE = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Icons/';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { signIn, loading, init } = useAuthStore();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { init(); }, [init]);

  // Focus email on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => emailRef.current?.focus(), 400);
    } else {
      // Reset state when closing
      setError('');
      setForgotMode(false);
      setResetSent(false);
    }
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Watch for user becoming authenticated → navigate to dashboard
  const { user } = useAuthStore();
  useEffect(() => {
    if (user && isOpen) {
      navigate('/dashboard');
    }
  }, [user, isOpen, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      // Navigation happens via the useEffect above when user state updates
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Enter your email address first');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setError(error.message);
    } else {
      setResetSent(true);
    }
  };

  /* Shared input styling */
  const inputStyle: React.CSSProperties = {
    fontFamily: "'Owners Wide', sans-serif",
    fontWeight: 400,
    fontSize: '13px',
    letterSpacing: '0.96px',
    background: '#EAF2D7',
    color: '#000000',
    border: 'none',
    borderRadius: '75px',
    padding: '14px 24px',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Owners Wide', sans-serif",
    fontWeight: 400,
    fontSize: '11px',
    letterSpacing: '0.96px',
    color: '#EAF2D7',
    opacity: 0.7,
    marginBottom: '4px',
    textTransform: 'uppercase',
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 55,
        pointerEvents: isOpen ? 'auto' : 'none',
        background: isOpen ? 'rgba(0,0,0,0.4)' : 'transparent',
        transition: `background 300ms ${easing}`,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dialog container — uses the branded shape as background */}
      <div
        style={{
          position: 'relative',
          width: 'min(400px, 92vw)',
          height: 'min(580px, 90vh)',
          transform: isOpen ? 'scale(1)' : 'scale(0.3)',
          opacity: isOpen ? 1 : 0,
          transition: `transform 400ms ${easing}, opacity 300ms ${easing}`,
          transformOrigin: 'center center',
        }}
      >
        {/* Branded SVG shape background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src="/assets/login-shape.svg"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'fill',
              /* No drop-shadow — clean cutout aesthetic */
            }}
          />
        </div>

        {/* Form content overlaid on shape */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: window.innerWidth < 400 ? '32px 24px 24px' : '48px 40px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: window.innerWidth < 400 ? '10px' : '16px',
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {/* Logo */}
          <div style={{ marginBottom: '8px' }}>
            <LogoScrib3 height={32} color="#EAF2D7" />
          </div>

          {/* Greeting */}
          <h2
            style={{
              fontFamily: "'Kaio', sans-serif",
              fontWeight: 800,
              fontSize: '22px',
              color: '#6E93C3',
              textTransform: 'uppercase',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            GM SCRIB3R
          </h2>

          {forgotMode ? (
            /* ── Forgot Password Mode ── */
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ ...labelStyle, fontSize: '12px', opacity: 0.8 }}>
                {resetSent
                  ? 'Check your inbox for a reset link.'
                  : 'Enter your email to receive a password reset link.'}
              </p>
              {!resetSent && (
                <>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      ref={emailRef}
                      type="email"
                      placeholder="Email or phone number"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      fontFamily: "'Owners Wide', sans-serif",
                      fontSize: '14px',
                      letterSpacing: '0.96px',
                      textTransform: 'uppercase',
                      background: '#D7ABC5',
                      color: '#000',
                      border: 'none',
                      borderRadius: '75px',
                      padding: '14px 24px',
                      width: '100%',
                      cursor: 'pointer',
                      transition: `opacity 200ms ${easing}`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Send Reset Link
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => { setForgotMode(false); setResetSent(false); setError(''); }}
                style={{
                  fontFamily: "'Owners Wide', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '0.96px',
                  background: 'none',
                  border: 'none',
                  color: '#EAF2D7',
                  opacity: 0.7,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textAlign: 'center',
                }}
              >
                Back to Sign In
              </button>
            </form>
          ) : (
            /* ── Sign In Mode ── */
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Login field */}
              <div>
                <label style={labelStyle}>Login</label>
                <input
                  ref={emailRef}
                  type="email"
                  placeholder="Email or phone number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Password field */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ ...inputStyle, paddingRight: '48px' }}
                  />
                  {/* Show/Hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <img
                      src={ICON_BASE + (showPassword ? 'Hide.svg' : 'Show.svg')}
                      alt={showPassword ? 'Hide' : 'Show'}
                      style={{ width: 20, height: 20, filter: 'invert(1)' }}
                    />
                  </button>
                </div>
              </div>

              {/* Remember me + Forgot password row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontFamily: "'Owners Wide', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '0.96px',
                    color: '#EAF2D7',
                    opacity: 0.8,
                  }}
                >
                  {/* Toggle switch */}
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    style={{
                      width: '36px',
                      height: '20px',
                      borderRadius: '10px',
                      background: rememberMe ? '#6E93C3' : '#555',
                      position: 'relative',
                      transition: `background 200ms ${easing}`,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: '#EAF2D7',
                        position: 'absolute',
                        top: '2px',
                        left: rememberMe ? '18px' : '2px',
                        transition: `left 200ms ${easing}`,
                      }}
                    />
                  </div>
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setError(''); }}
                  style={{
                    fontFamily: "'Owners Wide', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '0.96px',
                    background: 'none',
                    border: 'none',
                    color: '#EAF2D7',
                    opacity: 0.7,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Error message */}
              {error && (
                <p style={{
                  fontFamily: "'Owners Wide', sans-serif",
                  fontSize: '12px',
                  color: '#D7ABC5',
                  textAlign: 'center',
                  margin: 0,
                }}>
                  {error}
                </p>
              )}

              {/* Sign In button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  fontFamily: "'Owners Wide', sans-serif",
                  fontSize: '14px',
                  letterSpacing: '0.96px',
                  textTransform: 'uppercase',
                  background: '#D7ABC5',
                  color: '#000',
                  border: 'none',
                  borderRadius: '75px',
                  padding: '16px 24px',
                  width: '100%',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: `opacity 200ms ${easing}`,
                  marginTop: '4px',
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = loading ? '0.6' : '1'; }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              {/* Divider */}
              <div style={{
                width: '100%',
                height: '1px',
                background: '#EAF2D7',
                opacity: 0.15,
                margin: '4px 0',
              }} />

              {/* Google sign in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                style={{
                  fontFamily: "'Owners Wide', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '0.96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: '#333',
                  color: '#EAF2D7',
                  border: 'none',
                  borderRadius: '75px',
                  padding: '14px 24px',
                  width: '100%',
                  cursor: 'pointer',
                  transition: `opacity 200ms ${easing}`,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {/* Google "G" logo */}
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Or sign in with Google
              </button>

              {/* Get in Touch link */}
              <p style={{
                fontFamily: "'Owners Wide', sans-serif",
                fontSize: '11px',
                letterSpacing: '0.96px',
                color: '#EAF2D7',
                opacity: 0.6,
                textAlign: 'center',
                marginTop: '8px',
              }}>
                Don't have an account?{' '}
                <a
                  href="https://scrib3.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#D7ABC5',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  Get in Touch
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;
