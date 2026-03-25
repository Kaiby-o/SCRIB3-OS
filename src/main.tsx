import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// DEVICE layer styles — disabled to prevent CSS bleed into OS layer
// Re-enable when DEVICE routes are restored with proper scoping
// import './scrib3-device/styles/variables.css';
// import './scrib3-device/styles/crt.css';
// import './scrib3-device/styles/clean.css';
// import './scrib3-device/index.css';
// OS layer styles
import './scrib3-os/styles/os.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
