'use client';

import { useState, useCallback } from 'react';
import { helpCenterApi } from '@/lib/api/helpcenter.api';
import type { HelpCenterFAQ, HelpCenterStats, HelpCenterListResponse } from '@/types/helpcenter.type';

export function useAdminHelpCenter() {
    const [faqs, setFaqs] = useState<HelpCenterFAQ[]>([]);
    const [stats, setStats] = useState<HelpCenterStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const fetchAllFAQs = useCallback(async (page: number = 1, category: string = 'all', search: string = '') => {
        setLoading(true);
        setError(null);
        try {
            const response: HelpCenterListResponse = await helpCenterApi.getAllFAQs(page, 20, category, search);
            if (response.success && response.data) {
                setFaqs(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } else {
                setError(response.message || 'Không thể tải dữ liệu');
            }
        } catch (err) {
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const response = await helpCenterApi.getStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Get stats error:', err);
        }
    }, []);

    const createFAQ = useCallback(async (data: { question: string; answer: string; category: string; order?: number }) => {
        try {
            const response = await helpCenterApi.createFAQ(data);
            if (response.success) {
                await fetchAllFAQs(pagination.page);
                await fetchStats();
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return { success: false, message: 'Không thể tạo câu hỏi' };
        }
    }, [fetchAllFAQs, fetchStats, pagination.page]);

    const updateFAQ = useCallback(async (id: string, data: Partial<{ question: string; answer: string; category: string; order: number; isActive: boolean }>) => {
        try {
            const response = await helpCenterApi.updateFAQ(id, data);
            if (response.success) {
                await fetchAllFAQs(pagination.page);
                await fetchStats();
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return { success: false, message: 'Không thể cập nhật câu hỏi' };
        }
    }, [fetchAllFAQs, fetchStats, pagination.page]);

    const deleteFAQ = useCallback(async (id: string) => {
        try {
            const response = await helpCenterApi.deleteFAQ(id);
            if (response.success) {
                await fetchAllFAQs(pagination.page);
                await fetchStats();
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return { success: false, message: 'Không thể xóa câu hỏi' };
        }
    }, [fetchAllFAQs, fetchStats, pagination.page]);

    const updateOrder = useCallback(async (orders: { id: string; order: number }[]) => {
        try {
            const response = await helpCenterApi.updateOrder(orders);
            if (response.success) {
                await fetchAllFAQs(pagination.page);
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return { success: false, message: 'Không thể cập nhật thứ tự' };
        }
    }, [fetchAllFAQs, pagination.page]);

    return {
        faqs,
        stats,
        loading,
        error,
        pagination,
        fetchAllFAQs,
        fetchStats,
        createFAQ,
        updateFAQ,
        deleteFAQ,
        updateOrder
    };
}
