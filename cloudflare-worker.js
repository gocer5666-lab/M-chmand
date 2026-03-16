
// Cloudflare Worker — API-Football CORS Proxy
// Deploy: https://workers.cloudflare.com/
// Ücretsiz hesap: 100.000 istek/gün

const API_KEY = '82bcbcf16801fba63e9112a7b57d887f';
const API_BASE = 'https://v3.football.api-sports.io';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  // URL parse
  const url = new URL(request.url);
  const endpoint = url.pathname.slice(1); // /fixtures?live=all → fixtures?live=all
  const params = url.search; // ?live=all
  
  const apiUrl = `${API_BASE}/${endpoint}${params}`;
  
  try {
    const apiResponse = await fetch(apiUrl, {
      headers: {
        'x-apisports-key': API_KEY,
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });
    
    const data = await apiResponse.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=60'
      }
    });
  } catch(e) {
    return new Response(JSON.stringify({error: e.message}), {
      status: 500,
      headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
    });
  }
}
