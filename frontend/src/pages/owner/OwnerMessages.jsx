import React from 'react';
import { OwnerLayout } from '../../components/ownerdash';
import MessagingUI from '../../components/MessagingUI';

/* Messagerie propriétaire — conversations réelles (clients, chauffeurs, support). */
export default function OwnerMessages() {
  return (
    <OwnerLayout>
      <div className="h-full">
        <MessagingUI basePath="/owner/messages" fillHeight />
      </div>
    </OwnerLayout>
  );
}
