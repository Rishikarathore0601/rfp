import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy handles this to localhost:5000
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
