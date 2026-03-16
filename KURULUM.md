# GitHub Pages Kurulum Rehberi

## Adım 1: GitHub Hesabı
1. **github.com** adresine git
2. **Sign up** → Email + şifre gir
3. Ücretsiz plan seç

## Adım 2: Yeni Repository Oluştur
1. Sağ üstte **+** → **New repository**
2. Repository name: `matchmind-pro`
3. **Public** seç (Pages için zorunlu)
4. **Create repository** butonu

## Adım 3: Dosyaları Yükle
1. "uploading an existing file" linkine tıkla
2. Şu dosyaları sürükle-bırak:
   - `index.html` ← Ana uygulama
   - `cloudflare-worker.js` ← API proxy (opsiyonel)
   - `README.md`
3. **Commit changes** butonuna bas

## Adım 4: GitHub Pages Aktif Et
1. Repository → **Settings** sekmesi
2. Sol menü → **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** → **/ (root)**
5. **Save** butonuna bas

## Adım 5: Linki Al (2-3 dakika bekle)
Uygulama şu adreste açılır:
`https://GITHUB_KULLANICI_ADIN.github.io/matchmind-pro`

## Adım 6: API'yi Aktif Et
1. Uygulamayı GitHub Pages linkinden aç
2. BÜLTEN sekmesi → ⚙️ API butonu
3. API-Football key: `82bcbcf16801fba63e9112a7b57d887f`
4. Kaydet → Canlı veriler gelir! ✅

## Opsiyonel: Cloudflare Worker (Daha hızlı API)
1. workers.cloudflare.com → Ücretsiz hesap
2. Create Worker → cloudflare-worker.js içeriğini yapıştır
3. Deploy → URL'i kopyala
4. Uygulama ⚙️ API → Worker URL alanına yapıştır
