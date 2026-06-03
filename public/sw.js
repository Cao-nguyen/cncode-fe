/* eslint-disable no-restricted-globals */
/* global self, clients */

// Service Worker cho Web Push Notifications

self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(self.clients.claim());
});

// Lắng nghe push event
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received:', event);

    if (!event.data) {
        console.log('[SW] Push event but no data');
        return;
    }

    try {
        const data = event.data.json();
        console.log('[SW] Push data:', data);

        const { title, body, icon, badge, url, data: notificationData } = data;

        const options = {
            body: body || 'Bạn có thông báo mới',
            icon: icon || '/icon-192x192.png',
            badge: badge || '/badge-72x72.png',
            data: {
                url: url || '/',
                ...notificationData
            },
            vibrate: [200, 100, 200],
            tag: notificationData?.notificationId || 'cncode-notification',
            renotify: true,
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'Xem ngay'
                },
                {
                    action: 'close',
                    title: 'Đóng'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(title || 'CNCode', options)
        );
    } catch (error) {
        console.error('[SW] Error handling push event:', error);
    }
});

// Xử lý khi user click vào notification
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event);

    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Tìm tab đã mở CNCode
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    const clientUrl = new URL(client.url);
                    const targetUrl = new URL(urlToOpen, self.location.origin);

                    // Nếu đã có tab mở CNCode, focus vào đó và navigate
                    if (clientUrl.origin === targetUrl.origin) {
                        return client.focus().then((focusedClient) => {
                            // Navigate đến URL mới nếu khác URL hiện tại
                            if (focusedClient.url !== targetUrl.href) {
                                return focusedClient.navigate(targetUrl.href);
                            }
                            return focusedClient;
                        });
                    }
                }

                // Nếu không có tab nào, mở tab mới
                return clients.openWindow(urlToOpen);
            })
    );
});

// Xử lý khi notification bị đóng
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed:', event);
});

console.log('[SW] Service worker loaded');