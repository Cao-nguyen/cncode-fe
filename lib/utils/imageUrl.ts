/**
 * Utility functions for handling image URLs with environment-based API URL
 */

/**
 * Get the base API URL from environment variable
 * Falls back to localhost only in development
 */
export const getApiUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_URL || '';
};

/**
 * Convert a message ID or thumbnail URL to a full image URL
 * @param thumbnail - Can be a messageId, relative path, or full URL
 * @returns Full image URL using the environment's API URL
 */
export const getImageUrl = (thumbnail: string | undefined): string => {
    if (!thumbnail) {
        return '/images/blog.png'; // Default fallback image
    }

    const apiUrl = getApiUrl();

    // If it's already a full URL with http/https
    if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
        // Check if it's from external sources (Google, CDNs, etc.) - return as-is
        const isExternalUrl = thumbnail.includes('googleusercontent.com') ||
            thumbnail.includes('googleapis.com') ||
            thumbnail.includes('cloudflare.com') ||
            thumbnail.includes('cloudinary.com') ||
            thumbnail.includes('imgur.com') ||
            thumbnail.includes('cdn.') ||
            thumbnail.includes('storage.googleapis.com');

        if (isExternalUrl) {
            return thumbnail; // Return Google/CDN URLs directly
        }

        // For backend URLs (localhost or backend domain), replace with current API URL
        return thumbnail.replace(/https?:\/\/[^\/]+/, apiUrl);
    }

    // If it starts with /api/upload (relative path)
    if (thumbnail.startsWith('/api/upload')) {
        return `${apiUrl}${thumbnail}`;
    }

    // Check if it's a Telegram message ID pattern
    const messageIdMatch = thumbnail.match(/\/file\/(\d+)/);
    if (messageIdMatch) {
        return `${apiUrl}/api/upload/proxy/file/${messageIdMatch[1]}`;
    }

    // Otherwise, assume it's a messageId and construct the proxy URL
    return `${apiUrl}/api/upload/proxy/file/${thumbnail}`;
};

/**
 * Get video proxy URL from video file ID
 * @param videoFileId - The video file ID from Telegram
 * @returns Full video proxy URL
 */
export const getVideoUrl = (videoFileId: string): string => {
    const apiUrl = getApiUrl();
    return `${apiUrl}/api/upload/proxy/${videoFileId}`;
};

/**
 * Get download URL for a file
 * @param messageId - The Telegram message ID
 * @returns Full download URL
 */
export const getDownloadUrl = (messageId: string): string => {
    const apiUrl = getApiUrl();
    return `${apiUrl}/api/upload/proxy/file/${messageId}`;
};