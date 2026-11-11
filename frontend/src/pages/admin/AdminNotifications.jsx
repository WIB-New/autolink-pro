import React from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import NotificationsUI from '../../components/NotificationsUI';

export default function AdminNotifications() {
  return (
    <AdminLayout>
      <NotificationsUI role="admin" />
    </AdminLayout>
  );
}
