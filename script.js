/* ============================================================
   KUSHAL PHUYAL — MASTER SCRIPT
   Handles: Nav, Scroll Reveal, Skill Bars, Tabs,
            Chat, Particle Canvas, Modal, Lightbox,
            Blog Filter/Search, Gallery Filter
   ============================================================ */

/* ── UTILITY ──────────────────────────────────────── */
function qs(s, ctx = document)  { return ctx.querySelector(s); }
function qsa(s, ctx = document) { return [...ctx.querySelectorAll(s)]; }
function yr()  { const el = qs('#yr'); if (el) el.textContent = new Date().getFullYear(); }

/* ── NAV ──────────────────────────────────────────── */
function initNav() {
  const ham   = qs('#hamburger');
  const mob   = qs('#mob-menu');
  const links = qsa('#mob-menu a');

  if (!ham || !mob) return;
  ham.addEventListener('click', (e) => {
    e.stopPropagation();
    mob.classList.toggle('open');
  });
  links.forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));
  document.addEventListener('click', (e) => {
    if (!mob.contains(e.target) && !ham.contains(e.target)) mob.classList.remove('open');
  });

  // Active link highlight
  const path = location.pathname.split('/').pop() || 'index.html';
  qsa('#navbar .nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

/* ── SCROLL REVEAL ────────────────────────────────── */
function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  qsa('.reveal').forEach(el => io.observe(el));
}

/* ── SKILL BARS ───────────────────────────────────── */
function initSkillBars() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        qsa('.skill-fill', e.target).forEach(f => { f.style.width = (f.dataset.w || 0) + '%'; });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  qsa('.skill-fill').forEach(f => {
    const wrap = f.closest('.skill-row') || f.closest('section') || f;
    io.observe(f.parentElement || f);
  });
  // Also trigger for individually visible
  qsa('.skill-fill').forEach(f => {
    const io2 = new IntersectionObserver(e => {
      if (e[0].isIntersecting) { f.style.width = (f.dataset.w || 0) + '%'; io2.disconnect(); }
    }, { threshold: 0.5 });
    io2.observe(f);
  });
}

/* ── ABOUT TABS ───────────────────────────────────── */
function initTabs() {
  qsa('.tabs-row').forEach(row => {
    const btns  = qsa('.tab-btn', row);
    const panes = qsa('.tab-pane', row.closest('section') || row.parentElement);
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b  => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = qs('#tab-' + btn.dataset.tab);
        if (target) target.classList.add('active');
      });
    });
  });
}

/* ── PARTICLE CANVAS ──────────────────────────────── */
function initCanvas() {
  const c = qs('#bg-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts;
  const resize = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  const mkPts  = () => {
    pts = Array.from({ length: 45 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
      r: Math.random() * 1.4 + .5
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < 130) {
          ctx.strokeStyle = `rgba(201,168,76,${(1 - d / 130) * .08})`;
          ctx.lineWidth = .6; ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
    }
    pts.forEach(p => {
      ctx.fillStyle = 'rgba(201,168,76,0.18)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  };
  resize(); mkPts(); draw();
  window.addEventListener('resize', () => { resize(); mkPts(); });
}

/* ── FLOATING CHAT ────────────────────────────────── */
function initChat() {
  const toggle = qs('#chat-toggle');
  const box    = qs('#chatbox');
  const closeX = qs('#chat-close-x');
  const input  = qs('#c-input');
  const send   = qs('#c-send');
  const msgs   = qs('#chat-msgs');
  if (!toggle || !box) return;

  toggle.addEventListener('click', () => {
    const open = box.style.display === 'flex';
    box.style.display = open ? 'none' : 'flex';
    if (!open && input) input.focus();
  });
  if (closeX) closeX.addEventListener('click', () => { box.style.display = 'none'; });

  async function doSend() {
    const text = (input?.value || '').trim();
    if (!text) return;
    input.value = '';
    msgs.innerHTML += `<div class="cmsg user">${text}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
    const tid = 't' + Date.now();
    msgs.innerHTML += `<div class="cmsg bot" id="${tid}"><i class="fas fa-circle-notch fa-spin" style="color:var(--gold)"></i></div>`;
    msgs.scrollTop = msgs.scrollHeight;
    try {
      const ctrl = new AbortController();
      const to   = setTimeout(() => ctrl.abort(), 15000);
      const res  = await fetch('https://morning-bush-8bd5.kushalphuyal.workers.dev/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }), signal: ctrl.signal
      });
      clearTimeout(to);
      const reply = await res.text();
      const el = qs('#' + tid);
      if (el) el.innerHTML = reply || 'No response.';
    } catch (e) {
      const el = qs('#' + tid);
      if (el) el.innerHTML = e.name === 'AbortError'
        ? '⏱️ Timeout — please retry.'
        : '⚠️ Connection error. <a href="https://wa.me/9779863970493" target="_blank" style="color:var(--gold)">WhatsApp Kushal</a>';
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  if (send) send.addEventListener('click', doSend);
  if (input) input.addEventListener('keypress', e => { if (e.key === 'Enter') doSend(); });
}

/* ── BLOG / FILTER ENGINE ─────────────────────────── */
const BlogEngine = (() => {
  let posts = [], active = 'all', query = '', modalList = [], curIdx = 0;

  const CATS = {
    all:     { label: 'All' },
    finance: { label: 'Finance',  cls: 'tag-gold' },
    ai:      { label: 'AI',       cls: 'tag-blue' },
    tax:     { label: 'Tax',      cls: 'tag-red' },
    career:  { label: 'Career',   cls: 'tag-green' },
    nepal:   { label: 'Nepal',    cls: 'tag-dim' }
  };

  function getFiltered() {
    return posts.filter(p => {
      const mc = active === 'all' || p.category === active;
      const ms = !query || p.title.toLowerCase().includes(query) ||
                 p.excerpt.toLowerCase().includes(query) || p.content.toLowerCase().includes(query);
      return mc && ms;
    });
  }

  function catHtml(cat) {
    const c = CATS[cat] || CATS.all;
    return `<span class="blog-cat ${c.cls || ''}">${c.label}</span>`;
  }

  function buildFilters(containerId) {
    const row = qs('#' + containerId);
    if (!row) return;
    row.innerHTML = Object.entries(CATS).map(([k, v]) =>
      `<button class="filter-btn ${k === 'all' ? 'active' : ''}" data-cat="${k}">${v.label}</button>`
    ).join('');
    row.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      qsa('.filter-btn', row).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      active = btn.dataset.cat;
      render();
    });
  }

  function render() {
    const f = getFiltered();
    const fw = qs('#featured-wrap');
    const grid = qs('#blog-grid');
    const cnt  = qs('#post-count');
    const empty = qs('#blog-empty');
    if (cnt)   cnt.textContent = f.length + ' posts';
    if (empty) empty.style.display = f.length ? 'none' : 'block';

    // Featured
    if (fw) {
      if (!f.length) { fw.innerHTML = ''; }
      else {
        const p = f[0];
        fw.innerHTML = `
        <div style="background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;display:grid;grid-template-columns:1.1fr 1fr;cursor:pointer;transition:all .35s;margin-bottom:44px;"
             onmouseover="this.style.borderColor='rgba(201,168,76,.35)';this.style.transform='translateY(-4px)'"
             onmouseout="this.style.borderColor='';this.style.transform=''"
             onclick="BlogEngine.open(0)">
          <div style="min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;position:relative;overflow:hidden;background:${p.bg};">
            <span style="position:absolute;top:16px;left:16px;background:var(--gold);color:#000;padding:4px 13px;border-radius:50px;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">★ Featured</span>
            <i class="${p.icon}" style="color:${p.iconColor};font-size:3.5rem;position:relative;z-index:1;"></i>
          </div>
          <div style="padding:32px;">
            ${catHtml(p.category)}
            <h2 style="font-family:var(--ff-head);font-size:1.5rem;font-weight:700;color:var(--white);line-height:1.2;margin:10px 0 10px;">${p.title}</h2>
            <p style="color:var(--muted);font-size:.9rem;margin-bottom:18px;line-height:1.7;">${p.excerpt}</p>
            <div style="display:flex;gap:16px;font-size:.78rem;color:var(--muted);">
              <span>📅 ${p.date}</span><span>⏱ ${p.readTime}</span>
            </div>
            <button class="btn btn-gold" style="margin-top:18px;" onclick="event.stopPropagation();BlogEngine.open(0)">
              <i class="fas fa-book-open"></i> Read Post
            </button>
          </div>
        </div>`;
      }
    }

    // Grid
    if (grid) {
      const rest = f.slice(1);
      grid.innerHTML = rest.length ? rest.map((p, i) => `
        <div class="blog-card" style="cursor:pointer" onclick="BlogEngine.open(${i+1})">
          <div class="blog-thumb" style="background:${p.bg}">
            <i class="${p.icon}" style="color:${p.iconColor};"></i>
          </div>
          <div class="blog-body">
            ${catHtml(p.category)}
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <div class="blog-foot">
              <span>📅 ${p.date}</span>
              <span class="read-link">⏱ ${p.readTime}</span>
            </div>
          </div>
        </div>`).join('') : '';
    }
  }

  function openModal(idx, list) {
    modalList = list; curIdx = idx;
    loadModal(curIdx);
    const ov = qs('#blog-modal');
    if (ov) { ov.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  function loadModal(idx) {
    const p  = modalList[idx];
    const qs2 = s => qs(s, qs('#blog-modal'));
    const mImg = qs2('#modal-img');
    if (mImg) { mImg.style.background = p.bg; mImg.innerHTML = `<i class="${p.icon}" style="color:${p.iconColor};font-size:4rem;position:relative;z-index:1;"></i>`; }
    const mc = qs2('#modal-cat'); if (mc) mc.innerHTML = catHtml(p.category);
    const mt = qs2('#modal-title'); if (mt) mt.textContent = p.title;
    const mm = qs2('#modal-meta'); if (mm) mm.innerHTML = `<span>📅 ${p.date}</span><span>⏱ ${p.readTime}</span><span>✍️ Kushal Phuyal</span>`;
    const mb = qs2('#modal-body'); if (mb) mb.innerHTML = p.content;
    const pb = qs2('#modal-prev'); if (pb) pb.disabled = idx === 0;
    const nb = qs2('#modal-next'); if (nb) nb.disabled = idx === modalList.length - 1;
    const box = qs('.modal-box', qs('#blog-modal'));
    if (box) box.scrollTop = 0;
  }

  function closeModal() {
    const ov = qs('#blog-modal');
    if (ov) { ov.classList.remove('open'); document.body.style.overflow = ''; }
  }

  function navigate(dir) {
    const n = curIdx + dir;
    if (n < 0 || n >= modalList.length) return;
    curIdx = n; loadModal(curIdx);
  }

  function init(data, filterRowId = 'filter-row') {
    posts = data;
    buildFilters(filterRowId);
    render();

    const si = qs('#search-input');
    if (si) si.addEventListener('input', () => { query = si.value.trim().toLowerCase(); render(); });

    const ov = qs('#blog-modal');
    if (ov) {
      ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
      const pb = qs('#modal-prev', ov); if (pb) pb.addEventListener('click', () => navigate(-1));
      const nb = qs('#modal-next', ov); if (nb) nb.addEventListener('click', () => navigate(1));
      const cx = qs('.modal-close', ov); if (cx) cx.addEventListener('click', closeModal);
    }
    document.addEventListener('keydown', e => {
      if (!qs('#blog-modal.open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
    });
  }

  return {
    init,
    open: (idx) => openModal(idx, getFiltered()),
    close: closeModal,
    navigate
  };
})();

/* ── LIGHTBOX ─────────────────────────────────────── */
const Lightbox = (() => {
  let photos = [], cur = 0;

  function update() {
    const p    = photos[cur];
    const img  = qs('#lb-img');
    const cap  = qs('#lb-cap');
    const cnt  = qs('#lb-cnt');
    const bar  = qs('#lb-bar');
    if (img) { img.src = p.src; img.alt = p.caption || ''; }
    if (cap) cap.textContent = p.caption || '';
    if (cnt) cnt.textContent = `${cur + 1} / ${photos.length}`;
    if (bar) bar.style.width = ((cur + 1) / photos.length * 100) + '%';
  }

  function open(idx, arr) {
    photos = arr; cur = idx; update();
    const lb = qs('#lightbox');
    if (lb) { lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  function close() {
    const lb = qs('#lightbox');
    if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; }
  }

  function prev() { cur = (cur - 1 + photos.length) % photos.length; update(); }
  function next() { cur = (cur + 1) % photos.length; update(); }

  function init() {
    const lb = qs('#lightbox');
    if (!lb) return;
    lb.addEventListener('click',             e  => { if (e.target === lb) close(); });
    qs('#lb-close')?.addEventListener('click',   close);
    qs('#lb-prev')?.addEventListener('click',    prev);
    qs('#lb-next')?.addEventListener('click',    next);
    document.addEventListener('keydown', e => {
      if (!qs('#lightbox.open')) return;
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowRight')  next();
      if (e.key === 'ArrowLeft')   prev();
    });
    let tx = 0;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
    });
  }

  return { init, open, close, prev, next };
})();

/* ── PRINT HELPER ─────────────────────────────────── */
function doPrint(id) {
  const el = qs('#' + id);
  if (!el) return;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Kushal Phuyal</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;}
    table{border-collapse:collapse;width:100%;}th,td{border:1px solid #ddd;padding:8px;}
    th{background:#f4f4f4;}</style></head><body>${el.innerHTML}</body></html>`);
  w.print();
}

/* ── INIT ALL ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  yr();
  initNav();
  initReveal();
  initSkillBars();
  initTabs();
  initCanvas();
  initChat();
  Lightbox.init();
});
