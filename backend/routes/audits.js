const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auditService = require('../services/auditService');
const calculations = require('../utils/calculations');

// CREATE AUDIT
router.post('/', async (req, res) => {
  try {
    console.log('\n🔴 ===== CREATE AUDIT REQUEST =====');
    console.log('Body keys:', Object.keys(req.body));
    console.log('team_name:', req.body.team_name);
    console.log('location_id:', req.body.location_id);
    
    // ALWAYS look up location_id from team_name, ignore any location_id sent
    if (req.body.team_name) {
      console.log(`\n🔍 LOOKING UP location for team_name: "${req.body.team_name}"`);
      
      const locationResult = await pool.query(
        'SELECT location_id, location_name FROM locations WHERE location_name = $1',
        [req.body.team_name]
      );
      
      console.log(`Query returned ${locationResult.rows.length} rows`);
      
      if (locationResult.rows.length > 0) {
        req.body.location_id = locationResult.rows[0].location_id;
        console.log(`✅ FOUND location_id: ${req.body.location_id}`);
      } else {
        console.log(`❌ Location NOT found for: "${req.body.team_name}"`);
        
        // Show all locations
        const all = await pool.query('SELECT location_name FROM locations ORDER BY location_name');
        console.log(`Available locations (${all.rows.length}):`, all.rows.map(r => r.location_name));
        
        return res.status(400).json({ 
          error: `Location "${req.body.team_name}" not found in database`,
          availableLocations: all.rows.map(r => r.location_name)
        });
      }
    } else {
      console.log('❌ NO team_name provided!');
      return res.status(400).json({ error: 'team_name is required' });
    }

    console.log('\n📝 Calling createAudit with location_id:', req.body.location_id);
    const result = await auditService.createAudit(req.body);

    if (!result.success) {
      console.log('❌ createAudit failed:', result.error);
      return res.status(400).json({ error: result.error });
    }

    console.log('✅ Audit created successfully:', result.data.audit_id);
    res.status(201).json(result.data);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET ALL AUDITS
router.get('/', async (req, res) => {
  try {
    const result = await auditService.getAudits(req.query);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ data: result.data, total: result.count });

  } catch (error) {
    console.error('Get audits error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET SINGLE AUDIT
router.get('/:auditId', async (req, res) => {
  try {
    const result = await auditService.getAuditById(req.params.auditId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result.data);

  } catch (error) {
    console.error('Get audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// SUBMIT AUDIT RESPONSES
router.post('/:auditId/responses', async (req, res) => {
  try {
    const result = await auditService.insertAuditResponses(
      req.params.auditId,
      req.body.responses
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ message: 'Responses saved', count: result.data.length });

  } catch (error) {
    console.error('Insert responses error:', error);
    res.status(500).json({ error: error.message });
  }
});

// CALCULATE AND SAVE AUDIT SCORE
router.post('/:auditId/calculate', async (req, res) => {
  try {
    const auditData = req.body;

    const result = calculations.calculateCompleteAuditScore(auditData);
    
    const saveResult = await auditService.saveAuditCalculations(
      req.params.auditId,
      result
    );
    
    if (!saveResult.success) {
      return res.status(400).json({ error: saveResult.error });
    }
    
    res.json(result);

  } catch (error) {
    console.error('Calculate audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// SUBMIT AUDIT
router.post('/:auditId/submit', async (req, res) => {
  try {
    const result = await auditService.submitAudit(
      req.params.auditId,
      req.body.userId
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.data);

  } catch (error) {
    console.error('Submit audit error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET TRENDS
router.get('/trends/:locationId', async (req, res) => {
  try {
    const result = await auditService.getAuditTrends(
      req.params.locationId,
      req.query.auditTypeId,
      req.query.weeks || 12
    );

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result.data);

  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
