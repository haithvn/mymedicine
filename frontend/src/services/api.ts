import axios from 'axios';
import { getApiStatusSetter } from '../context/ApiStatusContext';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://mymedicine-backend.vercel.app/api',
});

// Response interceptor to handle API errors
api.interceptors.response.use(
    (response) => {
        // On successful response, mark as connected
        const setter = getApiStatusSetter();
        if (setter) {
            setter.setConnected();
        }
        return response;
    },
    (error) => {
        const setter = getApiStatusSetter();
        if (setter) {
            if (!error.response) {
                // Network error - no response from server
                setter.setDisconnected();
            } else if (error.response.status >= 500) {
                // Server error
                setter.setError(`Server error: ${error.response.status}`);
            }
        }
        return Promise.reject(error);
    }
);
