import React from 'react';
import FloatingWidget from './FloatingWidget';

/* Persistent layout wrapper for all authenticated OS routes */
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <FloatingWidget />
  </>
);

export default AuthenticatedLayout;
