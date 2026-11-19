import React from 'react';
import DesignShell from '../../design/DesignShell';
import MessagingUI from '../../components/MessagingUI';

/* Messagerie contrôleur — même shell et même UI WhatsApp que l'espace client. */
export default function ControllerMessages() {
  return (
    <DesignShell role="controller">
      <MessagingUI basePath="/controller/messages" />
    </DesignShell>
  );
}
