import React, { useState } from 'react';
import WarehouseAuditForm from './forms/WarehouseAuditForm';
import ShopfloorAuditForm from './forms/ShopfloorAuditForm';
import LaboratoryAuditForm from './forms/LaboratoryAuditForm';
import InternalAuditForm from './forms/InternalAuditForm';
import '../styles/AuditForm.css';

const AuditForm = () => {
  const [selectedAuditType, setSelectedAuditType] = useState(null);

  if (selectedAuditType === 'warehouse') {
    return <WarehouseAuditForm />;
  }

  if (selectedAuditType === 'shopfloor') {
    return <ShopfloorAuditForm />;
  }

  if (selectedAuditType === 'laboratory') {
    return <LaboratoryAuditForm />;
  }

  if (selectedAuditType === 'internal') {
    return <InternalAuditForm />;
  }

  // AUDIT TYPE SELECTION SCREEN
  return (
    <div className="audit-type-selector">
      <div className="selector-header">
        <h1>Select Audit Type</h1>
        <p>Choose the type of 6S audit to conduct</p>
      </div>

      <div className="audit-types-grid">
        <button
          className="audit-type-card"
          onClick={() => setSelectedAuditType('warehouse')}
        >
          <div className="card-icon">📦</div>
          <h3>Warehouse 6S Audit</h3>
          <p>CIL/OPEX/6S/REC/004</p>
          <span className="card-badge">100 points</span>
        </button>

        <button
          className="audit-type-card"
          onClick={() => setSelectedAuditType('shopfloor')}
        >
          <div className="card-icon">🏭</div>
          <h3>Plant/Shopfloor 6S Audit</h3>
          <p>CIL/OPEX/6S/REC/002</p>
          <span className="card-badge">120 points</span>
        </button>

        <button
          className="audit-type-card"
          onClick={() => setSelectedAuditType('laboratory')}
        >
          <div className="card-icon">🧪</div>
          <h3>Laboratory 6S Audit</h3>
          <p>CIL/OPEX/6S/REC/003</p>
          <span className="card-badge">100 points</span>
        </button>

        <button
          className="audit-type-card"
          onClick={() => setSelectedAuditType('internal')}
        >
          <div className="card-icon">📊</div>
          <h3>6S Internal Audit</h3>
          <p>CIL/OPEX/KAIZEN/REC/001</p>
          <span className="card-badge">Weekly Tracking</span>
        </button>
      </div>
    </div>
  );
};

export default AuditForm;
