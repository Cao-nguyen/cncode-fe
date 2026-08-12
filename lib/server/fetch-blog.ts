import type { Blog } from '@/types/blog.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
    try {
        const response = await fetch(`${API_URL}/api/blog/${encodeURIComponent(slug)}`, {
            next: { revalidate: 300 },
        });

        if (!response.ok) return null;

        const json = await response.json();
        return json?.success ? json.data : null;
    } catch {
        return null;
    }
}

export function stripHtml(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function getBlogDescription(blog: Blog): string {
    if (blog.excerpt?.trim()) return blog.excerpt.trim();
    return stripHtml(blog.content).slice(0, 160);
}
