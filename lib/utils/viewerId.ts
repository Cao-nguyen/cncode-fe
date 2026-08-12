const GUEST_VIEWER_KEY = 'cn_guest_viewer_id';

export function getGuestViewerId(): string {
    if (typeof window === 'undefined') return '';

    let id = localStorage.getItem(GUEST_VIEWER_KEY);
    if (!id) {
        id = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem(GUEST_VIEWER_KEY, id);
    }

    return id;
}
