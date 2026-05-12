const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Get all users
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        user_id,
        email,
        name,
        is_active,
        roles(role_name),
        locations(location_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .select(`
        user_id,
        email,
        name,
        is_active,
        role_id,
        location_id,
        roles(role_name),
        locations(location_name)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { email, name, role_id, location_id, org_id } = req.body;

    if (!email || !name || !role_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        org_id,
        email,
        name,
        role_id,
        location_id,
        is_active: true
      }])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, name, role_id, location_id, is_active } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({
        email,
        name,
        role_id,
        location_id,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    res.json(data[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user permissions
router.get('/:userId/permissions', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role_id')
      .eq('user_id', userId)
      .single();

    if (userError) throw userError;

    // Get role's permissions
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select(`
        permissions(permission_name)
      `)
      .eq('role_id', userData.role_id);

    if (permError) throw permError;

    const permissionNames = permissions.map(p => p.permissions.permission_name);

    res.json({ permissions: permissionNames });
  } catch (err) {
    console.error('Error fetching permissions:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
