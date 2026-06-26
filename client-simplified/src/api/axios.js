import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // CRITICAL — sends httpOnly cookie on every request
});

export default api;
