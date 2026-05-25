// lib/api/helpcenter.api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export const helpCenterApi = {
    // ========== PUBLIC ROUTES ==========

    getFAQs: async (category: string = 'all', search: string = '', page: number = 1, limit: number = 50, token?: string | null) => {
        try {
            let url = `${API_URL}/api/helpcenter?page=${page}&limit=${limit}`;
            if (category !== 'all') url += `&category=${category}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            // Ưu tiên token truyền vào, nếu không thì lấy từ localStorage
            const activeToken = token || getToken();
            const headers: HeadersInit = {};
            if (activeToken) {
                headers['Authorization'] = `Bearer ${activeToken}`;
            }

            const response = await fetch(url, { headers });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Không thể tải câu hỏi' };
        }
    },

    getFAQById: async (id: string) => {
        try {
            const token = getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/api/helpcenter/${id}`, { headers });
            return await response.json();
        } catch (error) {
            console.error('Get FAQ error:', error);
            return { success: false, message: 'Không thể tải câu hỏi' };
        }
    },

    toggleHelpful: async (id: string) => {
        try {
            const token = getToken();
            if (!token) {
                return { success: false, message: 'Vui lòng đăng nhập' };
            }

            const response = await fetch(`${API_URL}/api/helpcenter/${id}/helpful`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Toggle helpful error:', error);
            return { success: false, message: 'Có lỗi xảy ra' };
        }
    },

    // ========== ADMIN ROUTES ==========

    getAllFAQs: async (page: number = 1, limit: number = 20, category: string = 'all', search: string = '') => {
        try {
            const token = getToken();
            if (!token) {
                return { success: false, message: 'Chưa đăng nhập' };
            }

            let url = `${API_URL}/api/helpcenter/admin/all?page=${page}&limit=${limit}`;
            if (category !== 'all') url += `&category=${category}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Get all FAQs error:', error);
            return { success: false, message: 'Không thể tải dữ liệu' };
        }
    },

    getStats: async () => {
        try {
            const token = getToken();
            if (!token) {
                return { success: false, message: 'Chưa đăng nhập' };
            }

            const response = await fetch(`${API_URL}/api/helpcenter/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false, message: 'Không thể tải thống kê' };
        }
    },

    createFAQ: async (data: { question: string; answer: string; category: string; order?: number }) => {
        try {
            const token = getToken();
            if (!token) {
                return { success: false, message: 'Chưa đăng nhập' };
            }

            const response = await fetch(`${API_URL}/api/helpcenter/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Create FAQ error:', error);
            return { success: false, message: 'Không thể tạo câu hỏi' };
        }
    },

    updateFAQ: async (id: string, data: Partial<{ question: string; answer: string; category: string; order: number; isActive: boolean }>) => {
        try {
            const token = getToken();
            if (!token) {
                return { success: false, message: 'Chưa đăng nhập' };
            }

            const response = await fetch(`${API_URL}/api/helpcenter/admin/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Update FAQ error:', error);
            return { success: false, message: 'Không thể cập nhật câu hỏi' };
        }
    },

    deleteFAQ: async (id: string) => {
        try {
            const token = getToken();
            if (!token) {
                return { success: false, message: 'Chưa đăng nhập' };
            }

            const response = await fetch(`${API_URL}/api/helpcenter/admin/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        } catch (error) {
            console.error('Delete FAQ error:', error);
            return { success: false, message: 'Không thể xóa câu hỏi' };
        }
    },

    updateOrder: async (orders: { id: string; order: number }[]) => {
        try {
            const token = getToken();
            if (!token) {
                return { success: false, message: 'Chưa đăng nhập' };
            }

            const response = await fetch(`${API_URL}/api/helpcenter/admin/order`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orders })
            });
            return await response.json();
        } catch (error) {
            console.error('Update order error:', error);
            return { success: false, message: 'Không thể cập nhật thứ tự' };
        }
    }
};