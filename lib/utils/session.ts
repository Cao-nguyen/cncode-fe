export function getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    let sessionId = localStorage.getItem('guestSessionId');
    if (!sessionId) {
        sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
        localStorage.setItem('guestSessionId', sessionId);
    }
    return sessionId;
}

export function shouldTrackVisit(): boolean {
    const lastTracked = localStorage.getItem('lastVisitTracked');
    const today = new Date().toISOString().split('T')[0];
    return lastTracked !== today;
}

export function markVisitTracked(): void {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('lastVisitTracked', today);
}
