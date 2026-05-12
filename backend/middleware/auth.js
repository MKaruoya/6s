const { supabase } = require('../config/supabase');

// Middleware to check if user has permission
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user's role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role_id, location_id')
        .eq('user_id', userId)
        .single();

      if (userError) throw userError;

      // Get role's permissions
      const { data: permissions, error: permError } = await supabase
        .from('role_permissions')
        .select('permissions(permission_name)')
        .eq('role_id', userData.role_id);

      if (permError) throw permError;

      const permissionNames = permissions.map(p => p.permissions.permission_name);

      if (!permissionNames.includes(requiredPermission)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Attach user info to request
      req.user = {
        userId,
        roleId: userData.role_id,
        locationId: userData.location_id,
        permissions: permissionNames
      };

      next();
    } catch (err) {
      console.error('Auth error:', err);
      res.status(500).json({ error: err.message });
    }
  };
};

module.exports = { checkPermission };
