/* ============================================================
   KUSHAL PHUYAL — MASTER SCRIPT (fixed)
   Nav, Reveal, Skills, Tabs, Chat (XSS-safe), Canvas, Blog, Lightbox
   ============================================================ */
const CHAT_URL = 'https://morning-bush-8bd5.kushalphuyal.workers.dev/api/chat';

function qs(s, ctx = document)  { return ctx.querySelector(s); }
function qsa(s, ctx = document) { return [...ctx.querySelectorAll(s)]; }
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initYear() { const el = qs('#yr'); if (el) el.textContent = new Date().getFullYear(); }

function initNav() {
  const ham = qs('#hamburger'), mob = qs('.mob-menu');
  if (!ham || !mob) return;
  ham.addEventListener('click', e => { e.stopPropagation(); mob.classList.toggle('open'); });
  qsa('a', mob).forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));
  document.addEventListener('click', e => {
    if (!mob.contains(e.target) && !ham.contains(e.target)) mob.classList.remove('open');
  });
  const cur = location.pathname.split('/').pop() || 'index.html';
  qsa('#navbar .nav-links a').forEach(a => {
    if ((a.getAttribute('href') || '') === cur) a.classList.add('active');
  });
}

function initReveal() {
  const els = qsa('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('on')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

function initSkillBars() {
  const rows = qsa('.skill-row');
  if (!rows.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        qsa('.skill-fill', e.target).forEach(b => { b.style.width = (b.dataset.w || '0') + '%'; });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  rows.forEach(el => obs.observe(el));
}

function initTabs() {
  qsa('.tabs-row').forEach(row => {
    const btns = qsa('.tab-btn', row);
    const sec = row.closest('section') || document;
    const panes = qsa('.tab-pane', sec);
    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      qs('#tab-' + btn.dataset.tab, sec)?.classList.add('active');
    }));
  });
}

function initCanvas() {
  const canvas = qs('#bg-canvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  function resize() {
    W = canvas.width = innerWidth; H = canvas.height = innerHeight;
    const n = W < 700 ? 25 : 50;
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.6 + .6
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d < 140) {
        ctx.strokeStyle = `rgba(201,168,76,${(1 - d / 140) * .09})`;
        ctx.lineWidth = .7; ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
      }
    }
    pts.forEach(p => {
      ctx.fillStyle = 'rgba(201,168,76,0.2)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  }
  resize(); draw();
  addEventListener('resize', resize);
}

/* ── CHAT (shared: floating chat + ai.html chat) ── */
async function askAI(text, prefix = '') {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prefix + text }),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return (await res.text()) || 'No reply.';
  } finally { clearTimeout(to); }
}

function addMsg(box, cls, text) {
  const d = document.createElement('div');
  d.className = cls;
  d.textContent = text;           // textContent => XSS safe
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
  return d;
}

function bindChat({ input, send, box, userCls, botCls, prefix = '' }) {
  if (!input || !box) return;
  async function go(textOverride) {
    const text = (textOverride ?? input.value).trim();
    if (!text) return;
    input.value = '';
    addMsg(box, userCls, text);
    const bot = addMsg(box, botCls, '…');
    try {
      bot.textContent = await askAI(text, prefix);
    } catch (err) {
      bot.textContent = err.name === 'AbortError'
        ? 'Timeout. Please retry.'
        : 'Connection error. WhatsApp: +977 9863970493';
    }
    box.scrollTop = box.scrollHeight;
  }
  send?.addEventListener('click', () => go());
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  return go;
}

function initChat() {
  const toggle = qs('#chat-toggle'), box = qs('#chatbox');
  if (!toggle || !box) return;
  const input = qs('#c-input');
  toggle.addEventListener('click', () => {
    const open = box.style.display === 'flex';
    box.style.display = open ? 'none' : 'flex';
    if (!open && input) input.focus();
  });
  qs('#chat-close-x')?.addEventListener('click', () => { box.style.display = 'none'; });
  bindChat({ input, send: qs('#c-send'), box: qs('.chat-msgs', box), userCls: 'cmsg user', botCls: 'cmsg bot' });
}

/* ── BLOG ENGINE ── */
const BlogEngine = (() => {
  let allPosts = [], currentFilter = 'all', searchQuery = '';
  let modalPosts = [], modalIndex = 0, listed = [];
  const categories = {
    all: { label: 'All' }, finance: { label: 'Finance', cls: 'tag-gold' },
    ai: { label: 'AI', cls: 'tag-blue' }, tax: { label: 'Tax', cls: 'tag-red' },
    career: { label: 'Career', cls: 'tag-green' }, nepal: { label: 'Nepal', cls: 'tag-dim' }
  };
  const getFiltered = () => allPosts.filter(p => {
    const okCat = currentFilter === 'all' || p.category === currentFilter;
    const q = searchQuery;
    const okSrc = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || (p.content || '').toLowerCase().includes(q);
    return okCat && okSrc;
  });
  const catHTML = cat => { const c = categories[cat] || categories.all; return `<span class="blog-cat ${c.cls || ''}">${c.label}</span>`; };

  function buildFilters(id) {
    const c = qs('#' + id); if (!c) return;
    c.innerHTML = Object.entries(categories).map(([k, v]) =>
      `<button class="filter-btn ${k === 'all' ? 'active' : ''}" data-cat="${k}">${v.label}</button>`).join('');
    c.addEventListener('click', e => {
      const b = e.target.closest('.filter-btn'); if (!b) return;
      qsa('.filter-btn', c).forEach(x => x.classList.remove('active'));
      b.classList.add('active'); currentFilter = b.dataset.cat; renderPosts();
    });
  }

  function renderPosts() {
    listed = getFiltered();
    const countEl = qs('#post-count');
    if (countEl) countEl.textContent = listed.length + ' post' + (listed.length === 1 ? '' : 's');
    const empty = qs('#blog-empty');
    if (empty) empty.style.display = listed.length ? 'none' : 'block';
    const feat = qs('#featured-wrap');
    if (feat) {
      if (!listed.length) feat.innerHTML = '';
      else {
        const p = listed[0];
        feat.innerHTML = `<div class="featured-post-card" data-i="0">
          <div class="featured-thumb" style="background:${p.bg || '#1c1c1c'}"><i class="${p.icon || 'fas fa-star'}" style="color:${p.iconColor || 'var(--gold)'}"></i></div>
          <div class="featured-content">${catHTML(p.category)}<h2>${esc(p.title)}</h2><p>${esc(p.excerpt)}</p>
          <div class="meta"><span>📅 ${esc(p.date)}</span><span>⏱ ${esc(p.readTime)}</span></div>
          <button class="btn btn-gold btn-sm">Read Post</button></div></div>`;
      }
    }
    const grid = qs('#blog-grid');
    if (grid) grid.innerHTML = listed.slice(1).map((p, i) => `
      <div class="blog-card" data-i="${i + 1}">
        <div class="blog-thumb" style="background:${p.bg || '#161616'}"><i class="${p.icon || 'fas fa-star'}" style="color:${p.iconColor || 'var(--gold)'}"></i></div>
        <div class="blog-body">${catHTML(p.category)}<h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p>
        <div class="blog-foot"><span>📅 ${esc(p.date)}</span><span class="read-link">⏱ ${esc(p.readTime)}</span></div></div>
      </div>`).join('');
  }

  function openModal(i) {
    modalPosts = listed.length ? listed : getFiltered();
    if (!modalPosts.length) return;
    modalIndex = i; loadModal(i);
    const o = qs('#blog-modal');
    if (o) { o.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function loadModal(idx) {
    const p = modalPosts[idx], m = qs('#blog-modal');
    if (!p || !m) return;
    const img = qs('#modal-img', m);
    img.style.background = p.bg || '#1c1c1c';
    img.innerHTML = `<i class="${p.icon || 'fas fa-star'}" style="color:${p.iconColor || 'var(--gold)'}"></i>`;
    qs('#modal-cat', m).innerHTML = catHTML(p.category);
    qs('#modal-title', m).textContent = p.title;
    qs('#modal-meta', m).innerHTML = `<span>📅 ${esc(p.date)}</span><span>⏱ ${esc(p.readTime)}</span><span>✍️ Kushal Phuyal</span>`;
    qs('#modal-body', m).innerHTML = p.content || '<p>No content.</p>';   // trusted: own data
    qs('#modal-prev', m).disabled = idx === 0;
    qs('#modal-next', m).disabled = idx === modalPosts.length - 1;
    m.scrollTop = 0; qs('.modal-box', m).scrollTop = 0;
  }
  function closeModal() { const o = qs('#blog-modal'); if (o) { o.classList.remove('open'); document.body.style.overflow = ''; } }
  function navigateModal(d) { const n = modalIndex + d; if (n < 0 || n >= modalPosts.length) return; modalIndex = n; loadModal(n); }

  function init(data, filterId = 'filter-row') {
    allPosts = Array.isArray(data) ? data : [];
    buildFilters(filterId); renderPosts();
    document.addEventListener('click', e => {
      const card = e.target.closest('[data-i]');
      if (card && (card.classList.contains('blog-card') || card.classList.contains('featured-post-card')))
        openModal(parseInt(card.dataset.i, 10));
    });
    qs('#search-input')?.addEventListener('input', e => { searchQuery = e.target.value.trim().toLowerCase(); renderPosts(); });
    const m = qs('#blog-modal');
    if (m) {
      m.addEventListener('click', e => { if (e.target === m) closeModal(); });
      qs('#modal-prev', m)?.addEventListener('click', () => navigateModal(-1));
      qs('#modal-next', m)?.addEventListener('click', () => navigateModal(1));
      qs('.modal-close', m)?.addEventListener('click', closeModal);
    }
    document.addEventListener('keydown', e => {
      if (!qs('#blog-modal.open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
    });
  }
  return { init, openModal, closeModal, navigateModal };
})();

/* ── LIGHTBOX ── */
const Lightbox = (() => {
  let images = [], idx = 0;
  function update() {
    const img = qs('#lb-img'); if (!img || !images[idx]) return;
    img.src = images[idx].src; img.alt = images[idx].caption || '';
    const cap = qs('#lb-cap'), cnt = qs('#lb-cnt'), bar = qs('#lb-bar');
    if (cap) cap.textContent = images[idx].caption || '';
    if (cnt) cnt.textContent = `${idx + 1} / ${images.length}`;
    if (bar) bar.style.width = ((idx + 1) / images.length * 100) + '%';
  }
  function open(i, arr) {
    if (!arr?.length) return;
    images = arr; idx = i; update();
    const lb = qs('#lightbox'); if (lb) { lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }
  function close() { const lb = qs('#lightbox'); if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; } }
  const prev = () => { idx = (idx - 1 + images.length) % images.length; update(); };
  const next = () => { idx = (idx + 1) % images.length; update(); };
  let inited = false;
  function init() {
    const lb = qs('#lightbox'); if (!lb || inited) return; inited = true;
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    qs('#lb-close')?.addEventListener('click', close);
    qs('#lb-prev')?.addEventListener('click', prev);
    qs('#lb-next')?.addEventListener('click', next);
    document.addEventListener('keydown', e => {
      if (!qs('#lightbox.open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
    let tx = 0;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 60) d > 0 ? prev() : next(); });
  }
  return { init, open, close };
})();

document.addEventListener('DOMContentLoaded', () => {
  initYear(); initNav(); initReveal(); initSkillBars(); initTabs(); initCanvas(); initChat(); Lightbox.init();
});
