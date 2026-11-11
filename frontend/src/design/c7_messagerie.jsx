import React from 'react';
import DesignShell from './DesignShell';
import MessagingUI from '../components/MessagingUI';

export default function C7({ role = 'client' }) {
  return (
    <DesignShell role={role}>
      <MessagingUI basePath="/messages" />
    </DesignShell>
  );
}
