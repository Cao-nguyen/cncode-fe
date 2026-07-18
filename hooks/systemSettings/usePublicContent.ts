import { useState, useEffect } from 'react';
import { systemSettingsApi } from '@/lib/api/systemSettings.api';
import { IPublicContent } from '@/types/systemSettings.type';

export const usePublicContent = (slug: string) => {
    const [content, setContent] = useState<IPublicContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContent = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await systemSettingsApi.getPublicContent(slug);
            if (res.success) {
                setContent(res.data);
            }
        } catch (err) {
            setError('Failed to fetch content');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [slug]);

    return { content, loading, error, refetch: fetchContent };
};
