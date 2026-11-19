import React from 'react';
import AdminLayout from '../../components/admindash/AdminLayout';
import InspectionManager from '../../components/inspections/InspectionManager';

export default function VehicleInspection() {
  return (
    <AdminLayout title="Inspections et Audits Techniques" subtitle="Checklists hub & homologation">
      <InspectionManager />
    </AdminLayout>
  );
}
