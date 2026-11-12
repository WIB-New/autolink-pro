import React from 'react';
import C9ProfilEtParametres from './c9_profil_et_param_tres';

// La page Profil propriétaire réutilise le composant client C9 — données réelles
// (me, documents, KYC, édition de profil) identiques pour tous les rôles.
export default function OwnerProfile() {
  return <C9ProfilEtParametres role="owner" />;
}
