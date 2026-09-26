/* =========================================================
   B&A SIGN — main.js
   GSAP + ScrollTrigger + Lenis (via CDN). Sem build step.
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Config ---------- */
  const WA_NUMBER = '5535992451801';
  const WA_DEFAULT_MSG = 'Olá, B&A Sign! Vim pelo site e quero um orçamento.';

  const root = document.documentElement;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const isDesktop = () => window.matchMedia('(min-width: 900px)').matches;

  /* ---------- Links de WhatsApp ----------
     Qualquer elemento com [data-wa] vira link de orçamento.
     Use data-wa-msg="..." para uma mensagem específica. */
  const waLink = (msg = WA_DEFAULT_MSG) =>
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  document.querySelectorAll('[data-wa]').forEach((el) => {
    el.setAttribute('href', waLink(el.dataset.waMsg || WA_DEFAULT_MSG));
  });

  /* ---------- Ano no rodapé ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Revelação da headline (0 → 1) ----------
     Move a janela inclinada (.t-mask) para a direita e a camada cromada
     para a esquerda na mesma medida: o texto fica parado, a borda avança.
     Só transform → sem redesenho de texto durante a rolagem. */
  const SKEW = 20;          // graus de inclinação da borda
  const SLACK = 0.2;        // folga para a borda inclinada entrar/sair por completo
  const masks = document.querySelectorAll('.t-mask');
  const fill = document.querySelector('.t-layer--fill');
  const setReveal = (p) => {
    const t = -SLACK + p * (1 + 2 * SLACK);            // em larguras do título
    const m = `translate3d(${(t * 100 / 3).toFixed(3)}%,0,0) skewX(${-SKEW}deg)`;
    masks.forEach((el) => { el.style.transform = m; });
    if (fill) fill.style.transform = `translate3d(${(-t * 100).toFixed(3)}%,0,0) skewX(${SKEW}deg)`;
  };
  setReveal(0);

  /* Sem GSAP (CDN fora do ar): mostra tudo estático e sai. */
  if (!hasGSAP) {
    root.classList.remove('js-anim');
    setReveal(1);
    initHeader(null);
    initMobileMenu(null);
    initServices();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.15, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Âncoras internas passam pelo Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target && id !== '#topo') return;
      e.preventDefault();
      closeMenu();
      const dest = id === '#topo' ? 0 : target;
      if (lenis) lenis.scrollTo(dest, { offset: 0, duration: 1.4 });
      else if (dest === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  initHeader(lenis);
  initMobileMenu(lenis);
  if (finePointer && !reduceMotion) initCursor();
  initHero();
  initMaterials();
  initServices();

  /* =========================================================
     Header: fundo aparece depois de rolar
     ========================================================= */
  function initHeader(lenisInstance) {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const update = (y) => header.classList.toggle('is-scrolled', y > 40);
    if (lenisInstance) lenisInstance.on('scroll', ({ scroll }) => update(scroll));
    else window.addEventListener('scroll', () => update(window.scrollY), { passive: true });
    update(window.scrollY);
  }

  /* =========================================================
     Menu mobile
     ========================================================= */
  function initMobileMenu(lenisInstance) {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = !document.body.classList.contains('nav-open');
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      menu.setAttribute('aria-hidden', String(!open));
      if (lenisInstance) open ? lenisInstance.stop() : lenisInstance.start();
    });
    menu.querySelectorAll('a[data-wa]').forEach((a) => a.addEventListener('click', closeMenu));
  }
  function closeMenu() {
    if (!document.body.classList.contains('nav-open')) return;
    document.querySelector('.menu-toggle')?.click();
  }

  /* =========================================================
     Cursor customizado + efeito magnético
     ========================================================= */
  function initCursor() {
    const cursor = document.querySelector('.cursor');
    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    root.classList.add('has-cursor');

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power3' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power3' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });

    let shown = false;
    window.addEventListener('pointermove', (e) => {
      if (!shown) {
        shown = true;
        gsap.set([dot, ring], { x: e.clientX, y: e.clientY });
        gsap.to(cursor, { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX); dotY(e.clientY);
      ringX(e.clientX); ringY(e.clientY);
    }, { passive: true });
    window.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    window.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => gsap.to(cursor, { autoAlpha: 0, duration: 0.2 }));
    document.addEventListener('mouseenter', () => gsap.to(cursor, { autoAlpha: 1, duration: 0.2 }));

    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    // Magnético: o elemento é puxado em direção ao cursor
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 0.35;
      const mx = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
      const my = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * strength);
        my((e.clientY - (r.top + r.height / 2)) * strength);
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* =========================================================
     HERO
     1) Intro: feixes → B e A deslizam de lados opostos → flash de impacto
        → & gira → SIGN revelado → headline sobe da máscara.
     2) Scroll: lâmina de luz varre a headline e a preenche de cromo.
        Desktop: hero fica "pinado" e as camadas se movem em parallax.
        Mobile: a revelação acontece sozinha após a intro (sem pin).
     ========================================================= */
  function initHero() {
    const blade = document.querySelector('.t-blade');
    const logo = document.querySelector('.logo3d');
    const reveal = { p: 0 };
    const setP = () => setReveal(reveal.p);

    if (reduceMotion) {
      reveal.p = 1; setP();
      logo.classList.add('is-lit');
      return;
    }

    const start = () => {
      window.__introStarted = true;
      buildIntro();
      buildScroll();
    };
    // Espera as fontes para não animar com a fonte de fallback
    (document.fonts?.ready ?? Promise.resolve()).then(start);

    function buildIntro() {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.to('.hero__bg', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
        .fromTo('.hero__slash', { opacity: 0, xPercent: 12 }, { opacity: 1, xPercent: 0, duration: 1.6 }, 0.1)
        .fromTo('.beams', { opacity: 0, scaleX: 0.4 }, { opacity: 1, scaleX: 1, duration: 1.6, stagger: 0.1 }, 0.15)

        // B vem da esquerda, A da direita (só transform + opacidade)
        .fromTo('.logo3d__letter--b', { x: '-70vw', opacity: 0 },
          { x: 0, opacity: 1, duration: 1.05, ease: 'expo.out' }, 0.35)
        .fromTo('.logo3d__letter--a', { x: '70vw', opacity: 0 },
          { x: 0, opacity: 1, duration: 1.05, ease: 'expo.out' }, 0.35)

        // Flash de impacto
        .fromTo('.hero__flare', { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power4.out' }, 0.72)
        .to('.hero__flare', { opacity: 0, scale: 1.5, duration: 1, ease: 'power2.out' }, 0.9)
        .fromTo('.logo3d__mark', { x: 0 }, { x: 6, duration: 0.05, repeat: 3, yoyo: true, ease: 'none', clearProps: 'x' }, 0.72)

        // & e SIGN
        .fromTo('.logo3d__amp', { opacity: 0, scale: 0, rotate: -120 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: 'back.out(2.2)' }, 0.85)
        .fromTo('.logo3d__sign', { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(-30% -10% -30% -5%)', duration: 0.9, ease: 'power3.inOut' }, 0.95)
        .fromTo('.logo3d__tag', { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 1 }, 1.3)
        .add(() => logo.classList.add('is-lit'), 1.35)

        // Headline sobe de dentro da máscara (contorno e preenchimento juntos)
        .to('.t-layer--outline .t-inner', { y: 0, yPercent: 0, duration: 1.1, stagger: 0.09 }, 1.1)
        .to('.t-layer--fill .t-inner',    { y: 0, yPercent: 0, duration: 1.1, stagger: 0.09 }, 1.1)
        .fromTo('.hero [data-intro]', { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 1.4)
        .fromTo('.site-header', { opacity: 0, yPercent: -100 },
          { opacity: 1, yPercent: 0, duration: 1 }, 1.4);

      // Mobile: a lâmina de luz passa sozinha depois da entrada
      if (!isDesktop()) {
        tl.set(blade, { opacity: 1 }, 2.0)
          .to(reveal, { p: 1, duration: 1.5, ease: 'power2.inOut', onUpdate: setP }, 2.0)
          .to(blade, { opacity: 0, duration: 0.3 }, 3.3);
      }
    }

    function buildScroll() {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 900px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: '+=140%',
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        tl.fromTo(reveal, { p: 0 }, { p: 1, duration: 1, ease: 'none', onUpdate: setP, immediateRender: false }, 0)
          .to(blade, { opacity: 1, duration: 0.05 }, 0)
          .to(blade, { opacity: 0, duration: 0.1 }, 0.95)
          // Logo recua enquanto a headline é revelada
          .to('.hero__logo', { yPercent: -14, scale: 0.88, opacity: 0.28, ease: 'none', duration: 1.4 }, 0.25)
          .to('.hero__copy', { y: -60, ease: 'none', duration: 0.6 }, 1.0);
      });

      mm.add('(max-width: 899px)', () => {
        gsap.to('.hero__logo', {
          yPercent: -18, opacity: 0.35, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
        });
      });

      // Recalcula depois que tudo (fontes/imagens) carregou
      // O pin do hero é criado depois dos gatilhos das outras seções: reordena e recalcula
      ScrollTrigger.sort();
      if (document.readyState === 'complete') ScrollTrigger.refresh();
      else window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  /* =========================================================
     02 · MATERIAIS
     Cada peça tem uma luz (--x/--y) e uma inclinação (--tx/--ty).
     Parada por padrão; com o mouse em cima, a luz segue o ponteiro
     (mistura suave entre repouso e ponteiro via "w").
     Nada roda durante a rolagem além da entrada (uma vez).
     ========================================================= */
  function initMaterials() {
    const mats = gsap.utils.toArray('[data-mat]');
    if (!mats.length) return;

    // Espessura real das letras em PVC: camadas empilhadas em Z
    document.querySelectorAll('.pvc').forEach((pvc) => {
      const front = pvc.querySelector('.pvc__layer--front');
      const n = isDesktop() ? 10 : 6;
      const depth = parseFloat(getComputedStyle(pvc).getPropertyValue('--depth')) || 26;
      pvc.style.setProperty('--step', `${depth / n}px`);
      for (let i = n; i >= 1; i--) {
        const layer = document.createElement('span');
        layer.className = 'pvc__layer';
        layer.style.setProperty('--i', i);
        layer.textContent = front.textContent;
        pvc.insertBefore(layer, front);
      }
    });

    mats.forEach((mat) => {
      const stage = mat.querySelector('.mat__stage');
      const slab = mat.querySelector('.mat__slab');
      const info = mat.querySelector('.mat__info');
      const base = { x: 0.3, y: 0.3 };
      const ptr = { x: 0.5, y: 0.5 };
      const mix = { w: 0 };

      const apply = () => {
        const x = base.x + (ptr.x - base.x) * mix.w;
        const y = base.y + (ptr.y - base.y) * mix.w;
        mat.style.setProperty('--x', x.toFixed(3));
        mat.style.setProperty('--y', y.toFixed(3));
        if (!reduceMotion) {
          mat.style.setProperty('--tx', ((x - 0.5) * 2).toFixed(3));
          mat.style.setProperty('--ty', ((y - 0.5) * 2).toFixed(3));
        }
      };
      apply();

      if (finePointer) {
        const qx = gsap.quickTo(ptr, 'x', { duration: 0.5, ease: 'power3', onUpdate: apply });
        const qy = gsap.quickTo(ptr, 'y', { duration: 0.5, ease: 'power3', onUpdate: apply });
        stage.addEventListener('pointerenter', () => {
          mat.classList.add('is-hot');
          gsap.to(mix, { w: 1, duration: 0.6, ease: 'power2.out', onUpdate: apply, overwrite: true });
        });
        stage.addEventListener('pointermove', (e) => {
          // Lê as medidas antes de escrever estilos (evita recalcular layout a cada movimento)
          const s = stage.getBoundingClientRect();
          const r = slab.getBoundingClientRect();
          // Lupa: coordenadas do palco (plano) → segue o cursor exatamente
          mat.style.setProperty('--lx', ((e.clientX - s.left) / s.width).toFixed(3));
          mat.style.setProperty('--ly', ((e.clientY - s.top) / s.height).toFixed(3));
          // Luz: coordenadas da peça
          qx(gsap.utils.clamp(-0.1, 1.1, (e.clientX - r.left) / r.width));
          qy(gsap.utils.clamp(-0.1, 1.1, (e.clientY - r.top) / r.height));
        });
        stage.addEventListener('pointerleave', () => {
          mat.classList.remove('is-hot');
          gsap.to(mix, { w: 0, duration: 0.9, ease: 'power2.out', onUpdate: apply, overwrite: true });
        });
      } else {
        // Toque: liga/desliga o estado "ativo" (ex.: vinil descolando no PS)
        stage.addEventListener('click', () => mat.classList.toggle('is-hot'));
      }

      if (reduceMotion) return;

      // Entrada (uma vez só)
      gsap.from(stage, {
        y: 90, opacity: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: mat, start: 'top 85%', once: true },
      });
      gsap.from(info, {
        y: 60, opacity: 0, duration: 1.1, delay: 0.15, ease: 'expo.out',
        scrollTrigger: { trigger: mat, start: 'top 75%', once: true },
      });
    });

    if (reduceMotion) return;

    gsap.from('.mats__title span, .mats__lead, .mats__head .kicker', {
      y: 50, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.mats__head', start: 'top 80%', once: true },
    });
  }

  /* =========================================================
     03 · SERVIÇOS
     Desktop: uma lâmina sempre aberta; abre ao clicar ou ao
     parar o mouse sobre ela (pequeno atraso evita abrir tudo ao
     atravessar a lista). Mobile: toque abre/fecha.
     Não depende do GSAP (funciona mesmo se o CDN falhar).
     ========================================================= */
  function initServices() {
    const list = document.querySelector('[data-svc]');
    if (!list) return;
    const items = [...list.querySelectorAll('.svc__item')];
    const desktop = window.matchMedia('(min-width: 900px)');

    const setOpen = (target) => {
      items.forEach((item) => {
        const open = item === target;
        item.classList.toggle('is-open', open);
        item.querySelector('.svc__tab').setAttribute('aria-expanded', String(open));
      });
      // Alturas mudam no mobile: recalcula os gatilhos de scroll depois da transição
      if (!desktop.matches && window.ScrollTrigger) {
        clearTimeout(setOpen.t);
        setOpen.t = setTimeout(() => ScrollTrigger.refresh(), 600);
      }
    };

    items.forEach((item) => {
      const tab = item.querySelector('.svc__tab');
      tab.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        if (isOpen && !desktop.matches) setOpen(null);   // mobile: permite fechar tudo
        else setOpen(item);
      });

      if (finePointer) {
        let timer;
        item.addEventListener('mouseenter', () => {
          if (!desktop.matches) return;
          timer = setTimeout(() => setOpen(item), 140);
        });
        item.addEventListener('mouseleave', () => clearTimeout(timer));
      }
    });

    // Ao voltar para o desktop, garante uma lâmina aberta
    desktop.addEventListener('change', () => {
      if (desktop.matches && !items.some((i) => i.classList.contains('is-open'))) setOpen(items[0]);
    });

    if (!hasGSAP || reduceMotion) return;
    gsap.from('.svcs__head > *', {
      y: 50, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'expo.out',
      scrollTrigger: { trigger: '.svcs__head', start: 'top 80%', once: true },
    });
    gsap.from(list, {
      y: 70, opacity: 0, duration: 1.2, ease: 'expo.out',
      scrollTrigger: { trigger: list, start: 'top 85%', once: true },
    });
  }
})();
