import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'autolink_favorites';
const read = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
};

/** Favoris stockés localement (données d'exemple — pas d'appel backend). */
export default function useFavorites() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ids, setIds] = useState(read);

  useEffect(() => {
    const sync = (e) => { if (e.key === STORAGE_KEY) setIds(read()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const toggle = useCallback((id) => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    setIds((list) => {
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [isAuthenticated, navigate, location]);

  return { ids, toggle, enabled: true };
}
