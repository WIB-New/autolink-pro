/* Commission AutoLink — doit rester alignée sur COMMISSION_RATE du backend.
   Les montants réels d'une réservation (commission_amount, owner_amount) viennent
   toujours de l'API ; ces constantes ne servent qu'aux estimations et libellés. */
export const COMMISSION_RATE = 0.15;
export const OWNER_SHARE = 1 - COMMISSION_RATE;
export const COMMISSION_LABEL = `${Math.round(COMMISSION_RATE * 100)} %`;

/* Part nette propriétaire d'une réservation — montant calculé par le backend. */
export const ownerNet = (b) => Number(b?.owner_amount ?? Number(b?.subtotal || 0) * OWNER_SHARE);
