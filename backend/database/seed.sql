-- CAPWELL 6S AUDIT MANAGEMENT SYSTEM - SEED DATA

-- Get org_id (assuming it was just created)
DO $$
DECLARE
  v_org_id UUID;
  v_location_id UUID;
  v_audit_type_id UUID;
  v_section_id UUID;
  v_user_id UUID;
BEGIN

-- Get the Capwell org
SELECT org_id INTO v_org_id FROM organizations WHERE org_code = 'CIL' LIMIT 1;

-- Insert Locations
INSERT INTO locations (org_id, location_name, location_type, plant_name, address, manager_name, manager_email)
VALUES 
  (v_org_id, 'Warehouse - Raw Materials', 'warehouse', 'Main Plant', 'Thika, Kenya', 'John Mwangi', 'john@capwell.co.ke'),
  (v_org_id, 'Warehouse - Finished Goods', 'warehouse', 'Main Plant', 'Thika, Kenya', 'Jane Kipchoge', 'jane@capwell.co.ke'),
  (v_org_id, 'Shopfloor - Beverage', 'shopfloor', 'Beverage Plant', 'Thika, Kenya', 'Peter Omondi', 'peter@capwell.co.ke'),
  (v_org_id, 'Shopfloor - Maize Mills', 'shopfloor', 'Maize Mills', 'Thika, Kenya', 'Mary Kariuki', 'mary@capwell.co.ke'),
  (v_org_id, 'Laboratory', 'laboratory', 'QA Lab', 'Thika, Kenya', 'Dr. Samuel Kiplagat', 'samuel@capwell.co.ke')
ON CONFLICT DO NOTHING;

-- Insert Audit Types
INSERT INTO audit_types (org_id, audit_type_name, audit_code, max_score, description)
VALUES 
  (v_org_id, 'Warehouse 6S Audit', 'CIL/OPEX/6S/WH/001', 100, 'Warehouse 6S audit for raw materials and finished goods'),
  (v_org_id, 'Shopfloor 6S Audit', 'CIL/OPEX/6S/SF/002', 120, 'Shopfloor 6S audit for production areas'),
  (v_org_id, 'Laboratory 6S Audit', 'CIL/OPEX/6S/LAB/003', 100, 'Laboratory 6S audit for QA operations'),
  (v_org_id, 'Internal 6S Audit 2024', 'CIL/OPEX/6S/INT/004', 150, 'Weekly internal 6S audit tracking')
ON CONFLICT DO NOTHING;

-- Insert Users (Auditors)
INSERT INTO users (org_id, email, name, role, is_active)
VALUES 
  (v_org_id, 'mercy@capwell.co.ke', 'Mercy Karuoya', 'admin', TRUE),
  (v_org_id, 'auditor1@capwell.co.ke', 'Auditor One', 'auditor', TRUE),
  (v_org_id, 'auditor2@capwell.co.ke', 'Auditor Two', 'auditor', TRUE),
  (v_org_id, 'manager@capwell.co.ke', 'Kaizen Manager', 'manager', TRUE)
ON CONFLICT (email) DO NOTHING;

END $$;
