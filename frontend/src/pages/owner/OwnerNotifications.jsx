import React from 'react';
import OwnerLayout from '../../components/ownerdash/OwnerLayout';
import NotificationsUI from '../../components/NotificationsUI';

export default function OwnerNotifications() {
  return (
    <OwnerLayout>
      <NotificationsUI role="owner" />
    </OwnerLayout>
  );
}
