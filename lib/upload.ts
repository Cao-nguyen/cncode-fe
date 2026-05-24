// libs/upload.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UploadResponse {
    success: boolean;
    url?: string;
    message?: string;
}

interface UploadMultipleResponse {
    success: boolean;
    data?: Array<{
        success: boolean;
        url?: string;
        error?: string;
    }>;
    stats?: {
        total: number;
        success: number;
        failed: number;
    };
}

const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    } catch {
        return null;
    }
};

// ✅ HÀM NÉN ẢNH
const compressImage = (base64: string, maxWidth: number = 1200, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
        };
        img.src = base64;
    });
};

export const uploadApi = {
    uploadImage: async (base64Image: string, folder: string = 'general'): Promise<UploadResponse> => {
        const token = getToken();
        if (!token) {
            return { success: false, message: 'Chưa đăng nhập' };
        }

        const compressed = await compressImage(base64Image, 1200, 0.7);

        try {
            const response = await fetch(`${API_URL}/api/upload/image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ image: compressed, folder })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    success: false,
                    message: data.message || 'Upload thất bại'
                };
            }

            // Trả về đúng cấu trúc { success: true, url: string }
            return {
                success: true,
                url: data.data?.url,
                message: data.message
            };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, message: 'Lỗi kết nối' };
        }
    },

    uploadMultiple: async (images: string[], folder: string = 'general'): Promise<UploadMultipleResponse> => {
        const token = getToken();
        if (!token) {
            return { success: false };
        }

        // ✅ NÉN TẤT CẢ ẢNH TRƯỚC KHI UPLOAD
        const compressedImages = await Promise.all(
            images.map(img => compressImage(img, 1200, 0.7))
        );

        try {
            const response = await fetch(`${API_URL}/api/upload/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ images: compressedImages.map(img => ({ base64: img })), folder })
            });
            return await response.json();
        } catch (error) {
            return { success: false };
        }
    },

    uploadFromUrl: async (url: string, folder: string = 'general'): Promise<UploadResponse> => {
        const token = getToken();
        if (!token) {
            return { success: false, message: 'Chưa đăng nhập' };
        }

        try {
            const response = await fetch(`${API_URL}/api/upload/url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url, folder })
            });
            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    message:
                        data.message ||
                        'Upload thất bại'
                };
            }

            return data;
        } catch (error) {
            return { success: false, message: 'Lỗi kết nối' };
        }
    }
};