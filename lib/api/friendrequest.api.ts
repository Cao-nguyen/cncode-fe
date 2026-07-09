import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

export interface FriendRequest {
    _id: string;
    sender: {
        _id: string;
        fullName: string;
        username: string;
        avatar: string;
    };
    receiver: {
        _id: string;
        fullName: string;
        username: string;
        avatar: string;
    };
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    message?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Friend {
    _id: string;
    fullName: string;
    username: string;
    avatar: string;
    bio?: string;
    lastActiveAt: string;
}

// Send friend request
export const sendFriendRequest = async (receiverId: string, message?: string, token?: string) => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.post(
            `${API_URL}/api/friend-requests/send`,
            { receiverId, message },
            { headers }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        if (errorData && (errorData.message || errorData.error)) {
            throw new Error(errorData.message || errorData.error);
        }
        throw new Error('An error occurred while processing your request');
    }
};

// Accept friend request
export const acceptFriendRequest = async (requestId: string, token?: string) => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.post(
            `${API_URL}/api/friend-requests/accept/${requestId}`,
            {},
            { headers }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        if (errorData && (errorData.message || errorData.error)) {
            throw new Error(errorData.message || errorData.error);
        }
        throw new Error('An error occurred while processing your request');
    }
};

// Reject friend request
export const rejectFriendRequest = async (requestId: string, token?: string) => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.post(
            `${API_URL}/api/friend-requests/reject/${requestId}`,
            {},
            { headers }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        if (errorData && (errorData.message || errorData.error)) {
            throw new Error(errorData.message || errorData.error);
        }
        throw new Error('An error occurred while processing your request');
    }
};

// Cancel friend request
export const cancelFriendRequest = async (requestId: string, token?: string) => {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.post(
            `${API_URL}/api/friend-requests/cancel/${requestId}`,
            {},
            { headers }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        if (errorData && (errorData.message || errorData.error)) {
            throw new Error(errorData.message || errorData.error);
        }
        throw new Error('An error occurred while processing your request');
    }
};

// Get sent friend requests
export const getSentRequests = async (token?: string): Promise<FriendRequest[]> => {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.get(
            `${API_URL}/api/friend-requests/sent`,
            { headers }
        );
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        if (errorData && (errorData.message || errorData.error)) {
            throw new Error(errorData.message || errorData.error);
        }
        throw new Error('An error occurred while processing your request');
    }
};

// Get received friend requests
export const getReceivedRequests = async (token?: string): Promise<FriendRequest[]> => {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.get(
            `${API_URL}/api/friend-requests/received`,
            { headers }
        );
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        if (errorData && (errorData.message || errorData.error)) {
            throw new Error(errorData.message || errorData.error);
        }
        throw new Error('An error occurred while processing your request');
    }
};

// Get friends list
export const getFriends = async (token?: string): Promise<Friend[]> => {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.get(
            `${API_URL}/api/friend-requests`,
            { headers }
        );
        return response.data.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        if (errorData && (errorData.message || errorData.error)) {
            throw new Error(errorData.message || errorData.error);
        }
        throw new Error('An error occurred while processing your request');
    }
};

// Unfriend
export const unfriend = async (friendId: string, token?: string) => {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.delete(
            `${API_URL}/api/friend-requests/unfriend/${friendId}`,
            { headers }
        );
        return response.data;
    } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorData = axiosError.response?.data;
        if (errorData && (errorData.message || errorData.error)) {
            throw new Error(errorData.message || errorData.error);
        }
        throw new Error('An error occurred while processing your request');
    }
};