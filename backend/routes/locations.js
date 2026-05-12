const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all locations
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('location_name');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get location by ID
router.get('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('location_id', locationId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching location:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create location
router.post('/', async (req, res) => {
  try {
    const { org_id, location_name, location_type } = req.body;

    if (!location_name || !location_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('locations')
      .insert([{
        org_id,
        location_name,
        location_type
      }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update location
router.put('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;
    const { location_name, location_type } = req.body;

    const { data, error } = await supabase
      .from('locations')
      .update({
        location_name,
        location_type
      })
      .eq('location_id', locationId)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete location
router.delete('/:locationId', async (req, res) => {
  try {
    const { locationId } = req.params;

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('location_id', locationId);

    if (error) throw error;

    res.json({ message: 'Location deleted successfully' });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
