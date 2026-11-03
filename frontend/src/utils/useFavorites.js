import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vehiclesAPI } from '../services/api';

/** Favoris persistés côté backend (/api/vehicles/favorites/). */
export default function useFavorites() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) { setIds([]); return; }
    vehiclesAPI.favorites()
      .then(({ data }) => setIds((Array.isArray(data) ? data : data.results || []).map((v) => v.id)))
      .catch(() => {});
  }, [isAuthenticated]);

  const toggle = useCallback((id) => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }
    const active = ids.includes(id);
    setIds((list) => (active ? list.filter((item) => item !== id) : [...list, id]));
    const call = active ? vehiclesAPI.removeFavorite(id) : vehiclesAPI.addFavorite(id);
    call.catch(() => {
      setIds((list) => (active ? [...list, id] : list.filter((item) => item !== id)));
    });
  }, [ids, isAuthenticated, navigate, location]);

  return { ids, toggle, enabled: true };
}
