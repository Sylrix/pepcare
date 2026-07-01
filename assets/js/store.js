/* ============================================================
   STORE, cart state (localStorage) + tiny pub/sub.
   Catalog loading + currency formatting live here too so every
   page shares one source of truth.
   ============================================================ */
(function () {
  const KEY = 'sylrix.cart.v1';
  const FAV_KEY = 'sylrix.fav.v1';
  const listeners = new Set();

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  let cart = read(KEY);   // [{id, qty}]
  let favs = read(FAV_KEY); // [id]

  function emit() {
    write(KEY, cart);
    write(FAV_KEY, favs);
    listeners.forEach((fn) => fn({ cart, favs }));
  }

  // ---- Catalog ----
  let catalogPromise = null;
  function basePrefix() {
    // works at user-site root and project subpath; pages are all flat at root
    return '';
  }
  function pruneCart(products) {
    // drop cart lines whose product no longer exists (e.g. discontinued item)
    const ids = new Set((products || []).map((p) => p.id));
    const kept = cart.filter((l) => ids.has(l.id));
    if (kept.length !== cart.length) { cart = kept; emit(); }
  }
  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(basePrefix() + 'assets/data/products.json')
        .then((r) => { if (!r.ok) throw new Error('catalog ' + r.status); return r.json(); })
        .then((data) => { pruneCart(data.products); return data; })
        .catch((e) => { console.error('Catalog load failed', e); return { categories: [], products: [] }; });
    }
    return catalogPromise;
  }

  const Store = {
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    loadCatalog,

    getCart() { return cart.slice(); },
    count() { return cart.reduce((n, l) => n + l.qty, 0); },

    add(id, qty = 1) {
      const line = cart.find((l) => l.id === id);
      if (line) line.qty += qty;
      else cart.push({ id, qty });
      emit();
    },
    setQty(id, qty) {
      const line = cart.find((l) => l.id === id);
      if (!line) return;
      line.qty = Math.max(0, qty);
      if (line.qty === 0) cart = cart.filter((l) => l.id !== id);
      emit();
    },
    remove(id) { cart = cart.filter((l) => l.id !== id); emit(); },
    clear() { cart = []; emit(); },

    // ---- Favourites ----
    isFav(id) { return favs.includes(id); },
    toggleFav(id) {
      if (favs.includes(id)) favs = favs.filter((x) => x !== id);
      else favs.push(id);
      emit();
      return favs.includes(id);
    },

    // ---- Pricing helpers ----
    money(n, currency = 'USD') {
      try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n); }
      catch { return '$' + Number(n).toFixed(2); }
    },
    async cartDetailed() {
      const { products } = await loadCatalog();
      const byId = Object.fromEntries(products.map((p) => [p.id, p]));
      const lines = cart.map((l) => ({ ...l, product: byId[l.id] })).filter((l) => l.product);
      const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
      return { lines, subtotal };
    },
  };

  window.SYLRIX = window.SYLRIX || {};
  window.SYLRIX.store = Store;
})();
