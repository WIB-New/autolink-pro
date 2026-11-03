import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const GSI_SRC = 'https://accounts.google.com/gsi/client';

// Logo Google officiel (SVG multicolore)
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 40.4 44 35 44 24c0-1.3-.1-2.7-.4-3.9z"/>
  </svg>
);

let gsiPromise = null;
const loadGsi = () => {
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = GSI_SRC; s.async = true; s.defer = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return gsiPromise;
};

/* Bouton officiel « Continuer avec Google » — Google Identity Services.
   Le jeton ID retourné par Google est envoyé au backend (/users/google/)
   qui le vérifie puis émet le JWT de session. */
export default function GoogleAuthButton({ label = 'Continuer avec Google' }) {
  const { googleLogin, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const btnRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!CLIENT_ID || !btnRef.current) return;
    let cancelled = false;
    loadGsi().then(() => {
      if (cancelled || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: async (resp) => {
          setBusy(true); setError('');
          const res = await googleLogin({ credential: resp.credential });
          setBusy(false);
          if (res.success) navigate(next || getDashboardPath(res.user.role));
          else setError(res.error || 'Connexion Google impossible.');
        },
      });
      window.google.accounts.id.renderButton(btnRef.current, {
        theme: 'outline', size: 'large', shape: 'rectangular',
        text: 'continue_with', locale: 'fr', width: 320,
      });
    }).catch(() => setError('Impossible de charger Google Sign-In.'));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) {
    return (
      <button type="button" disabled title="Configurer REACT_APP_GOOGLE_CLIENT_ID"
        className="w-full flex items-center justify-center gap-3 border-2 border-slate-200 rounded-xl py-3 font-semibold text-slate-400 cursor-not-allowed">
        <GoogleIcon /> {label}
      </button>
    );
  }

  return (
    <div className="w-full">
      {busy ? (
        <div className="w-full flex items-center justify-center gap-2 border-2 border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-500">
          <Loader size={16} className="animate-spin text-teal-600" /> Connexion Google…
        </div>
      ) : (
        <div ref={btnRef} className="w-full flex justify-center [&>div]:!w-full" />
      )}
      {error && <p className="text-xs text-red-600 text-center mt-2">{error}</p>}
    </div>
  );
}
