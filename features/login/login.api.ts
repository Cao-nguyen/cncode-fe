import axios from "axios";
import { User } from "@/store/userSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const loginApi = {
    googleLogin: async (credentialToken: string): Promise<{ token: string; user: User }> => {
        const response = await axios.post(`${API_URL}/api/user/google`, {
            token: credentialToken
        });
        return response.data;
    },

    checkAuth: async (token: string): Promise<User> => {
        const response = await axios.get(`${API_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};