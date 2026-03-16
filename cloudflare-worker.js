const API_BASE = 'https://v3.football.api-sports.io';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname.slice(1);

  // Kök yol testi (tarayıcıda direkt açınca ne döndüğünü görmek için)
  if (!path || path === '' || path === '/') {
    return new Response(
      'MatchMind Proxy V2 aktif!\n\nÖrnek çağrılar:\n/fixtures/live\n/fixtures?date=2026-03-17\n/standings?league=203&season=2025',
      {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      }
    );
  }

  const apiUrl = `${API_BASE}/${path}${url.search}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'x-apisports-key': API_KEY,          // ← Settings → Variables → Encrypted → API_KEY'den geliyor
      },
      redirect: 'follow'
    });

    // Header'ları kopyala + CORS ekle
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    newHeaders.set('Access-Control-Max-Age', '86400');
    newHeaders.set('Content-Type', 'application/json;charset=UTF-8');

    // Hata durumunda da header'ları koru
    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: await response.text() };
      }
      return new Response(JSON.stringify({
        error: `API-Sports hatası ${response.status}`,
        detail: errorBody
      }), {
        status: response.status,
        headers: newHeaders
      });
    }

    // Başarılı yanıt (body'yi olduğu gibi geçir)
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: 'Worker tarafında hata',
      message: err.message || 'Bilinmeyen hata'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}