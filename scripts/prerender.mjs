// Build-time prerender for the PUBLIC routes (founder 2026-09-18, SEO step 2).
//
// Runs after `vite build`. It never starts a browser: it takes the built
// dist/index.html shell and writes real HTML for the pages a crawler should
// read without JavaScript — Google runs the Vue app, Bing and Yandex mostly
// do not, and Yandex is where the Russian-speaking audience searches.
//
//   dist/index.html                      landing: hero + features + cities as static text
//   dist/business/index.html             business landing: hero text, its own title/description
//   dist/discover/<slug>/index.html      one per public city page: title, description,
//                                        canonical, Open Graph, ItemList JSON-LD and the
//                                        full place list as semantic HTML
//   dist/sitemap.xml                     the static URLs plus every city page (same host)
//
// The Vue app mounts on #app and replaces the static markup on boot, so a
// human never sees a stale list for longer than the first paint. The data
// comes from the public API at build time; if the API is unreachable the
// script logs and exits 0 — a deploy must never fail over SEO extras.
//
// Hosting note: clean URLs resolve to these files when the static server
// tries `<path>/index.html` before falling back to the SPA shell (the usual
// static-site rule). If it falls back straight to index.html, the city
// files are simply unused — nothing breaks.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = resolve(ROOT, 'dist');
const SITE = (process.env.PRERENDER_SITE_URL || 'https://jinni.travel').replace(/\/+$/, '');
const API = (process.env.VITE_API_BASE_URL || process.env.PRERENDER_API_URL || 'https://api.jinni.travel').replace(/\/+$/, '');
const TIMEOUT_MS = 15000;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const abs = (u) => (u && u.startsWith('/api/') ? `${API}${u}` : u);

async function getJson(url) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'jinni-prerender/1.0' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally { clearTimeout(t); }
}

function loadShell() {
    const p = resolve(DIST, 'index.html');
    if (!existsSync(p)) throw new Error('dist/index.html missing — run vite build first');
    return readFileSync(p, 'utf8');
}

/** Replace <title>, description, canonical and og:* in the shell's head; add extra head HTML. */
function withHead(shell, { title, description, canonical, ogImage = null, extraHead = '', robots = null }) {
    let h = shell;
    h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
    h = h.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(description)}">`);
    h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${esc(canonical)}">`);
    h = h.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(title)}">`);
    h = h.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(description)}">`);
    h = h.replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${esc(canonical)}">`);
    if (ogImage) h = h.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${esc(ogImage)}">`);
    if (robots) extraHead += `\n    <meta name="robots" content="${esc(robots)}">`;
    if (extraHead) h = h.replace('</head>', `${extraHead}\n</head>`);
    return h;
}

/** Put static markup inside #app. The app replaces it on mount. A small
 *  inline style keeps the instant before mount looking intentional. */
const PRE_STYLE = `<style>#app>main.pre{max-width:820px;margin:0 auto;padding:40px 20px;font-family:Georgia,serif;color:#3c2a1e;text-align:center}#app>main.pre h1{font-size:2rem;margin:0 0 8px}#app>main.pre h2{font-size:1.2rem;margin:28px 0 8px}#app>main.pre ul{list-style:none;padding:0;margin:0}#app>main.pre li{margin:6px 0}#app>main.pre img{display:none}#app>main.pre a{color:#B7791F}</style>`;
function withBody(shell, inner) {
    const h = shell.includes(PRE_STYLE) ? shell : shell.replace('</head>', `${PRE_STYLE}\n</head>`);
    return h.replace('<div id="app"></div>', `<div id="app">${inner.replace('<main>', '<main class="pre">')}</div>`);
}

const CAT_LABELS = { restaurants: 'Restaurants', hotels: 'Hotels', historical: 'Historical sites', photo_spots: 'Photo spots', hidden_gems: 'Hidden gems', shopping: 'Shops', activities: 'Activities' };

function cityHtml(shell, page, en) {
    const { city, categories, order } = page;
    const cats = (order && order.length ? order : Object.keys(categories)).filter(c => categories[c] && categories[c].length);
    const all = cats.flatMap(c => categories[c]);
    const count = all.length;
    const title = `${city.name}: ${count} places to eat, see and discover — Jinni's Discoveries`;
    const description = `${count} restaurants, sights, hidden gems and activities in ${city.name} that Jinni knows and trusts. Free to browse — ask Jinni for what fits you.`;
    const canonical = `${SITE}/discover/${city.slug}`;
    const intro = String(en.discover?.intro || 'Places Jinni has verified in {city} — open to everyone, no account needed.').replace('{city}', city.name);
    const ld = {
        '@context': 'https://schema.org', '@type': 'ItemList', name: title, url: canonical, numberOfItems: count,
        itemListElement: all.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.name, ...(p.image ? { image: abs(p.image) } : {}) })),
    };
    const breadcrumbs = {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Jinni', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: city.name, item: canonical },
        ],
    };
    const extraHead = `    <script type="application/ld+json">${JSON.stringify(ld)}</script>\n    <script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>`;
    const sections = cats.map(c => `
      <section>
        <h2>${esc(CAT_LABELS[c] || c)}</h2>
        <ul>
${categories[c].map(p => `          <li>${p.image ? `<img src="${esc(abs(p.image))}" alt="${esc(p.name)} — ${esc(CAT_LABELS[c] || c)} in ${esc(city.name)}" width="380" height="253" loading="lazy"> ` : ''}<strong>${esc(p.name)}</strong>${p.region ? ` <span>${esc(p.region)}</span>` : ''}${Number.isFinite(p.rating) ? ` <span>★ ${esc(p.rating)}</span>` : ''}</li>`).join('\n')}
        </ul>
      </section>`).join('\n');
    const body = `
    <main>
      <nav><a href="/">Jinni</a> › ${esc(city.name)}</nav>
      <h1>Jinni's Discoveries — ${esc(city.name)}${city.country ? `, ${esc(city.country)}` : ''}</h1>
      <p>${esc(intro)}</p>
      <p><a href="/auth">Meet Jinni</a></p>
${sections}
      <footer><a href="/">Jinni</a> · <a href="/business">For Business</a> · <a href="/terms">Terms of Service</a> · <a href="/privacy">Privacy Policy</a></footer>
    </main>`;
    const first = all.find(p => p.image);
    const ogImage = first ? abs(first.image) : null;
    return withBody(withHead(shell, { title, description, canonical, ogImage, extraHead }), body);
}

function landingHtml(shell, en, cities) {
    const L = en.landing || {};
    const byCountry = new Map();
    for (const c of cities) { const k = c.country || c.countryCode || ''; if (!byCountry.has(k)) byCountry.set(k, []); byCountry.get(k).push(c); }
    const citiesHtml = cities.length ? `
      <section>
        <h2>${esc(L.cities?.title || 'Places Jinni has visited')}</h2>
        <p>${esc(L.cities?.subtitle || '')}</p>
${[...byCountry.entries()].map(([country, list]) => `        <h3>${esc(country)}</h3>
        <ul>
${list.map(c => `          <li><a href="/discover/${esc(c.slug)}">${esc(c.name)}</a> — ${esc(String(L.cities?.places || '{count} places').replace('{count}', c.count))}</li>`).join('\n')}
        </ul>`).join('\n')}
      </section>` : '';
    const f = L.features || {};
    const body = `
    <main>
      <h1>${esc(L.hero?.title || 'Where Will Jinni Take You?')}</h1>
      <p>${esc(L.hero?.subtitle || '')}</p>
      <p><a href="/auth">${esc(L.hero?.cta || 'Make a Wish')}</a></p>
      <section>
        <h2>${esc(f.title || '')}</h2>
        <ul>
          <li><strong>${esc(f.ai?.title || '')}</strong> ${esc(f.ai?.description || '')}</li>
          <li><strong>${esc(f.gems?.title || '')}</strong> ${esc(f.gems?.description || '')}</li>
          <li><strong>${esc(f.business?.title || '')}</strong> ${esc(f.business?.description || '')}</li>
        </ul>
      </section>
${citiesHtml}
      <footer><a href="/business">For Business</a> · <a href="/terms">Terms of Service</a> · <a href="/privacy">Privacy Policy</a></footer>
    </main>`;
    // The shell already carries the landing's title, description, canonical and JSON-LD.
    return withBody(shell, body);
}

function businessHtml(shell, en) {
    const B = en.businessLanding || {};
    const title = 'Jinni for Business — Get your place discovered by travelers';
    const description = `${B.hero?.title || 'Some businesses are meant to be found.'} ${B.hero?.subtitle || 'Let Jinni find them.'} List your restaurant, hotel, shop or activity on Jinni and be recommended to travelers who match.`;
    const body = `
    <main>
      <h1>${esc(B.hero?.title || 'Some Businesses Are Meant to Be Found.')}</h1>
      <p>${esc(B.hero?.subtitle || 'Let Jinni find them.')}</p>
      <p><a href="/business/apply">${esc(B.hero?.cta || 'Be Discovered')}</a></p>
      <h2>${esc(B.features?.title || 'How You Show Up')}</h2>
      <footer><a href="/">Jinni</a> · <a href="/business/terms">Business Terms</a> · <a href="/business/privacy">Business Privacy</a></footer>
    </main>`;
    return withBody(withHead(shell, { title, description, canonical: `${SITE}/business` }), body);
}

function sitemapXml(cities, day) {
    const fixed = ['/', '/business', '/business/apply', '/terms', '/privacy', '/business/terms', '/business/privacy'];
    const urls = [
        ...fixed.map(p => `  <url><loc>${SITE}${p}</loc><changefreq>monthly</changefreq></url>`),
        ...cities.map(c => `  <url><loc>${SITE}/discover/${c.slug}</loc><lastmod>${day}</lastmod><changefreq>weekly</changefreq></url>`),
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function write(rel, html) {
    const p = resolve(DIST, rel);
    mkdirSync(dirname(p), { recursive: true });
    writeFileSync(p, html);
}

(async () => {
    const shell = loadShell();
    const en = JSON.parse(readFileSync(resolve(ROOT, 'src/locales/en.json'), 'utf8'));
    let cities = [];
    try {
        const data = await getJson(`${API}/api/public/discover/cities`);
        cities = Array.isArray(data.cities) ? data.cities : [];
    } catch (err) {
        console.warn(`[prerender] cities unavailable (${err.message}) — static pages only`);
    }
    // Landing + business always; the shell for the landing keeps its own head.
    write('index.html', landingHtml(shell, en, cities));
    write('business/index.html', businessHtml(shell, en));
    const written = [];
    for (const c of cities) {
        try {
            const page = await getJson(`${API}/api/public/discover/${encodeURIComponent(c.slug)}`);
            if (!page.success) continue;
            write(`discover/${c.slug}/index.html`, cityHtml(shell, page, en));
            written.push(c);
        } catch (err) { console.warn(`[prerender] ${c.slug} skipped: ${err.message}`); }
    }
    write('sitemap.xml', sitemapXml(written, new Date().toISOString().slice(0, 10)));
    console.log(`[prerender] landing + business written · ${written.length}/${cities.length} city page(s) · sitemap with ${7 + written.length} URL(s) · API ${API}`);
})().catch(err => { console.warn(`[prerender] skipped: ${err.message}`); process.exit(0); });
