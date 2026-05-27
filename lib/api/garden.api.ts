
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

const getAuthHeaders = (): HeadersInit => {
    const token = getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const gardenApi = {
    
    getGarden: async () => {
        try {
            const response = await fetch(`${API_URL}/api/garden/status`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể tải khu vườn' };
        }
    },

    getStats: async () => {
        try {
            const response = await fetch(`${API_URL}/api/garden/stats`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể tải thống kê' };
        }
    },

    getTrees: async () => {
        try {
            const response = await fetch(`${API_URL}/api/garden/trees`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể tải danh sách cây' };
        }
    },

    buyTree: async (treeId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/buy`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ treeId })
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể mua cây' };
        }
    },

    plantTree: async (treeId: string) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/plant`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ treeId })
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể trồng cây' };
        }
    },

    waterTree: async (treeIndex: number) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/water`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ treeIndex })
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể tưới cây' };
        }
    },

    harvestTree: async (treeIndex: number) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/harvest`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ treeIndex })
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể thu hoạch' };
        }
    },

    getQuestion: async (category?: string) => {
        try {
            let url = `${API_URL}/api/garden/question`;
            if (category && category !== 'all') {
                url += `?category=${category}`;
            }
            const response = await fetch(url, { headers: getAuthHeaders() });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể tải câu hỏi' };
        }
    },

    submitAnswer: async (questionId: string, answerIndex: number) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/answer`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ questionId, answerIndex })
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể gửi đáp án' };
        }
    },

    getAllQuestions: async (page: number = 1, limit: number = 10) => {
        try {
            const response = await fetch(
                `${API_URL}/api/garden/admin/questions?page=${page}&limit=${limit}`,
                { headers: getAuthHeaders() }
            );
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể tải câu hỏi' };
        }
    },

    addQuestion: async (data: {
        question: string;
        options: string[];
        correctAnswer: number;
        category: string;
        difficulty: string;
        xpReward: number;
    }) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/admin/questions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể thêm câu hỏi' };
        }
    },

    addMultipleQuestions: async (text: string) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/admin/questions/bulk`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ text })
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể thêm câu hỏi' };
        }
    },

    updateQuestion: async (id: string, data: Partial<{
        question: string;
        options: string[];
        correctAnswer: number;
        category: string;
        difficulty: string;
        xpReward: number;
    }>) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/admin/questions/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể cập nhật câu hỏi' };
        }
    },

    deleteQuestion: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/admin/questions/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể xóa câu hỏi' };
        }
    },

    getAllTrees: async () => {
        try {
            const response = await fetch(`${API_URL}/api/garden/admin/trees`, {
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể tải danh sách cây' };
        }
    },

    addTree: async (data: {
        name: string;
        description: string;
        stages: string[];
        waterRequired: number;
        growthPerWater: number;
        stageThresholds: number[];
        minCoins: number;
        maxCoins: number;
        price: number;
        isDefault: boolean;
        isActive: boolean;
    }) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/admin/trees`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể thêm cây' };
        }
    },

    updateTree: async (id: string, data: Partial<{
        name: string;
        description: string;
        stages: string[];
        waterRequired: number;
        growthPerWater: number;
        stageThresholds: number[];
        minCoins: number;
        maxCoins: number;
        price: number;
        isDefault: boolean;
        isActive: boolean;
    }>) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/admin/trees/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể cập nhật cây' };
        }
    },

    deleteTree: async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/garden/admin/trees/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            return await response.json();
        } catch {
            return { success: false, message: 'Không thể xóa cây' };
        }
    }
};
