const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UploadResponse {
    success: boolean;
    url?: string;
    messageId?: string;
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

            // Use PNG to preserve transparency
            const compressed = canvas.toDataURL('image/png');
            resolve(compressed);
        };
        img.src = base64;
    });
};

// Progress callback type
type UploadProgressCallback = (progress: number, status: string) => void;

export const uploadApi = {
    // Upload file with progress (FormData - faster than base64)
    uploadFileWithProgress: async (
        file: File,
        folder: string = 'general',
        onProgress?: UploadProgressCallback
    ): Promise<UploadResponse> => {
        const token = getToken();
        if (!token) {
            return { success: false, message: 'Chưa đăng nhập' };
        }

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const response = await fetch(`${API_URL}/api/upload/file`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    success: false,
                    message: data.message || 'Upload thất bại'
                };
            }

            return {
                success: true,
                url: data.data?.url,
                messageId: data.data?.messageId,
                message: data.message
            };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, message: 'Lỗi kết nối' };
        }
    },

    // Upload video with progress (reads file and uploads)
    uploadVideoWithProgress: async (
        file: File,
        onProgress?: UploadProgressCallback
    ): Promise<{ success: boolean; url?: string; messageId?: string; message?: string }> => {
        const token = getToken();
        if (!token) {
            return { success: false, message: 'Chưa đăng nhập' };
        }

        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            return { success: false, message: 'Video quá lớn. Tối đa 100MB' };
        }

        try {
            // Read file progress
            onProgress?.(10, 'Đang đọc file...');

            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                // Calculate progress for large files
                reader.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 30);
                        onProgress?.(10 + percent, 'Đang mã hóa...');
                    }
                };
                reader.readAsDataURL(file);
            });

            onProgress?.(40, 'Đang chuẩn bị upload...');

            const payload = {
                file: base64,
                fileName: file.name,
                folder: 'video'
            };

            onProgress?.(50, 'Đang upload...');

            const response = await fetch(`${API_URL}/api/upload/file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            onProgress?.(80, 'Đang xử lý...');

            if (!response.ok || !data.success) {
                return {
                    success: false,
                    message: data.message || 'Upload thất bại'
                };
            }

            onProgress?.(100, 'Hoàn tất!');

            return {
                success: true,
                url: data.data?.url,
                messageId: data.data?.messageId,
                message: data.message
            };
        } catch (error) {
            console.error('Upload video error:', error);
            return { success: false, message: 'Lỗi kết nối' };
        }
    },

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

            let imageUrl = data.data?.url;
            if (imageUrl && imageUrl.startsWith('/')) {
                imageUrl = `${API_URL}${imageUrl}`;
            }

            return {
                success: true,
                url: imageUrl,
                messageId: data.data?.messageId,
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
    },

    uploadFile: async (base64File: string, folder: string = 'general'): Promise<UploadResponse> => {
        const token = getToken();
        if (!token) {
            return { success: false, message: 'Chưa đăng nhập' };
        }

        try {
            const response = await fetch(`${API_URL}/api/upload/file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ file: base64File, folder })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    success: false,
                    message: data.message || 'Upload thất bại'
                };
            }

            return {
                success: true,
                url: data.data?.url,
                messageId: data.data?.messageId,
                message: data.message
            };
        } catch (error) {
            console.error('Upload error:', error);
            return { success: false, message: 'Lỗi kết nối' };
        }
    },

    uploadVideo: async (file: File): Promise<{ success: boolean; url?: string; messageId?: string; message?: string }> => {
        const token = getToken();
        if (!token) {
            return { success: false, message: 'Chưa đăng nhập' };
        }

        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const payload = {
                file: base64,
                fileName: file.name,
                folder: 'video'
            };

            const response = await fetch(`${API_URL}/api/upload/file`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    success: false,
                    message: data.message || 'Upload thất bại'
                };
            }

            return {
                success: true,
                url: data.data?.url,
                messageId: data.data?.messageId,
                message: data.message
            };
        } catch (error) {
            console.error('Upload video error:', error);
            return { success: false, message: 'Lỗi kết nối' };
        }
    }
};
