import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// REQUEST INTERCEPTOR: The "Global Passport Machine"
api.interceptors.request.use(
    (config) => {
        // Grab the token from storage right before the request fires
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: The "Graceful Failure" Observer
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // If the server rejects the token (401 or 403)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // CRITICAL CHECK: Ignore failures originating from the auth endpoint itself
            if (!originalRequest.url.includes('/auth/token')) {
                console.warn("Session invalid. Wiping storage...");
                localStorage.removeItem('token');

                // Force a hard redirect to the home path with an expired flag
                window.location.href = '/?expired=true';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

