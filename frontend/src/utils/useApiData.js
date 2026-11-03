import { useEffect, useRef, useState } from 'react';

/**
 * Récupère des données API pour les pages design (données réelles).
 * fetcher : () => Promise<{data}> — retourne { data, loading }.
 */
export default function useApiData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(fetcher);
  ref.current = fetcher;
  useEffect(() => {
    let alive = true;
    setLoading(true);
    ref.current()
      .then((res) => { if (alive) setData(res?.data ?? res); })
      .catch(() => { if (alive) setData(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, loading };
}
