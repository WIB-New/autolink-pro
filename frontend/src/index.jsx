import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/inter';
import './index.css';
import './i18n';
import App from './App';
import iconFontUrl from '@fontsource/material-symbols-outlined/files/material-symbols-outlined-latin-400-normal.woff2';

const iconFontPreload = document.createElement('link');
iconFontPreload.rel = 'preload';
iconFontPreload.as = 'font';
iconFontPreload.type = 'font/woff2';
iconFontPreload.crossOrigin = 'anonymous';
iconFontPreload.href = iconFontUrl;
document.head.appendChild(iconFontPreload);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
