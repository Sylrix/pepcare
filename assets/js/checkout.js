/* ============================================================
   CHECKOUT — renders the order summary from the cart and handles
   the demo "place order" flow (no live payment processor).
   ============================================================ */
(function () {
  const S = window.SYLRIX;
  const store = S.store;
  const linesEl = document.getElementById('summary-lines');
  const totalEl = document.getElementById('summary-total');
  const form = document.getElementById('checkout-form');
  if (!linesEl) return;

  async function render() {
    const { lines, subtotal } = await store.cartDetailed();
    if (!lines.length) {
      linesEl.innerHTML = `<p class="text-muted">Your cart is empty. <a href="products.html" style="color:var(--primary)">Browse the catalog</a> to add compounds.</p>`;
      totalEl.textContent = store.money(0);
      if (form) form.querySelector('button[type="submit"]').disabled = true;
      return;
    }
    linesEl.innerHTML = lines.map((l) => `
      <div class="summary-line">
        <span>${l.product.name} <span class="text-muted">× ${l.qty}</span><br><span class="text-muted" style="font-size:var(--text-xs)">${l.product.size} · ${l.product.purity}</span></span>
        <b>${store.money(l.product.price * l.qty, l.product.currency)}</b>
      </div>`).join('');
    totalEl.textContent = store.money(subtotal, lines[0].product.currency);
  }

  store.onChange(render);
  render();
  S.hydrateIcons();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      store.clear();
      document.getElementById('checkout-root').innerHTML = `
        <div class="empty-state card" style="grid-column:1/-1;padding:clamp(2rem,6vw,4rem)">
          <div style="font-size:3.5rem">✅</div>
          <h2>Order received (demo)</h2>
          <p class="text-muted" style="max-width:48ch">Thanks! In a live store this would create an order and route payment through your connected gateway. Connect a backend + high-risk-friendly processor to go live.</p>
          <a class="btn btn-primary" href="products.html" style="margin-top:1rem">Back to catalog</a>
        </div>`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
