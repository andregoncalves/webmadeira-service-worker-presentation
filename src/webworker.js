const worker = new Worker('worker_file.js');

// Passar dados para o Worker
worker.postMessage('Hello World'); 

// Receber dados do Worker
worker.addEventListener('message', e => {
  console.log('Worker said: ', e.data); 
}, false);


self.addEventListener('message', e => {
  self.postMessage(e.data);
}, false);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', _ => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      // Registo foi bem sucedido
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
      // Registo falhou :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/index.html',
        '/css/styles.css',
        '/js/app.js',
        '/images/logo.jpg',
        '/api/some-data.json'
      ]);
    })
  );
});


self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - usar a cache como resposta
      if (response) {
        return response;
      }
      // Não esta na Cache
      return fetch(event.request);
    })
  );
});



self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit
      if (response) {
        return response;
      }

      // Request é um stream e só pode ser consumido uma vez
      // É necessário cloná-lo para podermos modificá-lo
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(response => {
        // Resposta inválida
        if(!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});
