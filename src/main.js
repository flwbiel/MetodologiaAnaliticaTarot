(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // loading: anima a carta (uns 10s no total)
  const loader = document.getElementById("loadingScreen");
  const tarotSVG = document.getElementById("tarotSVG");
  let appReady = false;

  function animateLoader() {
    if (!loader || !tarotSVG) {
      appReady = true;
      document.body.classList.add("ready");
      return;
    }
    document.body.style.overflow = "hidden";
    const strokes = $$("[data-stroke]", tarotSVG);
    const lengths = strokes.map(
      (el) => (el.getTotalLength && el.getTotalLength()) || 600
    );
    const totalLen = lengths.reduce((a, b) => a + b, 0);
    // Prepare strokes for draw animation
    strokes.forEach((el, i) => {
      const len = lengths[i];
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.style.transition = "none";
    });
    const duration = 8000; // 8s desenhando
    const fade = 2000; // 2s de fade pra sair
    const t0 = performance.now();

    function frame(now) {
      const p = Math.max(0, Math.min(1, (now - t0) / duration));
      const target = totalLen * p;
      let acc = 0;
      for (let i = 0; i < strokes.length; i++) {
        const len = lengths[i];
        const start = acc;
        const end = acc + len;
        let drawn = 0;
        if (target <= start) drawn = 0;
        else if (target >= end) drawn = len;
        else drawn = target - start;
        strokes[i].style.strokeDashoffset = String(len - drawn);
        acc = end;
      }
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        loader.classList.add("hidden");
        document.body.classList.add("ready");
        document.body.style.overflow = "";
        setTimeout(() => {
          appReady = true;
          onAppReady();
        }, fade);
      }
    }
    requestAnimationFrame(frame);
  }

  function onAppReady() {
    // se tiver hash, já abro direto no slide certo
    if (location.hash) {
      openCarousel(location.hash);
    }
  }

  // começa o loader já de cara
  animateLoader();

  // elementos da landing e do carrossel (materialize)
  const landing = document.getElementById("landing");
  const openBtn = document.getElementById("openCarousel");
  const overlay = document.getElementById("carouselOverlay");
  const slider = document.getElementById("carouselSlider");
  const nextBtn = document.getElementById("carouselNext");
  const prevBtn = document.getElementById("carouselPrev");
  const closeBtn = document.getElementById("carouselClose");

  let instance = null;
  let order = [];
  let resizeObserver = null;

  function initCarousel() {
    if (!slider) return;
    if (instance && typeof instance.destroy === "function") {
      instance.destroy();
      instance = null;
    }
    // ordem dos slides = pelos ids
    order = Array.from(slider.querySelectorAll(".carousel-item")).map(
      (el) => `#${el.id}`
    );
    if (typeof M === "undefined" || !M.Carousel) {
      console.error("MaterializeJS não carregou. Verifique a tag de script.");
      return;
    }
    instance = M.Carousel.init(slider, {
      fullWidth: true,
      indicators: false,
      noWrap: true, // não deixa pular do fim pro início
    });
  }

  function openCarousel(targetHash) {
    // mostro o overlay antes, pra materialize calcular os tamanhos certo
    landing && (landing.hidden = true);
    overlay && (overlay.hidden = false);
    document.body.style.overflow = "hidden";
    document.body.classList.add("carousel-open");

    attachCornerLoaders();
    initCarousel();

    if (instance) {
      if (targetHash) {
        const idx = order.indexOf(targetHash);
        if (idx >= 0) instance.set(idx);
        history.replaceState(null, "", targetHash);
      } else {
        instance.set(0);
        if (order[0]) history.replaceState(null, "", order[0]);
      }
    }
    focusActiveHeading();
    requestAnimationFrame(adjustScrollableArea);
    requestAnimationFrame(updateNavDisabled);
  }

  function closeCarousel() {
    overlay && (overlay.hidden = true);
    landing && (landing.hidden = false);
    document.body.style.overflow = "";
    document.body.classList.remove("carousel-open");
    history.replaceState(null, "", location.pathname + location.search);
  }

  function next() {
    if (atLast()) return;
    instance && instance.next();
    syncHash();
    focusActiveHeading();
    updateNavDisabled();
  }
  function prev() {
    if (atFirst()) return;
    instance && instance.prev();
    syncHash();
    focusActiveHeading();
    updateNavDisabled();
  }
  function adjustScrollableArea() {
    try {
      const bodies = $$(".carousel-item .card__body", slider);
      const headerHeights = $$(".carousel-item .card__header", slider).map(
        (h) => h.getBoundingClientRect().height
      );
      // Prefer CSS variable height if available
      const cs = slider ? getComputedStyle(slider) : null;
      const varH = cs ? cs.getPropertyValue("--carouselH").trim() : "";
      const sliderH = slider ? slider.getBoundingClientRect().height : 0;
      bodies.forEach((body, i) => {
        const headerH = headerHeights[i] || 80;
        // Use actual slider height; fallback to previous heuristic
        const containerH =
          sliderH ||
          (varH ? parseFloat(varH) : Math.min(window.innerHeight * 0.86, 800));
        const maxH = containerH - (headerH + 32);
        body.style.maxHeight = `${Math.max(200, maxH)}px`;
      });
    } catch {}
  }

  function activeIndex() {
    if (!instance) return 0;
    // o materialize guarda o índice do centro em instance.center
    return instance.center || 0;
  }
  function atFirst() {
    return activeIndex() <= 0;
  }
  function atLast() {
    return activeIndex() >= Math.max(0, order.length - 1);
  }
  function syncHash() {
    const i = activeIndex();
    const h = order[i];
    if (h) history.replaceState(null, "", h);
  }
  function updateNavDisabled() {
    const i = activeIndex();
    const last = Math.max(0, order.length - 1);
    if (prevBtn) prevBtn.toggleAttribute("disabled", i <= 0);
    if (nextBtn) nextBtn.toggleAttribute("disabled", i >= last);
  }
  function focusActiveHeading() {
    if (!slider) return;
    const i = activeIndex();
    const active = slider.querySelectorAll(".carousel-item")[i];
    if (!active) return;
    const h = active.querySelector("h1, h2, h3");
    if (h) {
      if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
      h.focus({ preventScroll: true });
    }
  }

  // eventos de clique e teclado
  if (openBtn) openBtn.addEventListener("click", () => openCarousel());
  if (closeBtn) closeBtn.addEventListener("click", closeCarousel);
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);

  window.addEventListener("keydown", (e) => {
    const on = overlay && !overlay.hidden;
    if (!on) return;
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
    if (e.key === "Escape") closeCarousel();
  });

  // recalcula tamanhos quando troca slide ou quando a janela muda
  window.addEventListener("resize", () =>
    requestAnimationFrame(adjustScrollableArea)
  );
  const observer = new MutationObserver(() => {
    requestAnimationFrame(adjustScrollableArea);
    requestAnimationFrame(updateNavDisabled);
  });
  if (slider)
    observer.observe(slider, {
      attributes: true,
      attributeFilter: ["style", "class"],
      subtree: true,
    });

  // drag/swipe o materialize já cuida

  // abre via hash (se tiver) depois do loader
  function fromHash() {
    const h = location.hash;
    if (!h) return;
    if (appReady) openCarousel(h);
  }
  window.addEventListener("hashchange", fromHash);
  // do not open immediately; wait for loader to finish via onAppReady
})();

// injeta uma mini carta no canto inferior direito de cada slide, animando em loop
function attachCornerLoaders() {
  const slider = document.getElementById("carouselSlider");
  if (!slider) return;
  const items = Array.from(slider.querySelectorAll(".carousel-item"));
  items.forEach((item) => {
    const existing = item.querySelector(".corner-loader");
    if (existing) {
      const svg = existing.querySelector("svg");
      if (svg && !svg.dataset.miniAnimated) animateMiniSVG(svg, 3800);
      return;
    }
    const box = document.createElement("div");
    box.className = "corner-loader";
    box.innerHTML = miniLoaderSVG();
    item.appendChild(box);
    const svg = box.querySelector("svg");
    if (svg) animateMiniSVG(svg, 3800);
  });
}

function miniLoaderSVG() {
  return `
  <svg class="corner-loader__svg" viewBox="0 0 300 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
      <rect data-mini-stroke x="20" y="20" width="260" height="440" rx="24" ry="24" />
      <rect data-mini-stroke x="50" y="50" width="200" height="380" rx="16" ry="16" />
      <line data-mini-stroke x1="90" y1="90" x2="210" y2="90" />
      <line data-mini-stroke x1="110" y1="115" x2="190" y2="115" />
      <polygon data-mini-stroke points="150,175 165,215 210,215 172,242 185,282 150,258 115,282 128,242 90,215 135,215" />
      <path data-mini-stroke d="M195 320c0 30-24 54-54 54-8 0-16-2-22-5 22-8 38-29 38-53s-16-45-38-53c6-3 14-5 22-5 30 0 54 24 54 54z" />
      <line data-mini-stroke x1="90" y1="370" x2="210" y2="370" />
      <line data-mini-stroke x1="110" y1="395" x2="190" y2="395" />
    </g>
  </svg>`;
}

// anima o SVG da mini carta igual ao loader (desenho progressivo), em loop
function animateMiniSVG(svg, duration = 3200) {
  try {
    const strokes = Array.from(
      svg.querySelectorAll("[data-mini-stroke], [data-stroke]")
    );
    if (!strokes.length) return;
    const lengths = strokes.map(
      (el) => (el.getTotalLength && el.getTotalLength()) || 600
    );
    const totalLen = lengths.reduce((a, b) => a + b, 0);
    // prepara os traços
    strokes.forEach((el, i) => {
      const len = lengths[i];
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = `${len}`;
      el.style.transition = "none";
    });
    const t0 = performance.now();
    function tick(now) {
      const elapsed = now - t0;
      // ping-pong: 0..1 (forward), 1..0 (backward), mantendo a mesma velocidade
      const cycle = (elapsed % (duration * 2)) / duration; // 0..2
      const p = cycle < 1 ? cycle : 2 - cycle; // 0->1->0
      const target = totalLen * p;
      let acc = 0;
      for (let i = 0; i < strokes.length; i++) {
        const len = lengths[i];
        const start = acc;
        const end = acc + len;
        let drawn = 0;
        if (target <= start) drawn = 0;
        else if (target >= end) drawn = len;
        else drawn = target - start;
        strokes[i].style.strokeDashoffset = String(len - drawn);
        acc = end;
      }
      requestAnimationFrame(tick);
    }
    svg.dataset.miniAnimated = "1";
    requestAnimationFrame(tick);
  } catch {}
}
