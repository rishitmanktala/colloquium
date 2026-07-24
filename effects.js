/* ──────────────────────────────────────────────────────────────────────
   Colloquium 2.0 — V2 interactive effects
   Custom cursor · magnetic buttons · 3D tilt cards · marquee loop ·
   committee filters · count-up numbers · back-to-top · hero parallax
   All effects respect prefers-reduced-motion and skip on touch devices.
   ────────────────────────────────────────────────────────────────────── */

(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- Custom cursor ---------------- */
  if (isFinePointer && !reduceMotion) {
    const dot = document.getElementById("cursorDot");
    const glow = document.getElementById("cursorGlow");
    let dotX = 0, dotY = 0, glowX = 0, glowY = 0;
    let hasMoved = false;

    window.addEventListener("mousemove", (e) => {
      dotX = e.clientX;
      dotY = e.clientY;
      if (!hasMoved) {
        hasMoved = true;
        document.documentElement.classList.add("cursor-ready");
        glowX = dotX;
        glowY = dotY;
      }
    });

    const raf = () => {
      glowX += (dotX - glowX) * 0.16;
      glowY += (dotY - glowY) * 0.16;
      if (dot) dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
      if (glow) glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    const hoverables = "a, button, summary, input, .tilt-card, .filter-pill";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest && e.target.closest(hoverables)) {
        glow?.classList.add("is-active");
      }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest && e.target.closest(hoverables)) {
        glow?.classList.remove("is-active");
      }
    });

    document.addEventListener("mouseleave", () => {
      document.documentElement.classList.remove("cursor-ready");
    });
    document.addEventListener("mouseenter", () => {
      if (hasMoved) document.documentElement.classList.add("cursor-ready");
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (isFinePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach((el) => {
      let rect = null;
      el.addEventListener("mouseenter", () => {
        rect = el.getBoundingClientRect();
      });
      el.addEventListener("mousemove", (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        const relX = e.clientX - rect.left - rect.width / 2;
        const relY = e.clientY - rect.top - rect.height / 2;
        const strength = 0.28;
        el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0, 0)";
        rect = null;
      });
    });
  }

  /* ---------------- 3D tilt cards with spotlight ---------------- */
  if (isFinePointer && !reduceMotion) {
    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * 14;
        const rotateX = (0.5 - py) * 14;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        card.style.setProperty("--mx", `${px * 100}%`);
        card.style.setProperty("--my", `${py * 100}%`);
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------- Hero emblem parallax tilt ---------------- */
  const heroSection = document.querySelector(".hero-section");
  const emblemTilt = document.getElementById("emblemTilt");
  if (heroSection && emblemTilt && isFinePointer && !reduceMotion) {
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      emblemTilt.style.transform = `perspective(700px) rotateX(${py * -10}deg) rotateY(${px * 10}deg)`;
    });
    heroSection.addEventListener("mouseleave", () => {
      emblemTilt.style.transform = "";
    });
  }

  /* ---------------- Marquee: duplicate track for seamless loop ---------------- */
  const marqueeTrack = document.getElementById("quickFactsTrack");
  if (marqueeTrack) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  /* ---------------- Committee filter pills ---------------- */
  const filterPills = document.querySelectorAll(".filter-pill");
  const committeeCards = document.querySelectorAll(".committee-card");
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => {
        p.classList.remove("active");
        p.setAttribute("aria-selected", "false");
      });
      pill.classList.add("active");
      pill.setAttribute("aria-selected", "true");

      const filter = pill.dataset.filter;
      committeeCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        const show = filter === "all" || categories.includes(filter);
        card.classList.toggle("filtered-out", !show);
      });
    });
  });

  /* ---------------- Count-up numbers on scroll into view ---------------- */
  const countEls = document.querySelectorAll(".count-value");
  if (countEls.length) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (reduceMotion) {
        el.textContent = target.toLocaleString("en-IN");
        return;
      }
      const duration = 1100;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString("en-IN");
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ("IntersectionObserver" in window) {
      const countObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      countEls.forEach((el) => countObserver.observe(el));
    } else {
      countEls.forEach(animateCount);
    }
  }

  /* ---------------- Back to top button ---------------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    const toggleBackToTop = () => {
      backToTop.classList.toggle("visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------------- Scroll cue: scroll to next section ---------------- */
  const scrollCue = document.querySelector(".scroll-cue");
  if (scrollCue) {
    scrollCue.addEventListener("click", (e) => {
      e.preventDefault();
      const introSection = document.querySelector(".intro-section");
      introSection?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();

/* Image Carousel - Change every 2 seconds */
(() => {
  const images = [
    './assets/img/IMG_2253.JPG',
    './assets/img/IMG_2271.JPG',
    './assets/img/IMG_2301.JPG',
    './assets/img/IMG_2366.JPG',
    './assets/img/IMG_2393.JPG',
    './assets/img/IMG_2534.JPG',
    './assets/img/IMG_2615.JPG',
    './assets/img/IMG_2660.JPG',
    './assets/img/IMG_2796.JPG',
    './assets/img/IMG_2819.JPG'
  ];
  
  let currentIndex = 0;
  const carousel = document.getElementById('imageCarousel');
  const counter = document.getElementById('current');
  
  if (carousel) {
    setInterval(() => {
      currentIndex = (currentIndex + 1) % images.length;
      const img = carousel.querySelector('.carousel-img');
      img.style.opacity = '0.7';
      img.src = images[currentIndex];
      img.style.opacity = '1';
      if (counter) counter.textContent = currentIndex + 1;
    }, 2000);
  }
})();