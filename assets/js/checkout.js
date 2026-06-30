/* ============================================================
   CHECKOUT — 3-step flow (details -> shipping -> payment),
   shipping cost in the total, and order emailed to the owner
   via Web3Forms (no backend).

   SETUP (one step, ~30s):
   1. Go to https://web3forms.com and enter  sujalparmar586@gmail.com
   2. Copy the Access Key it emails you.
   3. Paste it below as WEB3FORMS_ACCESS_KEY.
   ============================================================ */
(function () {
  const S = window.SYLRIX;
  const store = S.store;

  const ORDER_NOTIFY_EMAIL = 'sujalparmar586@gmail.com';
  const WEB3FORMS_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY'; // <-- paste your key here
  const configured = WEB3FORMS_ACCESS_KEY && WEB3FORMS_ACCESS_KEY !== 'YOUR_WEB3FORMS_ACCESS_KEY';

  const form = document.getElementById('checkout-form');
  if (!form) return;
  const linesEl = document.getElementById('summary-lines');
  const subtotalEl = document.getElementById('summary-subtotal');
  const shippingEl = document.getElementById('summary-shipping');
  const shipLabelEl = document.getElementById('summary-ship-label');
  const totalEl = document.getElementById('summary-total');
  const statusEl = document.getElementById('co-status');
  const submitBtn = document.getElementById('co-submit');

  let cache = { lines: [], subtotal: 0 };
  const currency = () => (cache.lines[0] && cache.lines[0].product.currency) || 'USD';
  const shipChoice = () => form.querySelector('input[name="shipping"]:checked') || { value: 'Standard', dataset: { cost: '14' } };
  const shipCost = () => parseFloat(shipChoice().dataset.cost || '0') || 0;

  // ---------- Summary ----------
  async function render() {
    const { lines, subtotal } = await store.cartDetailed();
    cache = { lines, subtotal };
    if (!lines.length) {
      linesEl.innerHTML = `<p class="text-muted">Your cart is empty. <a href="products.html" style="color:var(--primary)">Browse the catalog</a> to add compounds.</p>`;
      subtotalEl.textContent = store.money(0);
      totalEl.textContent = store.money(0);
      form.querySelectorAll('button').forEach((b) => { if (b.type !== 'button' || b.classList.contains('co-next')) b.disabled = true; });
      return;
    }
    linesEl.innerHTML = lines.map((l) => `
      <div class="summary-line">
        <span>${l.product.name} <span class="text-muted">× ${l.qty}</span><br><span class="text-muted" style="font-size:var(--text-xs)">${l.product.size} · ${l.product.purity}</span></span>
        <b>${store.money(l.product.price * l.qty, l.product.currency)}</b>
      </div>`).join('');
    paintTotals();
  }
  function paintTotals() {
    const c = currency();
    subtotalEl.textContent = store.money(cache.subtotal, c);
    shippingEl.textContent = store.money(shipCost(), c);
    shipLabelEl.textContent = `(${shipChoice().value})`;
    totalEl.textContent = store.money(cache.subtotal + shipCost(), c);
  }
  store.onChange(render);
  render();
  S.hydrateIcons();

  form.querySelectorAll('input[name="shipping"]').forEach((r) => r.addEventListener('change', paintTotals));

  // ---------- Stepper ----------
  const steps = Array.prototype.slice.call(form.querySelectorAll('.co-step'));
  const dots = Array.prototype.slice.call(document.querySelectorAll('.step-dot'));
  const lines = Array.prototype.slice.call(document.querySelectorAll('.step-line'));
  let current = 1;

  function goTo(n) {
    current = n;
    steps.forEach((s) => { s.hidden = parseInt(s.dataset.step, 10) !== n; });
    dots.forEach((d) => {
      const i = parseInt(d.dataset.dot, 10);
      d.classList.toggle('active', i === n);
      d.classList.toggle('done', i < n);
    });
    lines.forEach((l) => l.classList.toggle('done', parseInt(l.dataset.line, 10) < n));
    const active = steps.find((s) => parseInt(s.dataset.step, 10) === n);
    if (active) {
      const first = active.querySelector('input:not([type="radio"]):not([type="checkbox"]), textarea');
      if (first) try { first.focus({ preventScroll: true }); } catch (e) {}
    }
    document.getElementById('steps-nav').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function validateStep(n) {
    const sec = steps.find((s) => parseInt(s.dataset.step, 10) === n);
    if (!sec) return true;
    const controls = Array.prototype.slice.call(sec.querySelectorAll('input, select, textarea'));
    for (const c of controls) {
      if (!c.checkValidity()) { c.reportValidity(); return false; }
    }
    return true;
  }

  form.querySelectorAll('.co-next').forEach((btn) => btn.addEventListener('click', () => {
    if (validateStep(current)) goTo(parseInt(btn.dataset.goto, 10));
  }));
  form.querySelectorAll('.co-back').forEach((btn) => btn.addEventListener('click', () => goTo(parseInt(btn.dataset.goto, 10))));

  // ---------- Submit ----------
  function orderRef() { return 'PC-' + Date.now().toString(36).toUpperCase(); }

  function successScreen(ref, email, emailed) {
    document.getElementById('checkout-root').innerHTML = `
      <div class="empty-state card" style="grid-column:1/-1;padding:clamp(2rem,6vw,4rem)">
        <div style="font-size:3.5rem">✅</div>
        <h2>Order placed</h2>
        <p style="font-weight:600">Reference <span class="text-mono">${ref}</span></p>
        <p class="text-muted" style="max-width:54ch">${emailed
          ? `Thanks! A confirmation has been emailed and our team will send a secure payment link to <strong>${email}</strong> shortly.`
          : `Thanks! Your order was captured. To receive orders by email, add a Web3Forms key in <span class="text-mono">assets/js/checkout.js</span> (orders then arrive at <strong>${ORDER_NOTIFY_EMAIL}</strong>).`}</p>
        <a class="btn btn-primary" href="products.html" style="margin-top:1rem">Continue shopping</a>
      </div>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!cache.lines.length) { statusEl.textContent = 'Your cart is empty.'; return; }
    // validate all steps; jump to the first that fails
    for (const n of [1, 2, 3]) {
      const sec = steps.find((s) => parseInt(s.dataset.step, 10) === n);
      const bad = Array.prototype.slice.call(sec.querySelectorAll('input, select, textarea')).find((c) => !c.checkValidity());
      if (bad) { goTo(n); setTimeout(() => bad.reportValidity(), 120); return; }
    }

    const get = (id) => (document.getElementById(id).value || '').trim();
    const ref = orderRef();
    const c = currency();
    const itemsText = cache.lines.map((l) => `${l.qty} x ${l.product.name} (${l.product.size}) — ${store.money(l.product.price * l.qty, l.product.currency)}`).join('\n');
    const total = store.money(cache.subtotal + shipCost(), c);
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
            shipping_address: `${get('co-addr')}, ${get('co-city')}, ${get('co-state')} ${get('co-zip')}, ${get('co-country')}`,
            shipping_method: `${shipChoice().value} (${store.money(shipCost(), c)})`,
            payment_method: payment,
            items: itemsText,
            subtotal: store.money(cache.subtotal, c),
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
})();
