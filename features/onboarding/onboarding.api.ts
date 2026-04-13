import axios from "axios";
import { UpdateProfileResponse, CheckUsernameResponse } from "./onboarding.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const onboardingApi = {
    updateProfile: async (data: FormData, token: string): Promise<UpdateProfileResponse> => {
        const response = await axios.put<UpdateProfileResponse>(
            `${API_URL}/api/user/profile`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        return response.data;
    },

    checkUsername: async (username: string, token: string): Promise<CheckUsernameResponse> => {
        const response = await axios.get<CheckUsernameResponse>(
            `${API_URL}/api/user/check-username/${username}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    },
};