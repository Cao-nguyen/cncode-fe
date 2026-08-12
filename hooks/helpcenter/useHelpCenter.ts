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

    const toggleHelpful = useCallback(async (id: string): Promise<boolean> => {
        try {
            const response = await helpCenterApi.toggleHelpful(id) as {
                success?: boolean;
                data?: { helpfulCount: number; userLiked: boolean };
            };
            if (response.success && response.data) {
                setFaqs(prev => prev.map(faq =>
                    faq._id === id
                        ? {
                            ...faq,
                            helpfulCount: response.data!.helpfulCount,
                            userLiked: response.data!.userLiked,
                        }
                        : faq
                ));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Toggle helpful error:', err);
            return false;
        }
    }, []);

    const incrementView = useCallback(async (id: string): Promise<number | null> => {
        try {
            const response = await helpCenterApi.incrementView(id) as {
                success?: boolean;
                data?: { views: number; counted?: boolean };
            };

            if (response.success && response.data) {
                setFaqs(prev => prev.map(faq =>
                    faq._id === id ? { ...faq, views: response.data!.views } : faq
                ));
                return response.data.views;
            }
        } catch (err) {
            console.error('Increment view error:', err);
        }

        return null;
    }, []);

    return {
        faqs,
        loading,
        error,
        pagination,
        fetchFAQs,
        toggleHelpful,
        incrementView,
    };
}
