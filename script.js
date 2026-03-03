/* ============================================================
   KUSHAL PHUYAL — MASTER SCRIPT (Refined 2025)
   Handles: Nav, Scroll Reveal, Skill Bars, Tabs,
            Chat, Particle Canvas, Modal, Lightbox,
            Blog Filter/Search, Gallery
   ============================================================ */

/* ── UTILITY ──────────────────────────────────────────────── */
function qs(s, ctx = document) { return ctx.querySelector(s); }
function qsa(s, ctx = document) { return [...ctx.querySelectorAll(s)]; }

function yr() {
  const el = qs('#yr');
  if (el) el.textContent = new Date().getFullYear();
}

/* ── NAVIGATION (Mobile + Active link) ────────────────────── */
function initNav() {
  const ham = qs('#hamburger');
  const mob = qs('.mob-menu');  // class प्रयोग गरिएको छ CSS मा
  if (!ham || !mob) return;

  ham.addEventListener('click', e => {
    e.stopPropagation();
    mob.classList.toggle('open');
  });

  qsa('a', mob).forEach(a => {
    a.addEventListener('click', () => mob.classList.remove('open'));
  });

  document.addEventListener('click', e => {
    if (!mob.contains(e.target) && !ham.contains(e.target)) {
      mob.classList.remove('open');
    }
  });

  // Active link highlight
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  qsa('#navbar .nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === currentPath || (href === '/' && currentPath === 'index.html')) {
      a.classList.add('active');
    }
  });
}

/* ── SCROLL REVEAL ────────────────────────────────────────── */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  qsa('.reveal').forEach(el => observer.observe(el));
}

/* ── SKILL BARS (Simplified & reliable) ───────────────────── */
function initSkillBars() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        qsa('.skill-fill', entry.target).forEach(bar => {
          const width = bar.dataset.w || bar.getAttribute('data-width') || '0';
          bar.style.width = width + '%';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  qsa('.skill-row, .skill-track').forEach(el => {
    observer.observe(el);
  });
}

/* ── TABS ─────────────────────────────────────────────────── */
function initTabs() {
  qsa('.tabs-row').forEach(row => {
    const buttons = qsa('.tab-btn', row);
    const section = row.closest('section') || document;
    const panes = qsa('.tab-pane', section);

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = 'tab-' + btn.dataset.tab;
        const targetPane = qs('#' + targetId, section);
        if (targetPane) targetPane.classList.add('active');
      });
    });
  });
}

/* ── PARTICLE CANVAS (Background effect) ──────────────────── */
function initCanvas() {
  const canvas = qs('#bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles = [];

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  };

  const createParticles = () => {
    particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.6 + 0.6
    }));
  };

  const animate = () => {
    ctx.clearRect(0, 0, width, height);

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.hypot(dx, dy);

        if (dist < 140) {
          ctx.strokeStyle = `rgba(201,168,76,${(1 - dist / 140) * 0.09})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Particles
    particles.forEach(p => {
      ctx.fillStyle = 'rgba(201,168,76,0.2)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    });

    requestAnimationFrame(animate);
  };

  resize();
  animate();

  window.addEventListener('resize', () => {
    resize();
  });
}

/* ── FLOATING CHAT ────────────────────────────────────────── */
function initChat() {
  const toggle = qs('#chat-toggle');
  const box = qs('#chatbox');
  const closeBtn = qs('.chat-close-x');
  const input = qs('#c-input');
  const sendBtn = qs('#c-send');
  const messages = qs('.chat-msgs');

  if (!toggle || !box) return;

  toggle.addEventListener('click', () => {
    const isOpen = box.style.display === 'flex';
    box.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen && input) input.focus();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      box.style.display = 'none';
    });
  }

  async function sendMessage() {
    const text = input?.value.trim();
    if (!text) return;

    input.value = '';
    messages.innerHTML += `<div class="cmsg user">${text}</div>`;
    messages.scrollTop = messages.scrollHeight;

    const tempId = 'temp-' + Date.now();
    messages.innerHTML += `<div class="cmsg bot" id="${tempId}"><i class="fas fa-circle-notch fa-spin"></i></div>`;
    messages.scrollTop = messages.scrollHeight;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch('https://morning-bush-8bd5.kushalphuyal.workers.dev/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const replyText = await response.text();
      qs('#' + tempId).innerHTML = replyText || 'No reply received.';
    } catch (err) {
      const msgEl = qs('#' + tempId);
      if (msgEl) {
        msgEl.innerHTML = err.name === 'AbortError'
          ? 'Request timeout. Please try again.'
          : 'Error connecting. <a href="https://wa.me/9779863970493" target="_blank" style="color:var(--gold)">Contact via WhatsApp</a>';
      }
    }

    messages.scrollTop = messages.scrollHeight;
  }

  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (input) {
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
}

/* ── BLOG ENGINE (Fixed indexing issue) ───────────────────── */
const BlogEngine = (() => {
  let allPosts = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let currentModalPosts = [];
  let currentModalIndex = 0;

  const categories = {
    all:     { label: 'All' },
    finance: { label: 'Finance', cls: 'tag-gold' },
    ai:      { label: 'AI', cls: 'tag-blue' },
    tax:     { label: 'Tax', cls: 'tag-red' },
    career:  { label: 'Career', cls: 'tag-green' },
    nepal:   { label: 'Nepal', cls: 'tag-dim' }
  };

  function getFilteredPosts() {
    return allPosts.filter(post => {
      const matchCategory = currentFilter === 'all' || post.category === currentFilter;
      const matchSearch = !searchQuery ||
        post.title.toLowerCase().includes(searchQuery) ||
        post.excerpt.toLowerCase().includes(searchQuery) ||
        (post.content || '').toLowerCase().includes(searchQuery);
      return matchCategory && matchSearch;
    });
  }

  function getCategoryHTML(cat) {
    const c = categories[cat] || categories.all;
    return `<span class="blog-cat ${c.cls || ''}">${c.label}</span>`;
  }

  function buildFilterButtons(containerId = 'filter-row') {
    const container = qs('#' + containerId);
    if (!container) return;

    container.innerHTML = Object.entries(categories)
      .map(([key, val]) => `
        <button class="filter-btn ${key === 'all' ? 'active' : ''}" data-cat="${key}">
          ${val.label}
        </button>`)
      .join('');

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
    const filtered = getFilteredPosts();

    // Update count
    qs('#post-count')?.setAttribute('data-count', filtered.length + ' posts');

    // Empty state
    const emptyEl = qs('#blog-empty');
    if (emptyEl) emptyEl.style.display = filtered.length ? 'none' : 'block';

    // Featured (first post)
    const featuredWrap = qs('#featured-wrap');
    if (featuredWrap) {
      if (!filtered.length) {
        featuredWrap.innerHTML = '';
      } else {
        const post = filtered[0];
        featuredWrap.innerHTML = `
          <div class="featured-post-card" onclick="BlogEngine.openModal(0)">
            <div class="featured-thumb" style="background:${post.bg || '#1c1c1c'}">
              <i class="${post.icon || 'fas fa-star'}" style="color:${post.iconColor || 'var(--gold)'}"></i>
            </div>
            <div class="featured-content">
              ${getCategoryHTML(post.category)}
              <h2>${post.title}</h2>
              <p>${post.excerpt}</p>
              <div class="meta">
                <span>📅 ${post.date}</span>
                <span>⏱ ${post.readTime}</span>
              </div>
              <button class="btn btn-gold">Read Post</button>
            </div>
          </div>`;
      }
    }

    // Regular grid
    const grid = qs('#blog-grid');
    if (grid) {
      const remaining = filtered.slice(1);
      grid.innerHTML = remaining.map((post, idx) => `
        <div class="blog-card" onclick="BlogEngine.openModal(${idx + 1})">
          <div class="blog-thumb" style="background:${post.bg || '#161616'}">
            <i class="${post.icon}" style="color:${post.iconColor || 'var(--gold)'}"></i>
          </div>
          <div class="blog-body">
            ${getCategoryHTML(post.category)}
            <h3>${post.title}</h3>
            <p>${post.excerpt}</p>
            <div class="blog-foot">
              <span>📅 ${post.date}</span>
              <span class="read-link">⏱ ${post.readTime}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  function openModal(index) {
    currentModalPosts = getFilteredPosts();
    currentModalIndex = index;

    if (currentModalPosts.length === 0) return;

    loadModalContent(currentModalIndex);
    const overlay = qs('#blog-modal');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function loadModalContent(idx) {
    const post = currentModalPosts[idx];
    if (!post) return;

    const modal = qs('#blog-modal');
    if (!modal) return;

    qs('#modal-img', modal).style.background = post.bg || '#1c1c1c';
    qs('#modal-img', modal).innerHTML = `<i class="${post.icon}" style="color:${post.iconColor || 'var(--gold)'}"></i>`;

    qs('#modal-cat', modal).innerHTML = getCategoryHTML(post.category);
    qs('#modal-title', modal).textContent = post.title;
    qs('#modal-meta', modal).innerHTML = `<span>📅 ${post.date}</span><span>⏱ ${post.readTime}</span><span>✍️ Kushal Phuyal</span>`;
    qs('#modal-body', modal).innerHTML = post.content || '<p>No content available.</p>';

    qs('#modal-prev', modal).disabled = idx === 0;
    qs('#modal-next', modal).disabled = idx === currentModalPosts.length - 1;

    qs('.modal-box', modal).scrollTop = 0;
  }

  function closeModal() {
    const overlay = qs('#blog-modal');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function navigateModal(direction) {
    const newIndex = currentModalIndex + direction;
    if (newIndex < 0 || newIndex >= currentModalPosts.length) return;
    currentModalIndex = newIndex;
    loadModalContent(currentModalIndex);
  }

  function init(data, filterContainerId = 'filter-row') {
    allPosts = Array.isArray(data) ? data : [];
    buildFilterButtons(filterContainerId);
    renderPosts();

    // Search
    const searchInput = qs('#search-input');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        searchQuery = e.target.value.trim().toLowerCase();
        renderPosts();
      });
    }

    // Modal events
    const modal = qs('#blog-modal');
    if (modal) {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal();
      });

      qs('#modal-prev', modal)?.addEventListener('click', () => navigateModal(-1));
      qs('#modal-next', modal)?.addEventListener('click', () => navigateModal(1));
      qs('.modal-close', modal)?.addEventListener('click', closeModal);
    }

    document.addEventListener('keydown', e => {
      if (!qs('#blog-modal.open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') navigateModal(-1);
      if (e.key === 'ArrowRight') navigateModal(1);
    });
  }

  return {
    init,
    openModal,
    closeModal,
    navigateModal
  };
})();

/* ── LIGHTBOX ─────────────────────────────────────────────── */
const Lightbox = (() => {
  let images = [];
  let currentIndex = 0;

  function updateDisplay() {
    const img = qs('#lb-img');
    const caption = qs('#lb-cap');
    const counter = qs('#lb-cnt');
    const progress = qs('#lb-bar');

    if (!img) return;

    img.src = images[currentIndex].src;
    img.alt = images[currentIndex].caption || '';

    if (caption) caption.textContent = images[currentIndex].caption || '';
    if (counter) counter.textContent = `${currentIndex + 1} / ${images.length}`;
    if (progress) progress.style.width = ((currentIndex + 1) / images.length * 100) + '%';
  }

  function open(index, imageArray) {
    if (!imageArray?.length) return;
    images = imageArray;
    currentIndex = index;
    updateDisplay();

    const lb = qs('#lightbox');
    if (lb) {
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function close() {
    const lb = qs('#lightbox');
    if (lb) {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function prev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateDisplay();
  }

  function next() {
    currentIndex = (currentIndex + 1) % images.length;
    updateDisplay();
  }

  function init() {
    const lb = qs('#lightbox');
    if (!lb) return;

    lb.addEventListener('click', e => {
      if (e.target === lb) close();
    });

    qs('#lb-close')?.addEventListener('click', close);
    qs('#lb-prev')?.addEventListener('click', prev);
    qs('#lb-next')?.addEventListener('click', next);

    document.addEventListener('keydown', e => {
      if (!qs('#lightbox.open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // Touch swipe
    let touchStartX = 0;
    lb.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lb.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 60) {
        diff > 0 ? prev() : next();
      }
    });
  }

  return { init, open, close };
})();

/* ── DOM READY ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  yr();
  initNav();
  initReveal();
  initSkillBars();
  initTabs();
  initCanvas();
  initChat();
  Lightbox.init();

  // BlogEngine.init() लाई तपाईंले HTML मा data पास गरेर कल गर्नुपर्छ
  // उदाहरण:
  // BlogEngine.init(window.blogPosts || [], 'filter-row');
}); // <-- यो क्लोज गर्न नबिर्सनुहोस्