const cacheName = 'Rethink Apps DM-Comm';
const filesToCache = [
    "./404.html",
    "index.html",
    "app.js",
    "app.css",
    "init.js",
    "https://code.jquery.com/jquery-3.2.1.slim.min.js",
    "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "https://code.getmdl.io/1.3.0/material.indigo-pink.min.css",
    "https://code.getmdl.io/1.3.0/material.min.js",
    "https://cdn.firebase.com/libs/firebaseui/2.1.1/firebaseui.css",
    "https://cdn.firebase.com/libs/firebaseui/2.1.1/firebaseui.js",
    "https://www.gstatic.com/firebasejs/4.1.2/firebase.js",
    "https://www.gstatic.com/firebasejs/4.1.1/firebase-app.js",
    "https://www.gstatic.com/firebasejs/4.1.1/firebase-database.js",
    "https://www.gstatic.com/firebasejs/4.1.1/firebase-auth.js",
];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== cacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});