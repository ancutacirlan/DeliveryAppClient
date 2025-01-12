import axios from 'axios';

//const API_URL = 'http://localhost:8080/api';
const API_URL = 'https://deliveryappserver-production.up.railway.app/api';



const getAuthHeaders = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const { email, password } = JSON.parse(user);
    return {
      headers: {
        'Authorization': 'Basic ' + btoa(`${email}:${password}`), 
      },
    };
  }
  return {};
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signin`, { email, password });
    localStorage.setItem('user', JSON.stringify({ email, password })); 
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
};

export const register = async (name, email, password, address) => {
  try {
    const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password, address });
    return response.data;
  } catch (error) {
    throw new Error('Registration failed');
  }
};

export const fetchRestaurants = async () => {
  try {
    const response = await axios.get(`${API_URL}/menu/grouping/by/restaurant`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error('Error loading restaurants');
  }
};

export const placeOrder = async (orderPayload) => {
  try {
    const response = await axios.post(`${API_URL}/order`,
       orderPayload, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error('Error placing the order');
  }
};

export const fetchSubscriptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/subscription`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error('Error loading subscriptions');
  }
};

export const fetchMySubscriptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/subscription`, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error('Error loading subscriptions');
  }
};

export const renewSubscription = async (renewalPayload) => {
  try {
    const response = await axios.post(`${API_URL}/user/subscription`, renewalPayload, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw new Error('Could not renew subscription');
  }
};

export const calculateTotalPrice = async (orderItems) => {
  try {
    const response = await axios.post(`${API_URL}/order/calculate/total/price`, {orderItems}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error calculating total price:', error);
    throw error;
  }
};

export const deleteSubscription = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/user/subscription/id/${id}`, getAuthHeaders());
    return response.data;
  } catch (err) {
    throw new Error('Could not delete subscription');
  }
};

export const setSubscriptionToExpire = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/user/subscription/set/to/expire/${id}`, null, getAuthHeaders());
    return response.data;
  } catch (err) {
    throw new Error('Could not set subscription to expire');
  }
};
