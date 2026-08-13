/** 1 xu = 1 VNĐ trên toàn hệ thống */
export const XU_PER_VND = 1;

export function toXuAmount(vnd = 0): number {
    return Math.max(0, Math.round(vnd * XU_PER_VND));
}

export function formatVnd(value = 0): string {
    return `${(value || 0).toLocaleString('vi-VN')}đ`;
}

/** VNĐ rút gọn: 18.000 → 18K, 1.500.000 → 1,5M */
export function formatVndCompact(value = 0): string {
    const n = Math.max(0, Math.round(Number(value) || 0));
    if (n === 0) return '0';
    if (n >= 1_000_000_000) {
        const b = n / 1_000_000_000;
        return `${Number.isInteger(b) ? b : b.toFixed(1).replace(/\.0$/, '')}B`;
    }
    if (n >= 1_000_000) {
        const m = n / 1_000_000;
        return `${Number.isInteger(m) ? m : m.toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (n >= 1_000) {
        const k = n / 1_000;
        return `${Number.isInteger(k) ? k : k.toFixed(1).replace(/\.0$/, '')}K`;
    }
    return (value || 0).toLocaleString('vi-VN');
}

export function formatVndAxis(value = 0): string {
    const n = Math.max(0, Math.round(Number(value) || 0));
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1).replace(/\.0$/, '')}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1).replace(/\.0$/, '')}K`;
    return String(n);
}

export function formatXu(value = 0): string {
    if (!value) return 'Miễn phí';
    return `${value.toLocaleString('vi-VN')} xu`;
}

export function formatPayableAmount(value = 0): string {
    if (!value) return 'Miễn phí';
    return `${formatVnd(value)} (${formatXu(value)})`;
}

export function getPayableAmount(item?: { price?: number; discountPrice?: number | null } | null): number {
    if (!item) return 0;
    return item.discountPrice ?? item.price ?? 0;
}
