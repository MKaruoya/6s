const express = require('express');
const router = express.Router();
const auditService = require('../services/auditService');
const calculations = require('../utils/calculations');

// CREATE AUDIT
router.post('/', async (req, res) => {
  try {
    const result = await auditService.createAudit(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json(result.data);
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
