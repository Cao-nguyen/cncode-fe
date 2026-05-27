import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function normalizeUrl(raw: string): string | null {
    if (!raw) return null;
    const trimmed = raw.trim();

    if (/^https?:\/\//.test(trimmed)) {
        try {
            new URL(trimmed);
            return trimmed;
        } catch {
            return null;
        }
    }

    const withProtocol = 'https://' + trimmed;
    try {
        new URL(withProtocol);

        if (!trimmed.includes('.')) return null;
        return withProtocol;
    } catch {
        return null;
    }
}

export function formatNumber(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return String(n);
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export function isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}