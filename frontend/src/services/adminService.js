import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Users API
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (err) {
    console.error('Error fetching users:', err);
    throw err;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching user:', err);
    throw err;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, userData);
    return response.data;
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
    return response.data;
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (err) {
    console.error('Error deleting user:', err);
    throw err;
  }
};

export const getUserPermissions = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/permissions`);
    return response.data;
  } catch (err) {
    console.error('Error fetching permissions:', err);
    throw err;
  }
};

// Roles API
export const getRoles = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles`);
    return response.data;
  } catch (err) {
    console.error('Error fetching roles:', err);
    throw err;
  }
};

export const getRoleById = async (roleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/roles/${roleId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching role:', err);
    throw err;
  }
};

// Locations API
export const getLocations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations`);
    return response.data;
  } catch (err) {
    console.error('Error fetching locations:', err);
    throw err;
  }
};

export const getLocationById = async (locationId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/locations/${locationId}`);
    return response.data;
  } catch (err) {
    console.error('Error fetching location:', err);
    throw err;
  }
};

export const createLocation = async (locationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/locations`, locationData);
    return response.data;
  } catch (err) {
    console.error('Error creating location:', err);
    throw err;
  }
};

export const updateLocation = async (locationId, locationData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/locations/${locationId}`, locationData);
    return response.data;
  } catch (err) {
    console.error('Error updating location:', err);
    throw err;
  }
};

export const deleteLocation = async (locationId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/locations/${locationId}`);
    return response.data;
  } catch (err) {
    console.error('Error deleting location:', err);
    throw err;
  }
};
