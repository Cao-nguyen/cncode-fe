'use client';

import { useState, useCallback } from 'react';
import { helpCenterApi } from '@/lib/api/helpcenter.api';
import type { HelpCenterFAQ, HelpCenterListResponse } from '@/types/helpcenter.type';

export function useHelpCenter() {
    const [faqs, setFaqs] = useState<HelpCenterFAQ[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
    });

    const fetchFAQs = useCallback(async (category: string = 'all', search: string = '', page: number = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response: HelpCenterListResponse = await helpCenterApi.getFAQs(category, search, page);
            if (response.success && response.data) {
                setFaqs(response.data);
                if (response.pagination) {
                    setPagination(response.pagination);
                }
            } else {
                setError(response.message || 'Không thể tải câu hỏi');
            }
        } catch (err) {
            setError('Không thể tải câu hỏi');
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleHelpful = useCallback(async (id: string) => {
        try {
            const response = await helpCenterApi.toggleHelpful(id);
            if (response.success && response.data) {
                setFaqs(prev => prev.map(faq => 
                    faq._id === id 
                        ? { ...faq, helpfulCount: response.data.helpfulCount, userLiked: response.data.userLiked }
                        : faq
                ));
            }
        } catch (err) {
            console.error('Toggle helpful error:', err);
        }
    }, []);

    return {
        faqs,
        loading,
        error,
        pagination,
        fetchFAQs,
        toggleHelpful
    };
}
