// ════════════════════════════════════════════════════════════════
// MatchMind Pro — Cloudflare Worker v2
// Deploy: https://workers.cloudflare.com/
// Ücretsiz: 100.000 istek/gün
// ════════════════════════════════════════════════════════════════

const API_KEY  = '82bcbcf16801fba63e9112a7b57d887f';
const API_BASE = 'https://v3.football.api-sports.io';

const ALLOWED_ENDPOINTS = [
  'fixtures','fixtures/live','odds','odds/live','standings',
  'teams','players','injuries','predictions','leagues',
  'fixtures/statistics','fixtures/events','fixtures/lineups','fixtures/headtohead',
];

const CACHE_TTL = {
  'fixtures': 60, 'fixtures/live': 30, 'odds': 120, 'odds/live': 45,
  'standings': 300, 'teams': 3600, 'players': 3600, 'injuries': 300,
  'predictions': 600, 'leagues': 3600, 'fixtures/statistics': 60,
  'fixtures/events': 30, 'fixtures/lineups': 120, 'fixtures/headtohead': 600,
};

const KV_AVAILABLE = typeof MATCHMIND_CACHE !== 'undefined';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === 'OPTIONS') return corsResponse(null, 204);
  if (request.method !== 'GET') return corsResponse(JSON.stringify({error:'Sadece GET destekleniyor'}), 405);

  const url      = new URL(request.url);
  const pathname = url.pathname.slice(1);
  const params   = url.search;

  const isAllowed = ALLOWED_ENDPOINTS.some(ep => pathname === ep || pathname.startsWith(ep + '/'));
  if (!isAllowed) {
    return corsResponse(JSON.stringify({error:'Endpoint izin listesinde değil', allowed: ALLOWED_ENDPOINTS}), 403);
  }

  const cacheKey = `mm_${pathname}${params}`;
  const ttl      = CACHE_TTL[pathname] || 60;

  if (KV_AVAILABLE) {
    try {
      const cached = await MATCHMIND_CACHE.get(cacheKey);
      if (cached) return corsResponse(cached, 200, {'X-Cache':'HIT'});
    } catch(e) {}
  }

  const apiUrl = `${API_BASE}/${pathname}${params}`;

  try {
    const apiResp = await fetch(apiUrl, {
      headers: {
        'x-apisports-key': API_KEY,
        'x-rapidapi-key':  API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'Accept': 'application/json',
      },
      cf: { cacheTtl: ttl, cacheEverything: true }
    });

    if (!apiResp.ok) {
      const errText = await apiResp.text();
      return corsResponse(JSON.stringify({error:`API hatası: ${apiResp.status}`, detail: errText.substring(0,200)}), apiResp.status);
    }

    const apiData = await apiResp.json();
    const remaining = apiResp.headers.get('x-ratelimit-requests-remaining');
    const limit     = apiResp.headers.get('x-ratelimit-requests-limit');

    if (KV_AVAILABLE && apiData) {
      try { await MATCHMIND_CACHE.put(cacheKey, JSON.stringify(apiData), {expirationTtl: ttl}); } catch(e) {}
    }

    return corsResponse(JSON.stringify(apiData), 200, {
      'X-Cache': 'MISS',
      'X-Cache-TTL': String(ttl),
      'X-RateLimit-Remaining': remaining || '?',
      'X-RateLimit-Limit': limit || '?',
      'X-Endpoint': pathname,
    });

  } catch(e) {
    return corsResponse(JSON.stringify({error:'Worker hatası: ' + e.message, endpoint: pathname}), 500);
  }
}

function corsResponse(body, status = 200, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': `public, max-age=${extraHeaders['X-Cache-TTL'] || 60}`,
      ...extraHeaders,
    }
  });
}

// ════════════════════════════════════════════════════════════════
// KURULUM:
// 1. workers.cloudflare.com → Create Worker → bu kodu yapıştır → Deploy
// 2. Worker URL'ini kopyala (https://matchmind.xxx.workers.dev)
// 3. MatchMind Pro → BÜLTEN → ⚙️ API Ayarları → Worker URL alanına yapıştır
//
// OPSİYONEL KV CACHE:
// Workers → KV → "MATCHMIND_CACHE" namespace oluştur
// Worker Settings → Variables → KV Namespace Bindings → ekle
//
// ÖRNEK ÇAĞRILAR:
// /fixtures?live=all                     → Canlı maçlar
// /fixtures?date=2026-03-16              → Bugünkü maçlar
// /fixtures?league=203&season=2025       → Süper Lig
// /standings?league=203&season=2025      → Lig tablosu
// /odds?fixture=1234                     → Maç oranları
// /injuries?fixture=1234                 → Sakatlıklar
// /fixtures/headtohead?h2h=33-34         → H2H geçmişi
// /fixtures/events?fixture=1234          → Gol/kart olayları
// /fixtures/lineups?fixture=1234         → Kadrolar
// ════════════════════════════════════════════════════════════════
