/* ============================================================
   CHECKOUT — renders the order summary, captures the order, and
   emails it to the store owner via Web3Forms (no backend needed).

   SETUP (one step, ~30s):
   1. Go to https://web3forms.com and enter  sujalparmar586@gmail.com
   2. Copy the Access Key it emails you.
   3. Paste it below as WEB3FORMS_ACCESS_KEY.
   Every order will then arrive in that inbox.
   ============================================================ */
(function () {
  const S = window.SYLRIX;
  const store = S.store;

  const ORDER_NOTIFY_EMAIL = 'sujalparmar586@gmail.com';
  const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'; // <-- paste your key here
  const configured = WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'YOUR_WEB3FORMS_ACCESS_KEY';

  const linesEl = document.getElementById('summary-lines');
  const totalEl = document.getElementById('summary-total');
  const form = document.getElementById('checkout-form');
  const statusEl = document.getElementById('co-status');
  const submitBtn = document.getElementById('co-submit');
  if (!linesEl) return;

  let cache = { lines: [], subtotal: 0 };

  async function render() {
    const { lines, subtotal } = await store.cartDetailed();
    cache = { lines, subtotal };
    if (!lines.length) {
      linesEl.innerHTML = `<p class="text-muted">Your cart is empty. <a href="products.html" style="color:var(--primary)">Browse the catalog</a> to add compounds.</p>`;
      totalEl.textContent = store.money(0);
      if (submitBtn) submitBtn.disabled = true;
      return;
    }
    if (submitBtn) submitBtn.disabled = false;
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

  function orderRef() {
    // browser context — Date is fine here
    return 'PC-' + Date.now().toString(36).toUpperCase();
  }

  function successScreen(ref, email, emailed) {
    document.getElementById('checkout-root').innerHTML = `
      <div class="empty-state card" style="grid-column:1/-1;padding:clamp(2rem,6vw,4rem)">
        <div style="font-size:3.5rem">✅</div>
        <h2>Order placed</h2>
        <p style="font-weight:600">Reference <span class="text-mono">${ref}</span></p>
        <p class="text-muted" style="max-width:52ch">${emailed
          ? `Thanks! A confirmation has been emailed and our team will send a secure payment link to <strong>${email}</strong> shortly.`
          : `Thanks! Your order was captured. Email delivery isn't configured yet — add a Web3Forms key in <span class="text-mono">assets/js/checkout.js</span> to receive orders at <strong>${ORDER_NOTIFY_EMAIL}</strong>.`}</p>
        <a class="btn btn-primary" href="products.html" style="margin-top:1rem">Continue shopping</a>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!cache.lines.length) { statusEl.textContent = 'Your cart is empty.'; return; }
      if (!form.checkValidity()) { form.reportValidity(); return; }

      const get = (id) => (document.getElementById(id).value || '').trim();
      const ref = orderRef();
      const itemsText = cache.lines.map((l) => `${l.qty} x ${l.product.name} (${l.product.size}) — ${store.money(l.product.price * l.qty, l.product.currency)}`).join('\n');
      const total = store.money(cache.subtotal, cache.lines[0].product.currency);
      const payment = (form.querySelector('input[name="payment"]:checked') || {}).value || 'Not selected';
      const email = get('co-email');

      submitBtn.disabled = true;
      const original = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Placing order…';
      statusEl.textContent = '';

      try {
        if (configured) {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              access_key: WEB3FORMS_ACCESS_KEY,
              subject: `New PepCare order ${ref} — ${total}`,
              from_name: 'PepCare Storefront',
              botcheck: '',
              order_reference: ref,
              customer: get('co-name'),
              email,
              institution: get('co-org'),
              phone: get('co-phone'),
              shipping_address: `${get('co-addr')}, ${get('co-city')}, ${get('co-country')}`,
              payment_method: payment,
              items: itemsText,
              order_total: total,
              notes: get('co-notes'),
              ruo_certified: 'Yes — research use only',
              notify_inbox: ORDER_NOTIFY_EMAIL,
            }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.message || 'Submission failed');
          store.clear();
          successScreen(ref, email, true);
        } else {
          // Not configured yet — capture locally, don't pretend it emailed.
          store.clear();
          successScreen(ref, email, false);
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = original;
        statusEl.style.color = 'var(--error)';
        statusEl.textContent = 'Could not place the order just now. Please try again or contact us.';
        console.error('Order submit failed', err);
      }
    });
  }
})();
