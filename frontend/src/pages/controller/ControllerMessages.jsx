import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import MessagingUI from '../../components/MessagingUI';

/* Messagerie contrôleur — conversations réelles (clients, propriétaires,
   support), même UI que les autres espaces, dans l'habillage contrôleur. */
export default function ControllerMessages() {
  return (
    <DashboardLayout title="Messagerie" fluid>
      <MessagingUI basePath="/controller/messages" hideTitle fillHeight />
    </DashboardLayout>
  );
}
