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
        <h1>New Audit</h1>
        <p>Select audit type to begin</p>
      </div>

      <div className="audit-types-grid">
        <button
          className="audit-type-card"
          onClick={() => setSelectedAuditType('warehouse')}
        >
          <div className="card-icon">📦</div>
          <h3>Warehouse</h3>
          <p>CIL/OPEX/6S/REC/004</p>
          <span className="card-badge">100 pts</span>
        </button>

        <button
          className="audit-type-card"
          onClick={() => setSelectedAuditType('shopfloor')}
        >
          <div className="card-icon">🏭</div>
          <h3>Shopfloor</h3>
          <p>CIL/OPEX/6S/REC/002</p>
          <span className="card-badge">120 pts</span>
        </button>

        <button
          className="audit-type-card"
          onClick={() => setSelectedAuditType('laboratory')}
        >
          <div className="card-icon">🧪</div>
          <h3>Laboratory</h3>
          <p>CIL/OPEX/6S/REC/003</p>
          <span className="card-badge">100 pts</span>
        </button>

        <button
          className="audit-type-card"
          onClick={() => setSelectedAuditType('internal')}
        >
          <div className="card-icon">📊</div>
          <h3>Internal</h3>
          <p>CIL/OPEX/KAIZEN/REC/001</p>
          <span className="card-badge">Weekly</span>
        </button>
      </div>
    </div>
  );
};

export default AuditForm;
