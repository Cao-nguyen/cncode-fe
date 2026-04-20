
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});


axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            
            localStorage.removeItem('token');
            localStorage.removeItem('user_safe');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;