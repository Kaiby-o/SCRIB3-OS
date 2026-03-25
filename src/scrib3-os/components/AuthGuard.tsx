import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';
import type { UserRole } from '../config/dashboardConfig';

/** Blocks unauthenticated users — redirects to /login */
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, initialised, init } = useAuthStore();

  useEffect(() => { init(); }, [init]);

  if (!initialised || loading) {
    return (
      <div className="os-root flex items-center justify-center">
        <span className="text-body-sml" style={{ opacity: 0.5 }}>LOADING...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return <>{children}</>;
};

/** Blocks users without the required role(s) */
export const RoleGuard: React.FC<{
  allowed: UserRole[];
  children: React.ReactNode;
}> = ({ allowed, children }) => {
  const { role } = useAuthStore();

  if (!role || !allowed.includes(role)) {
    return (
      <div className="os-root flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-display-dash" style={{ marginBottom: '16px' }}>ACCESS DENIED</h1>
          <p className="text-body-sml" style={{ opacity: 0.6 }}>
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
