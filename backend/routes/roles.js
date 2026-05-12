const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all roles
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select(`
        role_id,
        role_name,
        description,
        role_permissions(
          permissions(permission_name)
        )
      `)
      .order('role_name');

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get role by ID
router.get('/:roleId', async (req, res) => {
  try {
    const { roleId } = req.params;

    const { data, error } = await supabase
      .from('roles')
      .select(`
        role_id,
        role_name,
        description,
        role_permissions(
          permissions(permission_name)
        )
      `)
      .eq('role_id', roleId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

