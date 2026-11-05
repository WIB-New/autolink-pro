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

/* Bouton « Continuer avec Google » stylisé maison.
   Le clic déclenche google.accounts.id.prompt() (même flux credential que
   le bouton officiel). Si le prompt est bloqué (cooldown après refus),
   on bascule sur le bouton officiel Google en secours. */
export default function GoogleAuthButton({ label = 'Continuer avec Google' }) {
  const { googleLogin, getDashboardPath } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next');
  const btnRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [official, setOfficial] = useState(false); // fallback bouton Google

  useEffect(() => {
    if (!CLIENT_ID) return;
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
      setReady(true);
    }).catch(() => setError('Impossible de charger Google Sign-In.'));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rendu du bouton officiel en cas de besoin (prompt bloqué par Google)
  useEffect(() => {
    if (!official || !window.google || !btnRef.current) return;
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'outline', size: 'large', shape: 'rectangular',
      text: 'continue_with', locale: 'fr', width: 550,
    });
  }, [official]);

  const handleClick = () => {
    if (!ready || !window.google || busy) return;
    setError('');
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setOfficial(true); // prompt refusé → bouton officiel en secours
      }
    });
  };

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
        <div className="w-full flex items-center justify-center gap-2 bg-white border-2 border-slate-200 rounded-xl py-3.5 text-sm font-bold text-slate-500 shadow-sm">
          <Loader size={16} className="animate-spin text-teal-600" /> Connexion Google…
        </div>
      ) : official ? (
        <div ref={btnRef} className="w-full flex justify-center [&>div]:!w-full" />
      ) : (
        <button type="button" onClick={handleClick} disabled={!ready}
          className="group w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 hover:border-slate-300 rounded-xl py-3.5 px-5 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.985] disabled:opacity-60 disabled:cursor-not-allowed">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white ring-1 ring-slate-200 group-hover:ring-slate-300 transition-all">
            <GoogleIcon />
          </span>
          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
            {ready ? label : 'Chargement…'}
          </span>
        </button>
      )}
      {error && <p className="text-xs text-red-600 text-center mt-2">{error}</p>}
    </div>
  );
}
