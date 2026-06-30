/* ============================================================
   LAYOUT — injects shared chrome (RUO banner, navbar, mobile menu,
   footer, scroll progress, toast host) and wires global behaviour
   (theme, scroll state, reveal-on-scroll, counters, marquee).
   ============================================================ */
(function () {
  const S = window.SYLRIX;
  const icon = S.icon;
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const page = document.body.dataset.page || here.replace('.html', '') || 'home';

  const NAV = [
    { label: 'Home', href: 'index.html', key: 'home' },
    { label: 'Catalog', href: 'products.html', key: 'catalog' },
    { label: 'About', href: 'about.html', key: 'about' },
    { label: 'FAQ', href: 'faq.html', key: 'faq' },
    { label: 'Contact', href: 'contact.html', key: 'contact' },
  ];
  const isActive = (k) => (k === page || (k === 'catalog' && page === 'product')) ? 'aria-current="page"' : '';

  const RUO_NOTE = 'For Research Use Only — Not for human or veterinary consumption. Sold to qualified researchers & institutions only.';
  const FOOT_ABOUT = 'Sylrix Research provides high-purity, third-party-verified research compounds with batch-specific Certificates of Analysis, sold to qualified researchers and institutions for laboratory use only.';
  const FOOT_LEGAL = 'All products are for Research Use Only (RUO). Not for human or veterinary consumption, and not for clinical, diagnostic, or therapeutic use.';

  const brandMark = `
    <svg class="brand__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="bm" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="#4F46E5"/><stop offset="1" stop-color="#06B6D4"/>
        </linearGradient>
      </defs>
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="url(#bm)"/>
      <path d="M13 11c0 5 14 7 14 13a4.5 4.5 0 0 1-9 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M27 29c0-5-14-7-14-13a4.5 4.5 0 0 1 9 0" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.85"/>
      <circle cx="13" cy="11" r="2.4" fill="#A3E635"/>
      <circle cx="27" cy="29" r="2.4" fill="#fff"/>
    </svg>`;
  const brand = (cls = '') => `<a class="brand ${cls}" href="index.html" aria-label="Sylrix Research home">${brandMark}<span class="brand__name">Sylrix<b>Research</b></span></a>`;

  // ---------- Build chrome ----------
  const top = document.createElement('div');
  top.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="scroll-progress" aria-hidden="true"></div>
    <div class="ruo-banner" role="note">
      <span class="ruo-tag">RUO</span>
      <span>${RUO_NOTE}</span>
    </div>
    <header class="navbar" id="navbar">
      <div class="container--wide container navbar__inner">
        ${brand()}
        <nav class="nav-links" aria-label="Primary">
          ${NAV.map((n) => `<a href="${n.href}" ${isActive(n.key)}>${n.label}</a>`).join('')}
        </nav>
        <div class="nav-actions">
          <button class="icon-btn" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle theme"></button>
          <button class="icon-btn hide-mobile" id="search-open" aria-label="Search catalog" title="Search">${icon('search', { size: 21 })}</button>
          <button class="icon-btn" id="cart-open" aria-label="Open cart">
            ${icon('cart', { size: 21 })}
            <span class="cart-count" id="cart-count" aria-hidden="true">0</span>
          </button>
          <a class="btn btn-primary btn-sm hide-mobile" href="products.html">Shop now</a>
          <button class="icon-btn nav-toggle hide-desktop" id="menu-open" aria-label="Open menu" aria-expanded="false">${icon('menu', { size: 22 })}</button>
        </div>
      </div>
    </header>
    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <div class="mobile-menu__head">
        ${brand()}
        <button class="icon-btn" id="menu-close" aria-label="Close menu">${icon('close', { size: 22 })}</button>
      </div>
      <nav class="mobile-menu__links" aria-label="Mobile">
        ${NAV.map((n) => `<a class="m-link" href="${n.href}" ${isActive(n.key)}>${n.label}${icon('chevron-right', { size: 20 })}</a>`).join('')}
        <a class="btn btn-primary btn-lg" href="products.html">Browse Catalog</a>
      </nav>
    </div>`;
  document.body.prepend(top);

  // ---------- Footer ----------
  const footer = document.createElement('footer');
  footer.className = 'footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer__grid">
        <div>
          ${brand()}
          <p class="footer__about">${FOOT_ABOUT}</p>
          <div class="social" style="margin-top:1.25rem">
            <a href="https://github.com/Sylrix" target="_blank" rel="noopener" aria-label="GitHub">${icon('github', { size: 18 })}</a>
            <a href="#" aria-label="LinkedIn">${icon('linkedin', { size: 18 })}</a>
            <a href="#" aria-label="X (Twitter)">${icon('twitter', { size: 18 })}</a>
            <a href="contact.html" aria-label="Email">${icon('mail', { size: 18 })}</a>
          </div>
        </div>
        <div class="footer__col">
          <h4>Shop</h4>
          <a href="products.html">All compounds</a>
          <a href="products.html?cat=research-peptides">Research peptides</a>
          <a href="products.html?cat=amino-acids">Amino acids</a>
          <a href="products.html?cat=reference-standards">Reference standards</a>
          <a href="products.html?cat=biochem-reagents">Biochem reagents</a>
        </div>
        <div class="footer__col">
          <h4>Company</h4>
          <a href="about.html">About us</a>
          <a href="faq.html">FAQ</a>
          <a href="contact.html">Contact</a>
          <a href="compliance.html">Quality &amp; COAs</a>
        </div>
        <div class="footer__col">
          <h4>Legal</h4>
          <a href="compliance.html">Research Use Only</a>
          <a href="terms.html">Terms of Service</a>
          <a href="privacy.html">Privacy Policy</a>
          <a href="shipping.html">Shipping Policy</a>
          <a href="refund.html">Refunds &amp; Returns</a>
        </div>
      </div>
      <p class="footer__about" style="max-width:none;margin-top:2.5rem;padding:1rem 1.25rem;border:1px dashed var(--border-default);border-radius:var(--radius-md)">
        <strong>⚗ Compliance notice:</strong> ${FOOT_LEGAL} Buyers certify legitimate research use and are responsible for compliance with applicable laws.
      </p>
      <div class="footer__bottom">
        <span>© <span data-year></span> Sylrix Research. All rights reserved.</span>
        <span>Built for laboratory research · Demo storefront</span>
      </div>
    </div>`;
  document.body.appendChild(footer);

  // ---------- Toast host ----------
  const toastWrap = document.createElement('div');
  toastWrap.className = 'toast-wrap';
  toastWrap.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastWrap);
  S.toast = function (msg, iconName = 'check-circle') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${icon(iconName, { size: 18 })}<span>${msg}</span>`;
    toastWrap.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; t.style.transition = 'all .3s'; }, 2400);
    setTimeout(() => t.remove(), 2800);
  };

  // ---------- Focus trap (shared by menu + cart drawer) ----------
  S.trapFocus = function (container) {
    const SEL = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const focusable = () => Array.prototype.slice.call(container.querySelectorAll(SEL)).filter((el) => el.offsetParent !== null);
    function onKey(e) {
      if (e.key !== 'Tab') return;
      const f = focusable();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    container.addEventListener('keydown', onKey);
    return () => container.removeEventListener('keydown', onKey);
  };

  S.hydrateIcons();

  // ---------- Theme ----------
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  function currentTheme() {
    return root.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function paintThemeBtn() {
    themeBtn.innerHTML = icon(currentTheme() === 'dark' ? 'sun' : 'moon', { size: 21 });
  }
  paintThemeBtn();
  themeBtn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sylrix.theme', next); } catch {}
    paintThemeBtn();
  });

  // ---------- Navbar scroll state ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  // ---------- Mobile menu ----------
  const menu = document.getElementById('mobile-menu');
  const menuOpenBtn = document.getElementById('menu-open');
  let menuRelease = null;
  let menuLastFocus = null;
  const openMenu = () => {
    menuLastFocus = document.activeElement;
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    menuOpenBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.getElementById('menu-close').focus();
    menuRelease = S.trapFocus(menu);
  };
  const closeMenu = () => {
    if (!menu.classList.contains('open')) return;
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    menuOpenBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (menuRelease) { menuRelease(); menuRelease = null; }
    if (menuLastFocus && menuLastFocus.focus) menuLastFocus.focus();
  };
  menuOpenBtn.addEventListener('click', openMenu);
  document.getElementById('menu-close').addEventListener('click', closeMenu);
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  // search button -> catalog with focus intent
  const searchBtn = document.getElementById('search-open');
  if (searchBtn) searchBtn.addEventListener('click', () => {
    if (page === 'catalog') { const i = document.getElementById('catalog-search'); if (i) { i.focus(); return; } }
    location.href = 'products.html#search';
  });

  // cart open -> handled by cart.js
  document.getElementById('cart-open').addEventListener('click', () => S.openCart && S.openCart());

  // ---------- Cart count badge ----------
  const badge = document.getElementById('cart-count');
  function paintCount() {
    const n = S.store.count();
    badge.textContent = n;
    badge.classList.toggle('show', n > 0);
    if (n > 0) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
  }
  S.store.onChange(paintCount);
  paintCount();

  // ---------- Reveal on scroll ----------
  const lowPower = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lowPower) root.classList.add('reduce-fx');
  const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-stagger]');
  if ('IntersectionObserver' in window && !lowPower) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('revealed'); runCounters(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
    addEventListener('pagehide', () => io.disconnect(), { once: true });
  } else {
    revealEls.forEach((el) => el.classList.add('revealed'));
    runCounters(document);
  }

  // ---------- Animated counters ----------
  function runCounters(scope) {
    scope.querySelectorAll('[data-count]:not([data-counted])').forEach((el) => {
      el.dataset.counted = '1';
      const target = parseFloat(el.dataset.count);
      const dec = (target % 1 !== 0) ? 1 : 0;
      const dur = 1600; let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        el.textContent = dec ? val.toFixed(1) : Math.round(val).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  // ---------- Marquee duplication (clone nodes — no innerHTML reflow) ----------
  document.querySelectorAll('.marquee__track').forEach((track) => {
    Array.prototype.slice.call(track.children).forEach((child) => track.appendChild(child.cloneNode(true)));
  });

  // ---------- Year ----------
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
