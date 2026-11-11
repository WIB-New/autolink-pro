import React from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import MessagingUI from '../../components/MessagingUI';

/* Messagerie admin — voit toutes les conversations de la plateforme
   (scope=all) et peut répondre aux tickets support. */
export default function AdminMessages() {
  return (
    <AdminLayout fluid>
      <MessagingUI scope="all" basePath="/admin/messages" isAdmin hideTitle fillHeight />
    </AdminLayout>
  );
}
