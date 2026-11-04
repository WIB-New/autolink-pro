import React from 'react';
import C8Notifications from './c8_notifications';

// Page Notifications chauffeur : même présentation que l'espace client (tableau,
// recherche, filtre catégorie, actions), libellés adaptés via role="driver".
export default function DriverNotifications() {
  return <C8Notifications role="driver" />;
}
