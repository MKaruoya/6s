const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auditService = require('../services/auditService');
const calculations = require('../utils/calculations');

// CREATE AUDIT
router.post('/', async (req, res) => {
  try {
    // If team_name is provided, look up the location_id from database
    if (req.body.team_name && !req.body.location_id) {
      console.log(`Looking up location for: ${req.body.team_name}`);
      
      const locationResult = await pool.query(
        'SELECT location_id FROM locations WHERE location_name = $1 LIMIT 1',
        [req.body.team_name]
      );
      
      if (locationResult.rows.length === 0) {
        console.error(`Location not found: ${req.body.team_name}`);
        return res.status(400).json({ error: `Location not found: ${req.body.team_name}` });
      }
      
      req.body.location_id = locationResult.rows[0].location_id;
      console.log(`Found location_id: ${req.body.location_id}`);
    }

    const result = await auditService.createAudit(req.body);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.status(201).json(result.data);

  } catch (error) {
    console.error('Create audit error:', error);
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
