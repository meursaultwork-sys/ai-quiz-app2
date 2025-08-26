// キャッシュするファイルの名前
const CACHE_NAME = 'ai-passport-quiz-cache-v1';
// キャッシュするファイルのリスト
const urlsToCache = [
  './', // index.html
  './quiz-data.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js',
  'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800&display=swap'
];

// インストールイベント
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }
        // キャッシュがなければネットワークから取得
        return fetch(event.request);
      }
    )
  );
});
