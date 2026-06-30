/* ============================================================
   HERO — lightweight animated "molecular constellation" canvas.
   Particles drift and link to nearby neighbours. Pauses when the
   hero scrolls out of view; disabled for reduced-motion.
   ============================================================ */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let w, h, dpr, particles, raf, running = true;
  const isDark = () => (document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';

  function count() {
    const a = innerWidth * innerHeight;
    if (innerWidth < 640) return 26;
    return Math.min(70, Math.round(a / 22000));
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    particles = Array.from({ length: count() }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.2 + 1.4,
      c: Math.random() > 0.5 ? '#6366F1' : (Math.random() > 0.5 ? '#06B6D4' : '#A3E635'),
    }));
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    const link = isDark() ? 'rgba(148,163,255,' : 'rgba(79,70,229,';
    const LINK_D = 130;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_D) {
          ctx.strokeStyle = link + (0.16 * (1 - d / LINK_D)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
    }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!running) { running = true; frame(); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  resize(); seed(); frame();

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); seed(); }, 200); }, { passive: true });

  // pause when hero offscreen
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) start(); else stop(); });
  }, { threshold: 0.01 });
  io.observe(canvas);

  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
})();
