import axios from 'axios';

// Replace with your machine's IP address if testing on a physical device
const API_BASE_URL = 'http://localhost:8000/api/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
