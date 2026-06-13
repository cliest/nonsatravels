import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all trips for current user
export const getMyTrips = async () => {
  try {
    const response = await axios.get(`${API_URL}/trips`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single trip
export const getTripById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/trips/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get trip by share token (public)
export const getTripByToken = async (shareToken) => {
  try {
    const response = await axios.get(`${API_URL}/trips/shared/${shareToken}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create new trip
export const createTrip = async (tripData) => {
  try {
    const response = await axios.post(`${API_URL}/trips`, tripData, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update trip
export const updateTrip = async (id, tripData) => {
  try {
    const response = await axios.put(`${API_URL}/trips/${id}`, tripData, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete trip
export const deleteTrip = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/trips/${id}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Generate share link
export const generateShareLink = async (id) => {
  try {
    const response = await axios.post(`${API_URL}/trips/${id}/share`, {}, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add destination to trip
export const addDestination = async (id, destinationData) => {
  try {
    const response = await axios.post(`${API_URL}/trips/${id}/destinations`, destinationData, {
      headers: getAuthHeaders(),
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add activity to destination
export const addActivity = async (tripId, destinationId, activityData) => {
  try {
    const response = await axios.post(
      `${API_URL}/trips/${tripId}/destinations/${destinationId}/activities`,
      activityData,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
