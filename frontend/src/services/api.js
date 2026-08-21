import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
    withCredentials: true
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
    login: async (email, password, adminPin = "") => {
        const response = await API.post("/auth/login", { email, password, adminPin });
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

export const complaintService = {
    createComplaint: async (formData) => {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("category", formData.category);
        data.append("description", formData.description);
        data.append("hostelBlock", formData.hostelBlock);
        data.append("isAnonymous", formData.isAnonymous);
        if (formData.imageFile) {
            data.append("image", formData.imageFile);
        }

        const response = await API.post("/complaints", data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    },
    getPublicFeed: async () => {
        const response = await API.get("/complaints/public");
        return response.data;
    },
    getMyComplaints: async () => {
        const response = await API.get("/complaints/my");
        return response.data;
    },
    getAssignedComplaints: async () => {
        const response = await API.get("/complaints/assigned");
        return response.data;
    },
    updateStatus: async (id, status, afterImageFile) => {
        if (afterImageFile) {
            const data = new FormData();
            data.append("status", status);
            data.append("afterImage", afterImageFile);
            const response = await API.patch(`/complaints/${id}/status`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return response.data;
        }
        const response = await API.patch(`/complaints/${id}/status`, { status });
        return response.data;
    },
    verifyResolution: async (id, otp) => {
        const response = await API.post(`/complaints/${id}/verify-resolution`, { otp });
        return response.data;
    },
    rejectResolution: async (id, reason) => {
        const response = await API.post(`/complaints/${id}/reject-resolution`, { reason });
        return response.data;
    },
    upvote: async (id) => {
        const response = await API.post(`/complaints/${id}/upvote`);
        return response.data;
    },
    requestInvalid: async (id) => {
        const response = await API.patch(`/complaints/${id}/request-invalid`);
        return response.data;
    },
    getByTicketId: async (ticketId) => {
        const response = await API.get(`/complaints/track/${ticketId}`);
        return response.data;
    },
    analyzeImage: async ({ imageFile, title = "", description = "", hostelBlock = "", category = "" }) => {
        const data = new FormData();
        data.append("image", imageFile);
        if (title) data.append("title", title);
        if (description) data.append("description", description);
        if (hostelBlock) data.append("hostelBlock", hostelBlock);
        if (category) data.append("category", category);
        const response = await API.post("/complaints/analyze", data, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    }
};

export const wellnessService = {
    reflect: async (content) => {
        const response = await API.post("/wellness/reflect", { content });
        return response.data;
    },
    getMyReflections: async () => {
        const response = await API.get("/wellness/my");
        return response.data;
    }
};

export const adminService = {
    createStaff: async (staffData) => {
        const response = await API.post("/admin/create-staff", staffData);
        return response.data;
    },
    getAllUsers: async () => {
        const response = await API.get("/admin/users");
        return response.data;
    },
    toggleBanUser: async (id) => {
        const response = await API.patch(`/admin/users/${id}/ban`);
        return response.data;
    },
    getEscalatedComplaints: async () => {
        const response = await API.get("/admin/complaints/escalated");
        return response.data;
    },
    getAllComplaints: async () => {
        const response = await API.get("/admin/complaints/all");
        return response.data;
    },
    getInvalidReviewQueue: async () => {
        const response = await API.get("/admin/complaints/invalid-review");
        return response.data;
    },
    confirmInvalid: async (id) => {
        const response = await API.patch(`/admin/complaints/${id}/confirm-invalid`);
        return response.data;
    },
    rejectInvalid: async (id) => {
        const response = await API.patch(`/admin/complaints/${id}/reject-invalid`);
        return response.data;
    }
};

export default API;
