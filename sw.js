/**
 * MobileWeb Service Worker
 * Progressive Web App offline caching and background sync
 */

const CACHE_NAME = 'mobileweb-v1';
const ASSETS_CACHE = 'mobileweb-assets-v1';
const API_CACHE = 'mobileweb-api-v1';

// Static assets to cache
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/animations.css',
    '/js/main.js',
    '/js/slider.js',
    '/js/animations.js',
    '/manifest.json',
    '/images/icon-72x72.png',
    '/images/icon-96x96.png',
    '/images/icon-128x128.png',
    '/images/icon-144x144.png',
    '/images/icon-152x152.png',
    '/images/icon-192x192.png',
    '/images/icon-384x384.png',
    '/images/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Pages to cache
const PAGES_TO_CACHE = [
    '/',
    '/index.html',
    '/pages/about.html',
    '/pages/services.html',
    '/pages/portfolio.html',
    '/pages/blog.html',
    '/pages/contact.html'
];

// ============================================
// Installation
// ============================================

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching core assets...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] Skip waiting to activate immediately');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Cache error:', error);
            })
    );
});

// ============================================
// Activation
// ============================================

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');
    
    // Remove old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE && cacheName !== API_CACHE) {
                        console.log(`[ServiceWorker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('[ServiceWorker] Service worker activated');
            return self.clients.claim();
        })
    );
});

// ============================================
// Fetch Events
// ============================================

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Ignore non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Cache API requests separately
    if (url.pathname.startsWith('/api/') || url.pathname.includes('api.')) {
        event.respondWith(
            caches.open(API_CACHE)
                .then((cache) => {
                    return cache.match(event.request)
                        .then((response) => {
                            // Return cached response if available
                            if (response) {
                                return response;
                            }
                            
                            // Otherwise fetch and cache
                            return fetch(event.request)
                                .then((response) => {
                                    // Only cache successful responses
                                    if (response.status === 200) {
                                        cache.put(event.request, response.clone());
                                    }
                                    return response;
                                });
                        });
                })
        );
        return;
    }
    
    // Handle static assets
    event.respondWith(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.match(event.request)
                    .then((response) => {
                        // Return cached response if available
                        if (response) {
                            return response;
                        }
                        
                        // Otherwise fetch and cache
                        return fetch(event.request)
                            .then((response) => {
                                // Only cache successful responses for static assets
                                if (response.status === 200 && 
                                    (event.request.url.includes('.css') ||
                                     event.request.url.includes('.js') ||
                                     event.request.url.includes('.png') ||
                                     event.request.url.includes('.jpg') ||
                                     event.request.url.includes('.jpeg') ||
                                     event.request.url.includes('.svg') ||
                                     event.request.url.includes('.woff') ||
                                     event.request.url.includes('.woff2'))) {
                                    cache.put(event.request, response.clone());
                                }
                                return response;
                            })
                            .catch(() => {
                                // Fallback for failed requests
                                return cache.match('/index.html');
                            });
                    });
            })
    );
});

// ============================================
// Background Sync
// ============================================

self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);
    
    if (event.tag === 'sync-form-data') {
        event.waitUntil(
            syncFormData()
        );
    }
});

const syncFormData = async () => {
    const formData = await caches.open('form-data')
        .then((cache) => cache.match('/form-data'))
        .then((response) => response?.json());
    
    if (formData) {
        try {
            // Simulate sending form data to server
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                // Remove cached form data on success
                caches.open('form-data')
                    .then((cache) => cache.delete('/form-data'));
                
                // Send notification to client
                self.clients.matchAll().then((clients) => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'FORM_SYNC_SUCCESS',
                            message: 'Form data synced successfully'
                        });
                    });
                });
            }
        } catch (error) {
            console.error('[ServiceWorker] Form sync failed:', error);
            // Will retry on next sync event
        }
    }
};

// ============================================
// Push Notifications
// ============================================

self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');
    
    const data = event.data?.json();
    const title = data?.title || 'MobileWeb';
    const body = data?.body || 'You have a new notification';
    const icon = data?.icon || '/images/icon-192x192.png';
    const badge = data?.badge || '/images/badge-72x72.png';
    const dataPayload = data?.data || {};
    
    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon,
            badge: badge,
            data: dataPayload,
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'Open' },
                { action: 'dismiss', title: 'Dismiss' }
            ]
        })
    );
});

// ============================================
// Notification Click
// ============================================

self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            }).then((clients) => {
                if (clients.length > 0) {
                    // Focus existing window
                    clients[0].focus();
                    clients[0].postMessage({
                        type: 'NOTIFICATION_CLICK',
                        data: event.notification.data
                    });
                } else {
                    // Open new window
                    self.clients.openWindow(event.notification.data.url || '/');
                }
            })
        );
    }
});

// ============================================
// Message Events
// ============================================

self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);
    
    if (event.data.type === 'CACHE_ASSETS') {
        caches.open(ASSETS_CACHE)
            .then((cache) => {
                return cache.addAll(event.data.assets);
            })
            .then(() => {
                event.source.postMessage({
                    type: 'CACHE_SUCCESS',
                    message: 'Assets cached successfully'
                });
            })
            .catch((error) => {
                event.source.postMessage({
                    type: 'CACHE_ERROR',
                    error: error.message
                });
            });
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => {
            event.source.postMessage({
                type: 'CLEAR_CACHE_SUCCESS',
                message: 'All caches cleared'
            });
        });
    }
    
    if (event.data.type === 'STORE_FORM_DATA') {
        caches.open('form-data')
            .then((cache) => {
                return cache.put('/form-data', new Response(
                    JSON.stringify(event.data.formData),
                    { headers: { 'Content-Type': 'application/json' } }
                ));
            })
            .then(() => {
                // Trigger background sync
                return self.registration.sync.register('sync-form-data');
            })
            .then(() => {
                event.source.postMessage({
                    type: 'FORM_DATA_STORED',
                    message: 'Form data stored for offline sync'
                });
            });
    }
});

// ============================================
// Periodic Background Sync (if supported)
// ============================================

if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', (event) => {
        console.log('[ServiceWorker] Periodic sync:', event.tag);
        
        if (event.tag === 'update-content') {
            event.waitUntil(
                updateContent()
            );
        }
    });
}

const updateContent = async () => {
    try {
        const response = await fetch('/api/content-updates');
        const updates = await response.json();
        
        // Cache updates
        const cache = await caches.open(ASSETS_CACHE);
        await cache.put('/content-updates', new Response(
            JSON.stringify(updates),
            { headers: { 'Content-Type': 'application/json' } }
        ));
        
        // Notify clients
        self.clients.matchAll().then((clients) => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'CONTENT_UPDATED',
                    updates: updates
                });
            });
        });
    } catch (error) {
        console.error('[ServiceWorker] Content update failed:', error);
    }
};

// ============================================
// Offline Page
// ============================================

self.addEventListener('fetch', (event) => {
    // Check if this is a page request
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Return offline page
                    return caches.match('/pages/offline.html')
                        .then((response) => {
                            return response || caches.match('/index.html');
                        });
                })
        );
    }
});

// ============================================
// Cache API Responses
// ============================================

const cacheApiResponse = async (request, response) => {
    const cache = await caches.open(API_CACHE);
    await cache.put(request, response.clone());
    return response;
};

// ============================================
// Error Handling
// ============================================

self.addEventListener('error', (error) => {
    console.error('[ServiceWorker] Error:', error);
});

// ============================================
// Console Log
// ============================================

console.log('%c MobileWeb Service Worker Loaded ', 'background: #6200ea; color: white; font-size: 16px; padding: 5px;');
