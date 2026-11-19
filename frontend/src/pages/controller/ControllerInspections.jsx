import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import InspectionManager from '../../components/inspections/InspectionManager';

export default function ControllerInspections() {
  return (
    <DashboardLayout title="Inspections et Audits Techniques">
      <InspectionManager />
    </DashboardLayout>
  );
}
