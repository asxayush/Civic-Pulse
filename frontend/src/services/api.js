import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    register: async (name, email, password) => {
        const response = await API.post("/auth/register", { name, email, password });
        return response.data;
    },
    verifyOTP: async (email, otp) => {
        const response = await API.post("/auth/verify-otp", { email, otp });
        if (response.data?.data?.token) {
            localStorage.setItem("token", response.data.data.token);
        }
        return response.data;
    },
    login: async (email, password) => {
        const response = await API.post("/auth/login", { email, password });
        if (response.data?.data?.token) {
            localStorage.setItem("token", response.data.data.token);
        }
        return response.data;
    },
    googleAuth: async (email, name, idToken) => {
        const response = await API.post("/auth/google", { email, name, idToken });
        if (response.data?.data?.token) {
            localStorage.setItem("token", response.data.data.token);
        }
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await API.get("/auth/me");
        return response.data;
    }
};

export default API;
