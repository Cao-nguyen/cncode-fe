import { getImageUrl, getApiUrl } from '@/lib/utils/imageUrl';
import type { ProductFile, ProductPreviewFile } from '@/lib/api/shop.api';

export type ShopFileLike = Pick<ProductFile, 'url' | 'name' | 'size' | 'type'>;

const MIME_EXTENSION_MAP: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/plain': 'txt',
    'text/markdown': 'md',
};

export function getShopFileExtension(name: string, mimeType?: string): string {
    const fromName = name.split('.').pop()?.toLowerCase()?.trim();
    if (fromName && fromName.length <= 6 && /^[a-z0-9]+$/.test(fromName)) {
        return fromName;
    }
    if (mimeType && MIME_EXTENSION_MAP[mimeType]) {
        return MIME_EXTENSION_MAP[mimeType];
    }
    if (mimeType?.startsWith('image/')) {
        return mimeType.split('/')[1]?.split('+')[0] || 'jpg';
    }
    return '';
}

export function isShopExternalLink(file: Pick<ShopFileLike, 'url' | 'type'>): boolean {
    if (file.type === 'link') return true;
    const url = file.url || '';
    if (!/^https?:\/\//i.test(url)) return false;
    return !url.includes('/api/upload/proxy/');
}

export function isDownloadOnlyShopFile(file: ShopFileLike): boolean {
    if (isShopExternalLink(file)) return false;
    const ext = getShopFileExtension(file.name, file.type);
    return ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext);
}

export function canPreviewShopFile(file: ShopFileLike): boolean {
    if (isDownloadOnlyShopFile(file)) return false;
    if (isShopExternalLink(file)) return true;
    const ext = getShopFileExtension(file.name, file.type);
    return ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'txt', 'md'].includes(ext);
}

export type ShopFilePreviewMode = 'pdf' | 'docx' | 'legacy-doc' | 'pptx' | 'image' | 'text' | 'link' | 'unsupported';

export function getShopFilePreviewMode(file: ShopFileLike): ShopFilePreviewMode {
    if (isShopExternalLink(file)) return 'link';
    const ext = getShopFileExtension(file.name, file.type);
    if (ext === 'pdf') return 'pdf';
    if (ext === 'docx') return 'docx';
    if (ext === 'doc') return 'legacy-doc';
    if (ext === 'pptx') return 'pptx';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
    if (['txt', 'md'].includes(ext)) return 'text';
    return 'unsupported';
}

export function getShopFilePreviewErrorMessage(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    return message || 'Không thể xem trước file';
}

export function extractMessageIdFromShopFileUrl(url: string | undefined): string | null {
    if (!url) return null;
    const match = String(url).match(/\/proxy\/file\/(\d+)/);
    return match ? match[1] : /^\d+$/.test(url) ? url : null;
}

export function isTelegramProxyFile(url: string | undefined): boolean {
    return !!extractMessageIdFromShopFileUrl(url);
}

export function isDocxBuffer(buffer: ArrayBuffer): boolean {
    const bytes = new Uint8Array(buffer.slice(0, 2));
    return bytes[0] === 0x50 && bytes[1] === 0x4b;
}

export type ShopFilePreviewContent =
    | { type: 'html'; content: string }
    | { type: 'text'; content: string }
    | { type: 'pdf' }
    | { type: 'pptx' };

export async function fetchShopFilePreviewContent(file: ShopFileLike): Promise<ShopFilePreviewContent> {
    const messageId = extractMessageIdFromShopFileUrl(file.url);
    if (!messageId) {
        throw new Error('Không thể xem trước file này');
    }

    const params = new URLSearchParams();
    if (file.name) params.set('filename', file.name);

    const response = await fetch(`${getApiUrl()}/api/upload/preview/file/${messageId}?${params.toString()}`);
    const data = await response.json() as {
        success: boolean;
        message?: string;
        data?: ShopFilePreviewContent;
    };

    if (!response.ok || !data.success || !data.data) {
        throw new Error(data.message || 'Không thể xem trước file');
    }

    return data.data;
}

export function buildShopFileProxyUrl(
    url: string | undefined,
    options?: { filename?: string; disposition?: 'inline' | 'attachment' },
): string | null {
    if (!url) return null;
    if (isShopExternalLink({ url, type: '' })) {
        return url;
    }

    const base = getImageUrl(url);
    const params = new URLSearchParams();
    if (options?.filename) params.set('filename', options.filename);
    if (options?.disposition) params.set('disposition', options.disposition);
    const qs = params.toString();
    return qs ? `${base}${base.includes('?') ? '&' : '?'}${qs}` : base;
}

export async function downloadShopFile(file: ShopFileLike): Promise<void> {
    if (!file.url) throw new Error('Không có link tải');

    if (isShopExternalLink(file)) {
        const anchor = document.createElement('a');
        anchor.href = file.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.download = file.name;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        return;
    }

    const url = buildShopFileProxyUrl(file.url, {
        filename: file.name,
        disposition: 'attachment',
    });
    if (!url) throw new Error('Không có link tải');

    const response = await fetch(url);
    if (!response.ok) throw new Error('Không thể tải file');

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(objectUrl);
}

export async function fetchShopFileArrayBuffer(file: ShopFileLike): Promise<ArrayBuffer> {
    if (!file.url || isShopExternalLink(file)) {
        throw new Error('Không thể đọc file này');
    }

    const url = buildShopFileProxyUrl(file.url, {
        filename: file.name,
        disposition: 'inline',
    });
    if (!url) throw new Error('Không có link file');

    const response = await fetch(url);
    if (!response.ok) throw new Error('Không thể tải file');
    return response.arrayBuffer();
}

export function toShopFileLike(file: ProductPreviewFile): ShopFileLike {
    return {
        url: file.url,
        name: file.name,
        size: file.size,
        type: file.type,
    };
}
