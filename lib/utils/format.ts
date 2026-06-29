// Utility functions cho formatting

export function formatNumber(n: number): string {
    return new Intl.NumberFormat('vi-VN').format(n);
}

export function formatTime(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
}

export function getUserInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() || 'U';
}
