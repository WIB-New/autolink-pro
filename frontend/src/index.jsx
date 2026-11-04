import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import './index.css';
import './i18n';
import App from './App';

if (localStorage.getItem('autolink_theme') === 'dark') document.documentElement.classList.add('dark');

// Rendu identique à 100 % de zoom sur tout écran paysage : on met à l'échelle
// la page en fonction de la largeur réelle du viewport (référence 1600px).
const applyViewportScale = () => {
  const { innerWidth: w, innerHeight: h } = window;
  const scale = w >= 1024 && w > h ? Math.min(1, w / 1600) : 1;
  // Ne poser zoom qu'en mode réduit : un zoom:1 sur <html> casse le
  // viewport mobile (Chrome affiche la page en largeur fixe -> scroll horizontal)
  document.documentElement.style.zoom = scale < 1 ? String(scale) : '';
  document.documentElement.style.setProperty('--vz', String(scale));
};
applyViewportScale();
window.addEventListener('resize', applyViewportScale);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
