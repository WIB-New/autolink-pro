import React from 'react';
import DesignShell from '../../design/DesignShell';
import InspectionManager from '../../components/inspections/InspectionManager';

export default function ControllerInspections() {
  return (
    <DesignShell role="controller">
      <div className="p-4 sm:p-6">
        <InspectionManager />
      </div>
    </DesignShell>
  );
}
