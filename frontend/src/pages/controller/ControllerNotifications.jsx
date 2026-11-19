import React from 'react';
import DesignShell from '../../design/DesignShell';
import NotificationsUI from '../../components/NotificationsUI';

export default function ControllerNotifications() {
  return (
    <DesignShell role="controller">
      <NotificationsUI role="controller" />
    </DesignShell>
  );
}
