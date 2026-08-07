import axios from 'axios';

// Configure Axios with the base URL of our backend API
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1',

  // baseURL: 'https://amul-account-backend-production.up.railway.app/api/v1',


  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically add the JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
