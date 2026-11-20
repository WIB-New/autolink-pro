import useApiData from './useApiData';
import { siteAPI } from '../services/api';

/**
 * Taux de commission plateforme configuré (endpoint public site-config).
 * Pour les libellés sur des montants réels (réservations, agrégats),
 * préférer le taux effectif = commission_amount / subtotal.
 */
export default function useCommissionRate(fallback = 0.15) {
  const { data } = useApiData(() => siteAPI.config().then((r) => r.data), []);
  const rate = Number(data?.commission_rate);
  return Number.isFinite(rate) && rate > 0 ? rate : fallback;
}
