const APP_CACHE = "statech-app-v9";
const LESSON_CACHE = "statech-lessons-v1";
const APP_FILES = [
    "./",
    "./index.html",
    "./login.html",
    "./register.html",
    "./dashboard.html",
    "./mentor-register.html",
    "./mentor.html",
    "./style.css",
    "./navigation.js",
    "./dashboard.js",
    "./login.js",
    "./register.js",
    "./mentor-register.js",
    "./mentor.js",
    "./supportTicker.js",
    "./contact.js",
    "./statech-logo.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(APP_CACHE)
            .then((cache) => cache.addAll(APP_FILES))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => Promise.all(
                cacheNames
                    .filter((cacheName) => ![APP_CACHE, LESSON_CACHE].includes(cacheName))
                    .map((cacheName) => caches.delete(cacheName))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const requestUrl = new URL(request.url);

    if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
        return;
    }

    if (requestUrl.pathname.endsWith("/lessons")) {
        event.respondWith((async () => {
            const cache = await caches.open(LESSON_CACHE);

            try {
                const response = await fetch(request);
                if (response.ok) {
                    await cache.put(request, response.clone());
                }
                return response;
            } catch (error) {
                return await cache.match(request) || new Response(
                    JSON.stringify({ message: "Lessons are unavailable offline." }),
                    { status: 503, headers: { "Content-Type": "application/json" } }
                );
            }
        })());
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith((async () => {
            const cachedPage = await caches.match(request);
            if (cachedPage) {
                return cachedPage;
            }

            return fetch(request);
        })());
        return;
    }

    if (["script", "style", "image"].includes(request.destination)) {
        event.respondWith((async () => {
            const cachedAsset = await caches.match(request);
            if (cachedAsset) {
                return cachedAsset;
            }

            const response = await fetch(request);
            if (response.ok) {
                const cache = await caches.open(APP_CACHE);
                await cache.put(request, response.clone());
            }
            return response;
        })());
    }
});