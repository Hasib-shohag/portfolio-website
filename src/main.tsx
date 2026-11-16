import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
const cleanUrl = () => window.history.replaceState(null, '', window.location.pathname + window.location.search);
const scrollToId = (id: string) => { const el = id ? document.getElementById(id) : null; if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); else window.scrollTo({ top: 0, behavior: 'smooth' }); };
document.addEventListener('click', (event) => { const link = (event.target as Element | null)?.closest('a[href^="#"]'); if (!link) return; event.preventDefault(); scrollToId((link.getAttribute('href') || '').slice(1)); cleanUrl(); });
if (window.location.hash) { const id = decodeURIComponent(window.location.hash.slice(1)); let tries = 0; const timer = window.setInterval(() => { tries += 1; if (document.getElementById(id) || tries > 25) { window.clearInterval(timer); scrollToId(id); cleanUrl(); } }, 200); }
