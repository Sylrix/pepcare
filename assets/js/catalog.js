/* ============================================================
   CATALOG — renders product cards, the filterable catalog page,
   product detail pages, featured grids, and category tiles.
   Each product gets a unique, deterministic "molecule" graphic
   so the store looks rich without external image assets.
   ============================================================ */
(function () {
  const S = window.SYLRIX;
  const store = S.store;
  const icon = S.icon;
  const page = document.body.dataset.page;

  const CAT_COLOR = {
    'research-peptides': ['#6366F1', '#A3E635'],
    'amino-acids': ['#06B6D4', '#818CF8'],
    'reference-standards': ['#8B5CF6', '#22D3EE'],
    'biochem-reagents': ['#10B981', '#A3E635'],
    'assay-kits': ['#F59E0B', '#F472B6'],
    'lab-accessories': ['#0EA5E9', '#34D399'],
  };

  // ---------- deterministic PRNG from string ----------
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function prng(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  // ---------- molecule generator ----------
  function molecule(product, big) {
    const [c1, c2] = CAT_COLOR[product.categoryId] || ['#6366F1', '#06B6D4'];
    const rnd = prng(hash(product.id));
    const gid = 'g_' + String(product.id).replace(/[^a-zA-Z0-9_-]/g, '_').replace(/^[-0-9]/, '_');
    const cx = 100, cy = 80;
    const n = 5 + Math.floor(rnd() * 2); // 5-6 ring atoms
    const R = 42 + rnd() * 8;
    const start = rnd() * Math.PI * 2;
    const ring = [];
    for (let i = 0; i < n; i++) {
      const a = start + (i / n) * Math.PI * 2;
      ring.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, r: 7 + rnd() * 3 });
    }
    // pendant atoms
    const pend = [];
    const pc = 2 + Math.floor(rnd() * 2);
    for (let i = 0; i < pc; i++) {
      const base = ring[Math.floor(rnd() * ring.length)];
      const a = rnd() * Math.PI * 2;
      pend.push({ x: base.x + Math.cos(a) * 26, y: base.y + Math.sin(a) * 26, r: 4 + rnd() * 2, from: base });
    }
    let bonds = '';
    for (let i = 0; i < n; i++) { const a = ring[i], b = ring[(i + 1) % n]; bonds += `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}"/>`; }
    // a couple of cross bonds to center
    bonds += `<line x1="${ring[0].x.toFixed(1)}" y1="${ring[0].y.toFixed(1)}" x2="${cx}" y2="${cy}"/>`;
    bonds += `<line x1="${ring[Math.floor(n / 2)].x.toFixed(1)}" y1="${ring[Math.floor(n / 2)].y.toFixed(1)}" x2="${cx}" y2="${cy}"/>`;
    pend.forEach((p) => { bonds += `<line x1="${p.from.x.toFixed(1)}" y1="${p.from.y.toFixed(1)}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}"/>`; });
    let atoms = `<circle cx="${cx}" cy="${cy}" r="9" fill="url(#${gid})"/>`;
    ring.forEach((a, i) => { atoms += `<circle cx="${a.x.toFixed(1)}" cy="${a.y.toFixed(1)}" r="${a.r.toFixed(1)}" fill="${i % 3 === 0 ? c2 : c1}"/>`; });
    pend.forEach((p) => { atoms += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.r.toFixed(1)}" fill="#fff" stroke="${c1}" stroke-width="1.5"/>`; });
    const cls = big ? 'mol mol--big' : 'mol';
    return `<svg class="${cls} product-card__viz" viewBox="0 0 200 160" role="img" aria-label="${product.name} molecular illustration" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="${gid}"><stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="${c1}"/></radialGradient></defs>
      <g class="mol__bonds" stroke="${c1}" stroke-width="2.5" stroke-linecap="round" opacity="0.55">${bonds}</g>
      <g class="mol__atoms">${atoms}</g>
    </svg>`;
  }

  function badgeHtml(p) {
    if (!p.badge) return '';
    const cls = /new/i.test(p.badge) ? 'badge-new' : /ref/i.test(p.badge) ? 'badge-accent' : 'badge';
    return `<span class="badge ${cls}">${p.badge}</span>`;
  }

  function card(p) {
    const fav = store.isFav(p.id) ? 'active' : '';
    return `<article class="product-card" data-reveal="up">
      <div class="product-card__media">
        ${molecule(p)}
        <div class="product-card__badges">${badgeHtml(p)}<span class="ruo-tag">RUO</span></div>
        <button class="product-card__fav ${fav}" data-fav="${p.id}" data-fav-name="${p.name}" aria-pressed="${fav ? 'true' : 'false'}" aria-label="${fav ? 'Remove ' + p.name + ' from favourites' : 'Save ' + p.name + ' to favourites'}">${icon('heart', { size: 18 })}</button>
      </div>
      <div class="product-card__body">
        <span class="product-card__cat">${catName(p.categoryId)}</span>
        <h3 class="product-card__title"><a href="product.html?slug=${p.slug}">${p.name}</a></h3>
        <p class="product-card__desc">${p.shortDescription}</p>
        <div class="product-card__meta">
          <span class="spec-pill">${p.purity}</span>
          <span class="spec-pill">${p.size}</span>
        </div>
        <div class="product-card__foot">
          <div class="price">${store.money(p.price, p.currency)} <small>/ ${p.size}</small></div>
          <button class="btn btn-primary btn-sm" data-add="${p.id}" aria-label="Add ${p.name} to cart" ${p.inStock ? '' : 'disabled'}>
            ${icon('cart', { size: 16 })} ${p.inStock ? 'Add' : 'Out'}
          </button>
        </div>
      </div>
    </article>`;
  }

  let CATS = [];
  const catName = (id) => (CATS.find((c) => c.id === id) || {}).name || 'Research';

  // ---------- init ----------
  store.loadCatalog().then(({ categories, products }) => {
    CATS = categories;

    // Featured grid (home)
    const feat = document.getElementById('featured-grid');
    if (feat) {
      const ranked = products.slice().sort((a, b) => (b.priority || 0) - (a.priority || 0) || (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || a.name.localeCompare(b.name));
      feat.innerHTML = ranked.slice(0, 8).map(card).join('');
      reobserve(feat);
    }

    // Category tiles (home)
    const catGrid = document.getElementById('category-grid');
    if (catGrid) {
      catGrid.innerHTML = categories.map((c) => {
        const count = products.filter((p) => p.categoryId === c.id).length;
        return `<a class="cat-tile" href="products.html?cat=${c.id}" data-reveal="up">
          <div class="cat-tile__icon" style="--c1:${(CAT_COLOR[c.id] || [])[0] || 'var(--primary)'}">${icon(iconForCat(c.icon), { size: 26 })}</div>
          <div><h3>${c.name}</h3><p>${count} compounds</p></div>
          ${icon('arrow-right', { size: 20 })}
        </a>`;
      }).join('');
      reobserve(catGrid);
    }

    if (page === 'catalog') initCatalog(products, categories);
    if (page === 'product') initProduct(products);
    S.hydrateIcons();
  });

  function iconForCat(k) {
    return ({ peptide: 'dna', 'amino-acid': 'atom', reference: 'award', reagent: 'flask', kit: 'package', accessory: 'beaker' })[k] || 'flask';
  }
  function reobserve(scope) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { scope.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('revealed')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } }), { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    scope.querySelectorAll('[data-reveal]').forEach((e) => io.observe(e));
  }

  // ---------- Catalog page ----------
  function initCatalog(products, categories) {
    const grid = document.getElementById('catalog-grid');
    const chipsWrap = document.getElementById('catalog-cats');
    const search = document.getElementById('catalog-search');
    const sort = document.getElementById('catalog-sort');
    const countEl = document.getElementById('catalog-count');
    const params = new URLSearchParams(location.search);
    let state = { q: '', cat: params.get('cat') || 'all', sort: 'featured' };

    chipsWrap.innerHTML = [{ id: 'all', name: 'All compounds' }, ...categories]
      .map((c) => `<button class="chip" data-cat="${c.id}" aria-pressed="${c.id === state.cat}">${c.name}</button>`).join('');

    function apply() {
      let list = products.slice();
      if (state.cat !== 'all') list = list.filter((p) => p.categoryId === state.cat);
      if (state.q) {
        const q = state.q.toLowerCase();
        list = list.filter((p) => [p.name, p.shortDescription, p.casNumber, (p.tags || []).join(' '), (p.researchAreas || []).join(' ')].join(' ').toLowerCase().includes(q));
      }
      const s = state.sort;
      list.sort((a, b) =>
        s === 'price-asc' ? a.price - b.price :
        s === 'price-desc' ? b.price - a.price :
        s === 'rating' ? b.rating - a.rating :
        s === 'name' ? a.name.localeCompare(b.name) :
        (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.rating - a.rating);

      countEl.textContent = `${list.length} ${list.length === 1 ? 'result' : 'results'}`;
      grid.innerHTML = list.length ? list.map(card).join('')
        : `<div class="empty-state"><div style="font-size:3rem">🔬</div><h3>No compounds found</h3><p class="text-muted">Try a different search term or category.</p><button class="btn btn-secondary btn-sm" id="reset-filters">Reset filters</button></div>`;
      reobserve(grid);
      S.hydrateIcons();
      chipsWrap.querySelectorAll('.chip').forEach((ch) => ch.setAttribute('aria-pressed', ch.dataset.cat === state.cat));
      const rb = document.getElementById('reset-filters');
      if (rb) rb.addEventListener('click', () => { state = { q: '', cat: 'all', sort: 'featured' }; search.value = ''; sort.value = 'featured'; apply(); });
    }

    chipsWrap.addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) { state.cat = b.dataset.cat; apply(); } });
    let t; search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { state.q = search.value.trim(); apply(); }, 160); });
    sort.addEventListener('change', () => { state.sort = sort.value; apply(); });
    if (location.hash === '#search') search.focus();
    apply();
  }

  // ---------- Product detail ----------
  function initProduct(products) {
    const slug = new URLSearchParams(location.search).get('slug');
    const p = products.find((x) => x.slug === slug);
    const root = document.getElementById('product-root');
    if (!p) { root.innerHTML = `<div class="empty-state"><h2>Product not found</h2><p class="text-muted">This compound may have been moved.</p><a class="btn btn-primary" href="products.html">Back to catalog</a></div>`; return; }

    document.title = `${p.name} — PepCare`;
    const BASE = 'https://sylrix.github.io/pepcare/';
    const pageUrl = BASE + 'product.html?slug=' + p.slug;
    const upsertMeta = (sel, val) => {
      let el = document.head.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        const m = sel.match(/\[(name|property)="([^"]+)"\]/);
        if (m) el.setAttribute(m[1], m[2]);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };
    const titleTag = `${p.name} — PepCare`;
    upsertMeta('meta[name="description"]', p.shortDescription);
    upsertMeta('meta[property="og:title"]', titleTag);
    upsertMeta('meta[property="og:description"]', p.shortDescription);
    upsertMeta('meta[property="og:url"]', pageUrl);
    upsertMeta('meta[name="twitter:title"]', titleTag);
    upsertMeta('meta[name="twitter:description"]', p.shortDescription);
    let canon = document.head.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.setAttribute('rel', 'canonical'); document.head.appendChild(canon); }
    canon.setAttribute('href', pageUrl);

    const specs = [
      ['CAS Number', p.casNumber], ['Molecular Formula', p.molecularFormula], ['Molar Mass', p.molarMass],
      ['Purity', p.purity], ['Physical Form', p.form], ['Pack Size', p.size],
      ['Sequence', p.sequence], ['Components', (p.components || []).join(' · ')], ['Storage', p.storage],
    ].filter(([, v]) => v);

    root.innerHTML = `
      <nav class="breadcrumb" aria-label="Breadcrumb" data-reveal="fade">
        <a href="index.html">Home</a> ${icon('chevron-right', { size: 14 })}
        <a href="products.html">Catalog</a> ${icon('chevron-right', { size: 14 })}
        <a href="products.html?cat=${p.categoryId}">${catName(p.categoryId)}</a> ${icon('chevron-right', { size: 14 })}
        <span>${p.name}</span>
      </nav>
      <div class="product-detail">
        <div class="product-detail__media card" data-reveal="left">
          <div class="product-detail__viz">${molecule(p, true)}</div>
          <div class="product-detail__badges">${badgeHtml(p)}<span class="badge-verified badge">${icon('shield-check', { size: 14 })} Verified purity</span></div>
        </div>
        <div class="product-detail__info" data-reveal="right">
          <span class="product-card__cat">${catName(p.categoryId)}</span>
          <h1>${p.name}</h1>
          <div class="cluster" style="gap:1rem"><span class="ruo-tag">Research Use Only</span> <span class="badge badge-verified">${icon('shield-check', { size: 14 })} HPLC-verified</span></div>
          <p class="lead">${p.shortDescription}</p>
          <div class="product-detail__price"><span class="price" style="font-size:var(--text-3xl)">${store.money(p.price, p.currency)}</span> <span class="text-muted">/ ${p.size}</span></div>
          <div class="stock-dot ${p.inStock ? '' : 'out'}">${p.inStock ? 'In stock — ships within 24h' : 'Currently out of stock'}</div>
          <div class="product-detail__buy">
            <div class="qty qty--lg" id="pd-qty">
              <button data-q="-1" aria-label="Decrease">−</button><span id="pd-qty-val">1</span><button data-q="1" aria-label="Increase">+</button>
            </div>
            <button class="btn btn-primary btn-lg" id="pd-add" data-add="${p.id}" aria-label="Add ${p.name} to cart" ${p.inStock ? '' : 'disabled'}>${icon('cart', { size: 18 })} Add to cart</button>
            <button class="btn btn-secondary btn-icon btn-lg ${store.isFav(p.id) ? 'active' : ''}" data-fav="${p.id}" data-fav-name="${p.name}" aria-pressed="${store.isFav(p.id) ? 'true' : 'false'}" aria-label="${store.isFav(p.id) ? 'Remove ' + p.name + ' from favourites' : 'Save ' + p.name + ' to favourites'}">${icon('heart', { size: 20 })}</button>
          </div>
          <div class="product-perks">
            <span>${icon('shield-check', { size: 18 })} Third-party tested</span>
            <span>${icon('file-text', { size: 18 })} Batch COA included</span>
            <span>${icon('snowflake', { size: 18 })} Cold-chain shipping</span>
          </div>
          <a class="coa-card" href="#" id="coa-btn">
            <span class="coa-card__icon">${icon('file-check', { size: 22 })}</span>
            <span><b>Certificate of Analysis</b><small>HPLC &amp; MS identity + purity data for this lot</small></span>
            ${icon('arrow-up-right', { size: 18 })}
          </a>
        </div>
      </div>
      <div class="product-tabs section--tight" data-reveal="up">
        <div class="prose">
          <h2>About this compound</h2>
          <p>${p.longDescription}</p>
          <h3>Research areas</h3>
          <div class="cluster">${(p.researchAreas || []).map((r) => `<span class="chip" aria-pressed="false">${r}</span>`).join('') || '<span class="text-muted">General laboratory research</span>'}</div>
        </div>
        <div class="spec-table card">
          <h3 style="padding:1.25rem 1.25rem 0">Specifications</h3>
          <dl>${specs.map(([k, v]) => `<div class="spec-row"><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
          <p class="ruo-note">${icon('lock', { size: 14 })} For Research Use Only. Not for human or veterinary use.</p>
        </div>
      </div>
      <section class="section--tight" data-reveal="fade">
        <div class="section-head left"><h2>Related compounds</h2></div>
        <div class="auto-grid" id="related-grid"></div>
      </section>`;

    // qty
    let q = 1;
    const qv = document.getElementById('pd-qty-val');
    document.getElementById('pd-qty').addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]'); if (!b) return;
      q = Math.max(1, q + parseInt(b.dataset.q, 10)); qv.textContent = q;
    });
    document.getElementById('pd-add').addEventListener('click', (e) => { /* delegated add adds 1; add remaining */ if (q > 1) store.add(p.id, q - 1); });
    document.getElementById('coa-btn').addEventListener('click', (e) => { e.preventDefault(); S.toast('Demo: COA download requires a connected backend', 'file-text'); });

    const related = products.filter((x) => x.categoryId === p.categoryId && x.id !== p.id).slice(0, 4);
    const rg = document.getElementById('related-grid');
    rg.innerHTML = (related.length ? related : products.filter((x) => x.id !== p.id).slice(0, 4)).map(card).join('');
    reobserve(root);
    S.hydrateIcons();

    // JSON-LD product schema
    const ld = document.createElement('script'); ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.shortDescription,
      sku: p.id, category: catName(p.categoryId), brand: { '@type': 'Brand', name: 'PepCare' },
      offers: { '@type': 'Offer', price: p.price, priceCurrency: p.currency, availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
    });
    document.head.appendChild(ld);
  }
})();
