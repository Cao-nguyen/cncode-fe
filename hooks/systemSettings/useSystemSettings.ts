import { useState, useEffect } from 'react';
import { systemSettingsApi } from '@/lib/api/systemSettings.api';
import { ISystemSettings } from '@/types/systemSettings.type';

export const useSystemSettings = () => {
    const [settings, setSettings] = useState<ISystemSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await systemSettingsApi.getSettings();
            if (res.success) {
                setSettings(res.data);
            }
        } catch (err) {
            setError('Failed to fetch settings');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return { settings, loading, error, refetch: fetchSettings };
};
