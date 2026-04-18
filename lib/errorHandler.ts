import { AxiosError } from "axios";

export interface ApiError {
    success: boolean;
    message: string;
    errors?: string[];
}

export const handleApiError = (error: unknown): string => {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiError;
        if (data?.message) {
            return data.message;
        }
        if (error.message === "Network Error") {
            return "Không thể kết nối đến máy chủ";
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Đã xảy ra lỗi, vui lòng thử lại sau";
};

export const isValidationError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 400;
    }
    return false;
};

export const isUnauthorizedError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 401;
    }
    return false;
};

export const isForbiddenError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 403;
    }
    return false;
};

export const isNotFoundError = (error: unknown): boolean => {
    if (error instanceof AxiosError) {
        return error.response?.status === 404;
    }
    return false;
};