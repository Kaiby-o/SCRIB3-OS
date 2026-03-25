import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, signIn, loading, init } = useAuthStore();

  useEffect(() => { init(); }, [init]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setError(msg);
    }
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--border-default)',
    borderRadius: '40px',
    padding: '14px 24px',
    background: 'transparent',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    fontFamily: "'Owners Wide', sans-serif",
  };

  return (
    <div className="os-root flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full"
        style={{ maxWidth: '380px', padding: '40px', gap: '20px' }}
      >
        {/* Logo */}
        <span
          style={{
            fontFamily: "'Kaio', sans-serif",
            fontWeight: 900,
            fontSize: '28px',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          SCRIB3
        </span>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        {/* Error */}
        {error && (
          <p
            style={{
              color: '#D7ABC5',
              textAlign: 'center',
              fontFamily: "'Owners Wide', sans-serif",
              fontSize: '14px',
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#000000',
            color: '#EAF2D7',
            padding: '14px 24px',
            border: 'none',
            borderRadius: '75.641px',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.6 : 1,
            width: '100%',
            fontFamily: "'Owners Wide', sans-serif",
            fontSize: '16px',
            letterSpacing: '0.96px',
            textTransform: 'uppercase',
            transition: 'opacity 200ms cubic-bezier(0.22, 0.61, 0.36, 1)',
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = loading ? '0.6' : '1'; }}
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
