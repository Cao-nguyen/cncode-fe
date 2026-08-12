import type { FaqPublicMeta } from '@/types/faq.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchFaqBySlug(slug: string): Promise<FaqPublicMeta | null> {
    try {
        const response = await fetch(`${API_URL}/api/faq/public/${encodeURIComponent(slug)}`, {
            next: { revalidate: 300 },
        });
        if (!response.ok) return null;
        const json = await response.json();
        return json?.success ? json.data : null;
    } catch {
        return null;
    }
}
