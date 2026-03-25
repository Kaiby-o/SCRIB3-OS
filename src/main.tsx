import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// DEVICE layer styles (loaded first — OS overrides where needed)
import './scrib3-device/styles/variables.css';
import './scrib3-device/styles/crt.css';
import './scrib3-device/styles/clean.css';
import './scrib3-device/index.css';
// OS layer styles (loaded last — takes precedence via .os-root)
import './scrib3-os/styles/os.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
