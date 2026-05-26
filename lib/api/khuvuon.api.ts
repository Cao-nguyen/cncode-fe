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

export const khuvuonApi = {
    // ========== USER ROUTES ==========

    getGarden: async () => {
        try {
            const token = getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/api/khuvuon/status`, { headers });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get Garden error:', error);
            return { success: false, message: 'Không thể tải dữ liệu khu vườn' };
        }
    },

    getQuestion: async () => {
        try {
            const token = getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_URL}/api/khuvuon/question`, { headers });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Get Question error:', error);
            return { success: false, message: 'Không thể tải câu hỏi' };
        }
    },

    submitAnswer: async (questionId: string, answerIndex: number) => {
        try {
            const token = getToken();
            if (!token) return { success: false, message: 'Vui lòng đăng nhập' };

            const response = await fetch(`${API_URL}/api/khuvuon/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ questionId, answerIndex })
            });
            return await response.json();
        } catch (error) {
            console.error('Submit Answer error:', error);
            return { success: false, message: 'Có lỗi xảy ra khi gửi đáp án' };
        }
    },

    waterTree: async () => {
        try {
            const token = getToken();
            if (!token) return { success: false, message: 'Vui lòng đăng nhập' };

            const response = await fetch(`${API_URL}/api/khuvuon/water`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Watering error:', error);
            return { success: false, message: 'Không thể thực hiện tưới cây' };
        }
    },

    // ========== ADMIN ROUTES ==========

    addQuestion: async (data: { question: string; options: string[]; correctAnswer: number }) => {
        try {
            const token = getToken();
            if (!token) return { success: false, message: 'Chưa đăng nhập' };

            const response = await fetch(`${API_URL}/api/khuvuon/admin/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Create Question error:', error);
            return { success: false, message: 'Không thể tạo câu hỏi' };
        }
    }
};