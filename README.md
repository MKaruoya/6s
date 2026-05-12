# 6S Audit Management System (C6S)

A comprehensive digital audit system for CAPWELL Industries' 6S (Kaizen) program.

## Features

✅ **Digital Audit Forms** - Warehouse, Shopfloor, Laboratory, Internal audits
✅ **Real-time Dashboard** - Performance metrics, trends, 6S breakdown
✅ **Professional Reports** - Executive reports with charts and analytics
✅ **Admin Panel** - User, location, and system management
✅ **Data Visualization** - Radar charts, line charts, bar charts, pie charts
✅ **Export Options** - PDF and Excel reports

## Tech Stack

- **Frontend:** React 18, Recharts, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **Export:** jsPDF, XLSX, html2canvas

## Project Structure
├── frontend/ │ ├── src/ │ │ ├── components/ │ │ │ ├── forms/ │ │ │ │ ├── WarehouseAuditForm.jsx │ │ │ │ ├── ShopfloorAuditForm.jsx │ │ │ │ ├── LaboratoryAuditForm.jsx │ │ │ │ └── InternalAuditForm.jsx │ │ │ ├── Dashboard.jsx │ │ │ ├── Reports.jsx │ │ │ └── AdminPanel.jsx │ │ ├── services/ │ │ │ ├── auditService.js │ │ │ └── supabaseClient.js │ │ ├── data/ │ │ │ ├── auditCheckpoints.js │ │ │ └── locations.js │ │ └── App.js │ └── package.json ├── backend/ │ ├── src/ │ │ ├── routes/ │ │ ├── controllers/ │ │ ├── services/ │ │ └── server.js │ └── package.json └── README.md


## Installation

### Frontend

```bash
cd frontend
npm install
npm start
Backend

Loading
cd backend
npm install
npm run dev
Environment Variables
Create .env files in both frontend and backend:

Frontend (.env):

REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
Backend (.env):

SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=5000
Features Overview
1. Audit Forms
Real-time data capture
Automatic scoring
6S category breakdown
Evidence upload support
Offline capability
2. Dashboard
Real-time performance metrics
6S radar charts
Location performance comparison
Trend analysis
Status distribution
3. Reports
Audit Report - Individual audit details with charts
Location Performance - Comprehensive location analysis
6S Category Analysis - Performance by category
Trend Analysis - Performance over time
Export to PDF and Excel
4. Admin Panel
User management
Location management
System settings
Data management
Usage
Create Audit - Navigate to Forms and select audit type
Fill Form - Complete all sections with checkpoint scores
Submit - Review and submit audit
View Dashboard - See real-time performance metrics
Generate Reports - Create professional reports for analysis
Database Schema
Key tables:

audits - Audit records
users - User accounts
locations - Audit locations
audit_types - Audit type definitions
API Endpoints
GET /api/audits - Get all audits
POST /api/audits - Create new audit
GET /api/audits/:id - Get specific audit
GET /api/users - Get all users
POST /api/users - Create new user
GET /api/locations - Get all locations
Contributing
Create a feature branch (git checkout -b feature/AmazingFeature)
Commit changes (git commit -m 'Add AmazingFeature')
Push to branch (git push origin feature/AmazingFeature)
Open a Pull Request
License
This project is proprietary to CAPWELL Industries Limited.

Contact
For questions or support, contact the development team.

Built with ❤️ by Mercy Karuoya
