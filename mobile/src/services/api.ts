import axios from 'axios';

// For mobile, we use the production URL as default.
// In development, you might want to use your local IP: 'http://192.168.x.x:5000/api'
export const api = axios.create({
    baseURL: 'https://mymedicine-backend.vercel.app/api',
});
