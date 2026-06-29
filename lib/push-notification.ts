const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * API request helper
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
    let authToken = '';

    if (token) {
        try {
            const parsed = JSON.parse(token);
            authToken = parsed?.state?.token || '';
        } catch (e) {
            console.error('Error parsing token:', e);
        }
    }

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
    return (
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

/**
 * Get current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission {
    if (!isPushNotificationSupported()) {
        return 'denied';
    }
    return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!isPushNotificationSupported()) {
        throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission;
}

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported in this browser');
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        console.log('[Push] Service worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('[Push] Service worker registration failed:', error);
        throw error;
    }
}

/**
 * Get VAPID public key from backend
 */
async function getVapidPublicKey(): Promise<string> {
    try {
        const response = await apiRequest('/api/push/vapid-public-key', {
            method: 'GET'
        });

        if (!response.success || !response.publicKey) {
            throw new Error('Failed to get VAPID public key');
        }

        return response.publicKey;
    } catch (error) {
        console.error('[Push] Error getting VAPID public key:', error);
        throw error;
    }
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription> {
    if (!isPushNotificationSupported()) {
        throw new Error('Push notifications are not supported');
    }

    try {
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
            return null as unknown as PushSubscription;
        }

        const registration = await registerServiceWorker();

        await navigator.serviceWorker.ready;

        const vapidPublicKey = await getVapidPublicKey();

        const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey.buffer as ArrayBuffer
        });

        await apiRequest('/api/push/subscribe', {
            method: 'POST',
            body: JSON.stringify({ subscription: subscription.toJSON() })
        });

        return subscription;
    } catch (error) {
        throw error;
    }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
    if (!isPushNotificationSupported()) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            return false;
        }

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
            return false;
        }

        const success = await subscription.unsubscribe();

        if (success) {
            await apiRequest('/api/push/unsubscribe', {
                method: 'POST',
                body: JSON.stringify({ endpoint: subscription.endpoint })
            });
        }

        return success;
    } catch (error) {
        return false;
    }
}

/**
 * Check if user is subscribed to push notifications
 */
export async function isPushSubscribed(): Promise<boolean> {
    if (!isPushNotificationSupported()) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            return false;
        }

        const subscription = await registration.pushManager.getSubscription();
        return subscription !== null;
    } catch (error) {
        console.error('[Push] Check subscription error:', error);
        return false;
    }
}

/**
 * Send test notification
 */
export async function sendTestNotification(title?: string, body?: string): Promise<void> {
    try {
        await apiRequest('/api/push/test', {
            method: 'POST',
            body: JSON.stringify({ title, body })
        });
        console.log('[Push] Test notification sent');
    } catch (error) {
        console.error('[Push] Test notification error:', error);
        throw error;
    }
}