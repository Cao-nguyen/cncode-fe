/**
 * Utility functions for handling image URLs with environment-based API URL
 */

/**
 * Get the base API URL from environment variable
 * Falls back to localhost only in development
 */
export const getApiUrl = (): string => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return url.replace(/\/+$/, '');
};

/**
 * Convert a message ID or thumbnail URL to a full image URL
 * @param thumbnail - Can be a messageId, relative path, or full URL
 * @returns Full image URL using the environment's API URL
 */
export const getImageUrl = (thumbnail: string | undefined | number | null): string => {
    if (thumbnail === null || thumbnail === undefined || thumbnail === '') {
        return '/images/blog.png';
    }

    const thumbnailStr = String(thumbnail).trim();
    if (!thumbnailStr) {
        return '/images/blog.png';
    }

    const apiUrl = getApiUrl();

    // Static local assets
    if (thumbnailStr.startsWith('/images/') || thumbnailStr.startsWith('/icons/')) {
        return thumbnailStr;
    }

    // Full http(s) URLs
    if (thumbnailStr.startsWith('http://') || thumbnailStr.startsWith('https://')) {
        const isExternalUrl = thumbnailStr.includes('googleusercontent.com') ||
            thumbnailStr.includes('googleapis.com') ||
            thumbnailStr.includes('cloudflare.com') ||
            thumbnailStr.includes('cloudinary.com') ||
            thumbnailStr.includes('imgur.com') ||
            thumbnailStr.includes('cdn.') ||
            thumbnailStr.includes('storage.googleapis.com');

        if (isExternalUrl) {
            return thumbnailStr;
        }

        if (thumbnailStr.includes('/api/upload/proxy/')) {
            return thumbnailStr.replace(/https?:\/\/[^/]+/, apiUrl);
        }

        return thumbnailStr.replace(/https?:\/\/[^/]+/, apiUrl);
    }

    // Relative API upload paths
    if (thumbnailStr.startsWith('/api/upload')) {
        return `${apiUrl}${thumbnailStr}`;
    }

    // Extract messageId from proxy path fragments
    const messageIdMatch = thumbnailStr.match(/\/proxy\/file\/(\d+)/);
    if (messageIdMatch) {
        return `${apiUrl}/api/upload/proxy/file/${messageIdMatch[1]}`;
    }

    // Numeric Telegram message IDs
    if (/^\d+$/.test(thumbnailStr)) {
        return `${apiUrl}/api/upload/proxy/file/${thumbnailStr}`;
    }

    // Other site-relative paths
    if (thumbnailStr.startsWith('/')) {
        return thumbnailStr;
    }

    // Fallback: treat as messageId
    return `${apiUrl}/api/upload/proxy/file/${thumbnailStr}`;
};

/** Props for avatar images — Google CDN blocks hotlink without no-referrer */
export const avatarImageProps = {
    referrerPolicy: 'no-referrer' as const,
};

export const getAvatarUrl = (avatar: string | undefined | null): string => {
    return getImageUrl(avatar || '/images/avatar.png');
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