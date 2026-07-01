/* ============================================================
   CART, slide-out drawer, add-to-cart with fly animation,
   quantity controls, favourites. Decoupled via SYLRIX.openCart.
   ============================================================ */
(function () {
  const S = window.SYLRIX;
  const store = S.store;
  const icon = S.icon;

  // ---------- Inject drawer ----------
  const host = document.createElement('div');
  host.innerHTML = `
    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" aria-hidden="true">
      <div class="drawer__head">
        <span class="drawer__title">Your cart</span>
        <button class="icon-btn" id="cart-close" aria-label="Close cart">${icon('close', { size: 22 })}</button>
      </div>
      <div class="drawer__body" id="cart-body"></div>
      <div class="drawer__foot" id="cart-foot" hidden>
        <div class="cart-total"><span class="text-muted">Subtotal</span> <b id="cart-subtotal">$0.00</b></div>
        <p class="text-muted" style="font-size:var(--text-xs)">Taxes, shipping &amp; cold-chain handling calculated at checkout.</p>
        <a class="btn btn-primary btn-block btn-lg" href="checkout.html">Proceed to checkout ${icon('arrow-right', { size: 18 })}</a>
        <button class="btn btn-ghost btn-block btn-sm" id="cart-clear">Clear cart</button>
      </div>
    </aside>`;
  document.body.appendChild(host);

  const overlay = document.getElementById('overlay');
  const drawer = document.getElementById('cart-drawer');
  const body = document.getElementById('cart-body');
  const foot = document.getElementById('cart-foot');
  const subtotalEl = document.getElementById('cart-subtotal');

  let releaseTrap = null;
  let lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    render();
    document.getElementById('cart-close').focus();
    if (S.trapFocus) releaseTrap = S.trapFocus(drawer);
  }
  function close() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  S.openCart = open;
  document.getElementById('cart-close').addEventListener('click', close);
  overlay.addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.getElementById('cart-clear').addEventListener('click', () => { store.clear(); S.toast('Cart cleared', 'trash'); });

  const vialThumb = `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary)">${S.icons.flask}</svg>`;

  async function render() {
    const { lines, subtotal } = await store.cartDetailed();
    if (!lines.length) {
      body.innerHTML = `<div class="cart-empty">
        <div style="font-size:2.5rem;margin-bottom:.5rem">🧪</div>
        <p style="font-weight:600;color:var(--on-surface)">Your cart is empty</p>
        <p style="font-size:var(--text-sm);margin:.4rem 0 1.2rem">Add research compounds to get started.</p>
        <a class="btn btn-secondary btn-sm" href="products.html">Browse catalog</a>
      </div>`;
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = lines.map((l) => `
      <div class="cart-line">
        <div class="cart-line__thumb">${l.product.image
          ? `<picture><source srcset="${l.product.image.replace(/\.png$/, '.webp')}" type="image/webp"><img src="${l.product.image}" alt="${l.product.name}" loading="lazy" decoding="async"></picture>`
          : vialThumb}</div>
        <div>
          <div class="cart-line__name">${l.product.name}</div>
          <div class="cart-line__meta">${l.product.size} · ${store.money(l.product.price, l.product.currency)}</div>
          <button type="button" class="cart-line__remove" data-remove="${l.id}" aria-label="Remove ${l.product.name} from cart">Remove</button>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.4rem">
          <div class="qty">
            <button type="button" data-dec="${l.id}" aria-label="Decrease quantity of ${l.product.name}, currently ${l.qty}">−</button>
            <span aria-hidden="true">${l.qty}</span>
            <button type="button" data-inc="${l.id}" aria-label="Increase quantity of ${l.product.name}, currently ${l.qty}">+</button>
          </div>
          <b style="font-size:var(--text-sm)">${store.money(l.product.price * l.qty, l.product.currency)}</b>
        </div>
      </div>`).join('');
    subtotalEl.textContent = store.money(subtotal, lines[0].product.currency);
  }

  body.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]');
    const dec = e.target.closest('[data-dec]');
    const rm = e.target.closest('[data-remove]');
    if (inc) { const id = inc.dataset.inc; const q = lineQty(id); if (q > 0) store.setQty(id, q + 1); }
    if (dec) { const id = dec.dataset.dec; const q = lineQty(id); if (q > 0) store.setQty(id, q - 1); }
    if (rm) { store.remove(rm.dataset.remove); }
  });
  function lineQty(id) { const l = store.getCart().find((x) => x.id === id); return l ? l.qty : 0; }

  store.onChange(() => { if (drawer.classList.contains('open')) render(); });

  // ---------- Fly-to-cart ----------
  function fly(fromEl) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cartBtn = document.getElementById('cart-open');
    if (!fromEl || !cartBtn) return;
    const a = fromEl.getBoundingClientRect();
    const b = cartBtn.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'fly-ghost';
    ghost.innerHTML = icon('flask', { size: 20 });
    ghost.style.left = a.left + a.width / 2 - 20 + 'px';
    ghost.style.top = a.top + a.height / 2 - 20 + 'px';
    document.body.appendChild(ghost);
    const dx = (b.left + b.width / 2) - (a.left + a.width / 2);
    const dy = (b.top + b.height / 2) - (a.top + a.height / 2);
    ghost.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(1.1)`, opacity: 1, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.2 },
    ], { duration: 750, easing: 'cubic-bezier(0.5, -0.2, 0.3, 1)' }).onfinish = () => ghost.remove();
  }

  // ---------- Delegated: add-to-cart + favourites anywhere ----------
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      const id = addBtn.dataset.add;
      store.add(id, 1);
      fly(addBtn);
      S.toast('Added to cart', 'check-circle');
      addBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.9)' }, { transform: 'scale(1)' }], { duration: 280, easing: 'ease' });
    }
    const favBtn = e.target.closest('[data-fav]');
    if (favBtn) {
      const id = favBtn.dataset.fav;
      const name = favBtn.dataset.favName || 'item';
      const on = store.toggleFav(id);
      favBtn.classList.toggle('active', on);
      favBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      favBtn.setAttribute('aria-label', on ? `Remove ${name} from favourites` : `Save ${name} to favourites`);
      favBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
      S.toast(on ? 'Saved to favourites' : 'Removed from favourites', 'heart');
    }
  });
})();
