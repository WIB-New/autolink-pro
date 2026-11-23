/* Commission AutoLink — le taux configuré se lit via useCommissionRate()
   (endpoint site-config). Les montants réels d'une réservation
   (commission_amount, owner_amount) viennent toujours de l'API ;
   DEFAULT_* ne servent que de secours quand le champ manque ET que le
   taux configuré n'est pas encore chargé — alignés sur le défaut backend. */
export const DEFAULT_COMMISSION_RATE = 0.50;
export const DEFAULT_OWNER_SHARE = 1 - DEFAULT_COMMISSION_RATE;

/* Part nette propriétaire — montant calculé par le backend en priorité ;
   ownerShare = 1 − taux (configuré ou effectif) pour les réservations
   sans owner_amount. */
export const ownerNet = (b, ownerShare = DEFAULT_OWNER_SHARE) =>
  Number(b?.owner_amount ?? Number(b?.subtotal || 0) * ownerShare);
