/* ============================================================
   KUSHAL PHUYAL — MASTER SCRIPT (Clean Version 2025)
   Handles: Nav, Reveal, Skills, Tabs, Chat, Canvas,
            Modal, Lightbox, Blog Engine, Gallery
   ============================================================ */

/* ── UTILITY ── */
function qs(s, ctx = document)  { return ctx.querySelector(s); }
function qsa(s, ctx = document) { return [...ctx.querySelectorAll(s)]; }

/* ── YEAR ── */
function initYear() {
  const el = qs('#yr');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── NAVIGATION ── */
function initNav() {
  const ham = qs('#hamburger');
  const mob = qs('.mob-menu');
  if (!ham || !mob) return;

  ham.addEventListener('click', e => { e.stopPropagation(); mob.classList.toggle('open'); });
  qsa('a', mob).forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));
  document.addEventListener('click', e => {
    if (!mob.contains(e.target) && !ham.contains(e.target)) mob.classList.remove('open');
  });

  // Active link
  const cur = location.pathname.split('/').pop() || 'index.html';
  qsa('#navbar .nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === cur || (href === '/' && cur === 'index.html')) a.classList.add('active');
  });
}

/* ── SCROLL REVEAL ── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  qsa('.reveal').forEach(el => obs.observe(el));
}

/* ── SKILL BARS ── */
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        qsa('.skill-fill', e.target).forEach(bar => {
          bar.style.width = (bar.dataset.w || bar.getAttribute('data-width') || '0') + '%';
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  qsa('.skill-row, .skill-track').forEach(el => obs.observe(el));
}

/* ── TABS ── */
function initTabs() {
  qsa('.tabs-row').forEach(row => {
    const btns = qsa('.tab-btn', row);
    const sec  = row.closest('section') || document;
    const panes = qsa('.tab-pane', sec);
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = qs('#tab-' + btn.dataset.tab, sec);
        if (pane) pane.classList.add('active');
      });
    });
  });
}

/* ── PARTICLE CANVAS ── */
function initCanvas() {
  const canvas = qs('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3,
      r: Math.random() * 1.6 + .6
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < 140) {
          ctx.strokeStyle = `rgba(201,168,76,${(1 - d/140) * .09})`;
          ctx.lineWidth = .7;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    particles.forEach(p => {
      ctx.fillStyle = 'rgba(201,168,76,0.2)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });
    requestAnimationFrame(draw);
  }

  resize(); draw();
  window.addEventListener('resize', resize);
}

/* ── FLOATING CHAT ── */
function initChat() {
  const toggle  = qs('#chat-toggle');
  const box     = qs('#chatbox');
  const closeX  = qs('#chat-close-x');
  const input   = qs('#c-input');
  const sendBtn = qs('#c-send');
  const msgs    = qs('.chat-msgs');
  if (!toggle || !box) return;

  toggle.addEventListener('click', () => {
    const open = box.style.display === 'flex';
    box.style.display = open ? 'none' : 'flex';
    if (!open && input) input.focus();
  });
  if (closeX) closeX.addEventListener('click', () => { box.style.display = 'none'; });

  async function sendMsg() {
    const text = input?.value.trim();
    if (!text) return;
    input.value = '';
    msgs.innerHTML += `<div class="cmsg user">${text}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
    const tid = 'tid' + Date.now();
    msgs.innerHTML += `<div class="cmsg bot" id="${tid}"><i class="fas fa-circle-notch fa-spin"></i></div>`;
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const ctrl = new AbortController();
      const to   = setTimeout(() => ctrl.abort(), 12000);
      const res  = await fetch('https://morning-bush-8bd5.kushalphuyal.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: ctrl.signal
      });
      clearTimeout(to);
      const reply = await res.text();
      const el = qs('#' + tid);
      if (el) el.innerHTML = reply || 'No reply.';
    } catch (err) {
      const el = qs('#' + tid);
      if (el) el.innerHTML = err.name === 'AbortError'
        ? 'Timeout. Please retry.'
        : 'Connection error. <a href="https://wa.me/9779863970493" target="_blank" style="color:var(--gold)">WhatsApp contact</a>';
    }
    msgs.scrollTop = msgs.scrollHeight;
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMsg);
  if (input)   input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMsg(); });
}

/* ── BLOG ENGINE ── */
const BlogEngine = (() => {
  let allPosts = [], currentFilter = 'all', searchQuery = '';
  let currentModalPosts = [], currentModalIndex = 0;

  const categories = {
    all:     { label: 'All' },
    finance: { label: 'Finance', cls: 'tag-gold' },
    ai:      { label: 'AI',      cls: 'tag-blue' },
    tax:     { label: 'Tax',     cls: 'tag-red'  },
    career:  { label: 'Career',  cls: 'tag-green' },
    nepal:   { label: 'Nepal',   cls: 'tag-dim'  }
  };

  function getFiltered() {
    return allPosts.filter(p => {
      const okCat = currentFilter === 'all' || p.category === currentFilter;
      const okSrc = !searchQuery ||
        p.title.toLowerCase().includes(searchQuery) ||
        p.excerpt.toLowerCase().includes(searchQuery) ||
        (p.content || '').toLowerCase().includes(searchQuery);
      return okCat && okSrc;
    });
  }

  function catHTML(cat) {
    const c = categories[cat] || categories.all;
    return `<span class="blog-cat ${c.cls || ''}">${c.label}</span>`;
  }

  function buildFilters(containerId) {
    const container = qs('#' + containerId);
    if (!container) return;
    container.innerHTML = Object.entries(categories).map(([k, v]) =>
      `<button class="filter-btn ${k === 'all' ? 'active' : ''}" data-cat="${k}">${v.label}</button>`
    ).join('');
    container.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      qsa('.filter-btn', container).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.cat;
      renderPosts();
    });
  }

  function renderPosts() {
    const filtered = getFiltered();
    const empty = qs('#blog-empty');
    if (empty) empty.style.display = filtered.length ? 'none' : 'block';

    // Featured
    const featWrap = qs('#featured-wrap');
    if (featWrap) {
      if (!filtered.length) { featWrap.innerHTML = ''; }
      else {
        const p = filtered[0];
        featWrap.innerHTML = `
          <div class="featured-post-card" onclick="BlogEngine.openModal(0)">
            <div class="featured-thumb" style="background:${p.bg||'#1c1c1c'}">
              <i class="${p.icon||'fas fa-star'}" style="color:${p.iconColor||'var(--gold)'}"></i>
            </div>
            <div class="featured-content">
              ${catHTML(p.category)}
              <h2>${p.title}</h2>
              <p>${p.excerpt}</p>
              <div class="meta"><span>📅 ${p.date}</span><span>⏱ ${p.readTime}</span></div>
              <button class="btn btn-gold btn-sm">Read Post</button>
            </div>
          </div>`;
      }
    }

    // Grid
    const grid = qs('#blog-grid');
    if (grid) {
      grid.innerHTML = filtered.slice(1).map((p, i) => `
        <div class="blog-card" onclick="BlogEngine.openModal(${i + 1})">
          <div class="blog-thumb" style="background:${p.bg||'#161616'}">
            <i class="${p.icon}" style="color:${p.iconColor||'var(--gold)'}"></i>
          </div>
          <div class="blog-body">
            ${catHTML(p.category)}
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <div class="blog-foot">
              <span>📅 ${p.date}</span>
              <span class="read-link">⏱ ${p.readTime}</span>
            </div>
          </div>
        </div>`).join('');
    }
  }

  function openModal(index) {
    currentModalPosts = getFiltered();
    if (!currentModalPosts.length) return;
    currentModalIndex = index;
    loadModal(index);
    const overlay = qs('#blog-modal');
    if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  function loadModal(idx) {
    const p = currentModalPosts[idx];
    if (!p) return;
    const modal = qs('#blog-modal');
    if (!modal) return;
    qs('#modal-img',   modal).style.background = p.bg || '#1c1c1c';
    qs('#modal-img',   modal).innerHTML = `<i class="${p.icon}" style="color:${p.iconColor||'var(--gold)'}"></i>`;
    qs('#modal-cat',   modal).innerHTML = catHTML(p.category);
    qs('#modal-title', modal).textContent = p.title;
    qs('#modal-meta',  modal).innerHTML = `<span>📅 ${p.date}</span><span>⏱ ${p.readTime}</span><span>✍️ Kushal Phuyal</span>`;
    qs('#modal-body',  modal).innerHTML = p.content || '<p>No content.</p>';
    qs('#modal-prev',  modal).disabled = idx === 0;
    qs('#modal-next',  modal).disabled = idx === currentModalPosts.length - 1;
    qs('.modal-box',   modal).scrollTop = 0;
  }

  function closeModal() {
    const o = qs('#blog-modal');
    if (o) { o.classList.remove('open'); document.body.style.overflow = ''; }
  }

  function navigateModal(dir) {
    const ni = currentModalIndex + dir;
    if (ni < 0 || ni >= currentModalPosts.length) return;
    currentModalIndex = ni; loadModal(ni);
  }

  function init(data, filterContainerId = 'filter-row') {
    allPosts = Array.isArray(data) ? data : [];
    buildFilters(filterContainerId);
    renderPosts();

    const search = qs('#search-input');
    if (search) search.addEventListener('input', e => { searchQuery = e.target.value.trim().toLowerCase(); renderPosts(); });

    const modal = qs('#blog-modal');
    if (modal) {
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
      qs('#modal-prev',   modal)?.addEventListener('click', () => navigateModal(-1));
      qs('#modal-next',   modal)?.addEventListener('click', () => navigateModal(1));
      qs('.modal-close',  modal)?.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', e => {
      if (!qs('#blog-modal.open')) return;
      if (e.key === 'Escape')      closeModal();
      if (e.key === 'ArrowLeft')   navigateModal(-1);
      if (e.key === 'ArrowRight')  navigateModal(1);
    });
  }

  return { init, openModal, closeModal, navigateModal };
})();

/* ── LIGHTBOX ── */
const Lightbox = (() => {
  let images = [], currentIndex = 0;

  function update() {
    const img  = qs('#lb-img');
    const cap  = qs('#lb-cap');
    const cnt  = qs('#lb-cnt');
    const bar  = qs('#lb-bar');
    if (!img) return;
    img.src = images[currentIndex].src;
    img.alt = images[currentIndex].caption || '';
    if (cap) cap.textContent = images[currentIndex].caption || '';
    if (cnt) cnt.textContent = `${currentIndex + 1} / ${images.length}`;
    if (bar) bar.style.width = ((currentIndex + 1) / images.length * 100) + '%';
  }

  function open(index, arr) {
    if (!arr?.length) return;
    images = arr; currentIndex = index; update();
    const lb = qs('#lightbox');
    if (lb) { lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  function close() {
    const lb = qs('#lightbox');
    if (lb) { lb.classList.remove('open'); document.body.style.overflow = ''; }
  }

  function prev() { currentIndex = (currentIndex - 1 + images.length) % images.length; update(); }
  function next() { currentIndex = (currentIndex + 1) % images.length; update(); }

  function init() {
    const lb = qs('#lightbox');
    if (!lb) return;
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    qs('#lb-close')?.addEventListener('click', close);
    qs('#lb-prev')?.addEventListener('click',  prev);
    qs('#lb-next')?.addEventListener('click',  next);
    document.addEventListener('keydown', e => {
      if (!qs('#lightbox.open')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    });
    let tx = 0;
    lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend',   e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 60) d > 0 ? prev() : next(); });
  }

  return { init, open, close };
})();

/* ── DOM READY ── */
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initNav();
  initReveal();
  initSkillBars();
  initTabs();
  initCanvas();
  initChat();
  Lightbox.init();
});