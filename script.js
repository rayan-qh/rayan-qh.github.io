
/* Progressive enhancement only. All core text and navigation work without JS. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  const header = document.getElementById('siteHeader');
  const readingLine = document.getElementById('readingLine');
  let queued = false;
  const updateScroll = () => {
    const possible = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    readingLine.style.width = `${Math.min(100, (scrollY / possible) * 100)}%`;
    header.classList.toggle('scrolled', scrollY > 24);
    queued = false;
  };
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();

  const menuButton = document.getElementById('menuButton');
  const nav = document.getElementById('primaryNav');
  const closeMenu = () => { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); menuButton.setAttribute('aria-label','Open menu'); document.body.classList.remove('no-scroll'); };
  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('no-scroll', isOpen);
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  addEventListener('resize', () => { if (innerWidth > 640) closeMenu(); });


  document.querySelectorAll('.project-gallery').forEach(gallery => {
    const tabs = [...gallery.querySelectorAll('.gallery-tab')];
    const panes = [...gallery.querySelectorAll('.gallery-pane')];
    tabs.forEach(tab => tab.addEventListener('click', () => {
      const mode = tab.dataset.show;
      tabs.forEach(btn => {
        const active = btn === tab;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      panes.forEach(pane => {
        const active = pane.dataset.panel === mode;
        pane.classList.toggle('active', active);
        pane.hidden = !active;
      });
      const counter = gallery.querySelector('.gallery-counter');
      const idx = tabs.indexOf(tab) + 1;
      if (counter) counter.textContent = `${String(idx).padStart(2,'0')} : ${String(tabs.length).padStart(2,'0')}`;
    }));

    if (!coarsePointer && !reducedMotion) {
      let raf = 0;
      const preview = gallery.querySelector('[data-panel="overview"]');
      const lens = preview?.querySelector('.lens-reveal');
      preview?.addEventListener('pointerenter', () => lens?.classList.add('lens-on'));
      preview?.addEventListener('pointerleave', () => lens?.classList.remove('lens-on'));
      preview?.addEventListener('pointermove', e => {
        if (raf) return;
        const clientX = e.clientX, clientY = e.clientY;
        raf = requestAnimationFrame(() => {
          const r = preview.getBoundingClientRect();
          preview.style.setProperty('--lens-x', `${clientX - r.left}px`);
          preview.style.setProperty('--lens-y', `${clientY - r.top}px`);
          raf = 0;
        });
      });
    }
  });

  const stage = document.getElementById('methodStage');
  const reveal = document.getElementById('revealToggle');
  let fullyRevealed = false;
  const updateRevealed = () => {
    stage.classList.toggle('full-reveal', fullyRevealed);
    stage.classList.remove('pointer-active');
    reveal.setAttribute('aria-pressed', String(fullyRevealed));
    reveal.innerHTML = fullyRevealed ? 'Show surface <span aria-hidden="true">↶</span>' : 'Reveal engineering <span aria-hidden="true">↗</span>';
    stage.style.setProperty('--reveal-radius', '0px');
  };
  reveal?.addEventListener('click', () => { fullyRevealed = !fullyRevealed; updateRevealed(); });
  if (!coarsePointer && !reducedMotion) {
    let raf = 0;
    stage?.addEventListener('pointerenter', () => {
      if (fullyRevealed) return;
      stage.classList.add('pointer-active');
      stage.style.setProperty('--reveal-radius', '118px');
    });
    stage?.addEventListener('pointerleave', () => {
      stage.classList.remove('pointer-active');
      stage.style.setProperty('--reveal-radius', '0px');
    });
    stage?.addEventListener('pointermove', e => {
      if (fullyRevealed || raf) return;
      const x = e.clientX, y = e.clientY;
      raf = requestAnimationFrame(() => {
        const r = stage.getBoundingClientRect();
        const clampedX = Math.min(r.width, Math.max(0, x - r.left));
        const clampedY = Math.min(r.height, Math.max(0, y - r.top));
        stage.style.setProperty('--reveal-x', `${clampedX}px`);
        stage.style.setProperty('--reveal-y', `${clampedY}px`);
        raf = 0;
      });
    });
  }

  const copyEmail = document.getElementById('copyEmail');
  const toast = document.getElementById('copyToast');
  let toastTimeout;
  copyEmail?.addEventListener('click', async () => {
    const email = 'rayan18q@gmail.com';
    let copied = false;
    try {
      await navigator.clipboard.writeText(email); copied = true;
    } catch (_) {
      const input = document.createElement('textarea');
      input.value = email; input.setAttribute('readonly','');
      input.style.position = 'fixed'; input.style.top = '-9999px';
      document.body.appendChild(input); input.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      input.remove();
    }
    toast.textContent = copied ? 'Email address copied' : `Email: ${email}`;
    toast.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('visible'), 2600);
  });

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const sections = [...document.querySelectorAll('.section-heading, .project-heading, .method-head, .about-title, .about-credentials, .contact-top')];
    sections.forEach(el => el.classList.add('reveal-on-scroll'));
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { rootMargin: '0px 0px -60px 0px', threshold: .05 });
    sections.forEach(el => observer.observe(el));
  }
})();

