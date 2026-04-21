/* ═══════════════════════════════════════════════════════════════
   100th Birthday Invitation — Award-Winning Animation Engine v2
   ═══════════════════════════════════════════════════════════════
   
   Stack:
   - Lenis   → ultra-smooth scroll
   - GSAP    → animation timelines
   - ScrollTrigger → scroll-driven orchestration
   
   Architecture:
   1. Lenis smooth scroll initialization
   2. Custom split-text (chars / words / lines)
   3. Curtain cinematic reveal
   4. Hero pinned parallax timeline
   5. Section orchestrated scroll timelines
   6. 3D card tilt + glow tracking
   7. Countdown with flip animation
   8. Floating particles system
   9. Magnetic buttons
   10. Progress bar
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  
  gsap.registerPlugin(ScrollTrigger);

  /* ═══════════════════════════════════════════
     1. LENIS SMOOTH SCROLL
     ═══════════════════════════════════════════ */
  let lenis;

  function initLenis() {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });

    // Sync Lenis with GSAP's ticker
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  /* ═══════════════════════════════════════════
     2. SPLIT TEXT SYSTEM
     ═══════════════════════════════════════════
     Custom split text — no external dependency.
     Supports: chars, words, and lines.
  */

  function splitIntoChars(el) {
    const text = el.textContent;
    el.innerHTML = '';
    el.setAttribute('aria-label', text);
    const chars = [];

    [...text].forEach((char) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
      chars.push(span);
    });

    return chars;
  }

  function splitIntoWords(el) {
    const text = el.textContent;
    const wordsArr = text.split(/\s+/).filter(Boolean);
    el.innerHTML = '';
    el.setAttribute('aria-label', text);
    const words = [];

    wordsArr.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = word;
      span.setAttribute('aria-hidden', 'true');
      el.appendChild(span);
      words.push(span);
    });

    return words;
  }

  function splitIntoLines(el) {
    const text = el.innerHTML;
    // Wrap entire content for line-mask reveal
    const wrapper = document.createElement('span');
    wrapper.className = 'line-wrap';
    const inner = document.createElement('span');
    inner.className = 'line-inner';
    inner.innerHTML = text;
    wrapper.appendChild(inner);
    el.innerHTML = '';
    el.appendChild(wrapper);
    return inner;
  }

  // Process all split-text elements
  const charElements = {};
  const wordElements = {};
  const lineElements = {};

  document.querySelectorAll('[data-split-chars]').forEach((el, i) => {
    charElements[i] = { el, chars: splitIntoChars(el) };
  });

  document.querySelectorAll('[data-split-words]').forEach((el, i) => {
    wordElements[i] = { el, words: splitIntoWords(el) };
  });

  document.querySelectorAll('[data-split-lines]').forEach((el, i) => {
    lineElements[i] = { el, inner: splitIntoLines(el) };
  });

  /* ═══════════════════════════════════════════
     3. FLOATING PARTICLES
     ═══════════════════════════════════════════ */
  function createParticles(containerId, count = 25) {
    const container = document.getElementById(containerId);
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.width = (2 + Math.random() * 4) + 'px';
      p.style.height = p.style.width;
      container.appendChild(p);

      gsap.to(p, {
        opacity: 0.15 + Math.random() * 0.2,
        y: -100 - Math.random() * 200,
        x: (Math.random() - 0.5) * 80,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }

  /* ═══════════════════════════════════════════
     4. SCROLL PROGRESS BAR
     ═══════════════════════════════════════════ */
  function initProgressBar() {
    gsap.to('#progress-bar', {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    });
  }

  /* ═══════════════════════════════════════════
     5. CURTAIN INTRO
     ═══════════════════════════════════════════ */
  const curtainOverlay = document.getElementById('curtain-overlay');

  // Lock scroll
  document.body.style.overflow = 'hidden';

  function openCurtain() {
    curtainOverlay.removeEventListener('click', openCurtain);
    curtainOverlay.removeEventListener('touchstart', openCurtain);

    const tl = gsap.timeline({
      onComplete: () => {
        curtainOverlay.style.display = 'none';
        document.body.style.overflow = '';

        // Start Lenis
        initLenis();

        // Refresh triggers
        ScrollTrigger.refresh();

        // Animate hero
        animateHero();
      },
    });

    // Fade curtain content
    tl.to('.curtain-content', {
      opacity: 0,
      scale: 0.7,
      duration: 0.5,
      ease: 'power2.in',
    })
    // Open curtains with slight rotation for 3D feel
    .to('.curtain--left', {
      xPercent: -105,
      skewY: 2,
      duration: 1.6,
      ease: 'power4.inOut',
    }, 0.3)
    .to('.curtain--right', {
      xPercent: 105,
      skewY: -2,
      duration: 1.6,
      ease: 'power4.inOut',
    }, 0.3);
  }

  curtainOverlay.addEventListener('click', openCurtain);
  curtainOverlay.addEventListener('touchstart', openCurtain, { passive: true });

  /* ═══════════════════════════════════════════
     6. HERO ANIMATION TIMELINE
     ═══════════════════════════════════════════ */
  function animateHero() {
    const tl = gsap.timeline({ delay: 0.4 });

    // Badge entrance
    tl.to('.hero__badge', {
      opacity: 1,
      duration: 0.6,
    })
    .to('.hero__badge-line', {
      width: 50,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.inOut',
    }, '<0.2')

    // Eyebrow words stagger
    .from('.hero__eyebrow .word', {
      opacity: 0,
      y: 30,
      rotateX: -40,
      duration: 0.7,
      stagger: 0.06,
      ease: 'power3.out',
    }, '-=0.3')

    // Name characters — wave cascade
    .from('.hero__name .char', {
      opacity: 0,
      y: 80,
      rotateX: -90,
      scale: 0.6,
      duration: 1,
      stagger: {
        each: 0.035,
        from: 'center',
        ease: 'power2.in',
      },
      ease: 'back.out(1.2)',
    }, '-=0.3')

    // Divider
    .to('.hero__divider', { opacity: 1, duration: 0.3 })
    .to('.hero__divider-line', {
      width: 'clamp(60px, 15vw, 140px)',
      duration: 1,
      stagger: 0.1,
      ease: 'power2.inOut',
    })
    .to('.hero__divider-diamond', {
      opacity: 1,
      rotation: 45,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(2)',
    }, '-=0.5')

    // Subtitle words
    .from('.hero__subtitle .word', {
      opacity: 0,
      y: 25,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power3.out',
    }, '-=0.4')

    // Date words
    .from('.hero__date .word', {
      opacity: 0,
      y: 15,
      duration: 0.5,
      stagger: 0.04,
      ease: 'power3.out',
    }, '-=0.2')

    // Scroll hint with bounce
    .to('.hero__scroll-hint', {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.1');

    // ─── Hero parallax layers on scroll ───
    gsap.utils.toArray('.hero__depth-layer').forEach((layer) => {
      const speed = parseFloat(layer.dataset.speed) || 0.5;
      gsap.to(layer, {
        y: -200 * speed,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    });

    // Hero content fade-out on scroll
    const heroFade = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero',
        start: '60% center',
        end: 'bottom top',
        scrub: 1,
      },
    });

    heroFade
      .to('.hero__inner', { opacity: 0, y: -80, scale: 0.95 })
      .to('.hero__scroll-hint', { opacity: 0 }, '<');
  }

  /* ═══════════════════════════════════════════
     7. SECTION ANIMATION FACTORY
     ═══════════════════════════════════════════
     Reusable function for rich section timelines.
  */

  function animateSectionHeader(section) {
    const header = section.querySelector('.section-header');
    if (!header) return;

    const lines = header.querySelectorAll('.section-header__line');
    const icon = header.querySelector('.section-header__icon');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: header,
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });

    tl.to(lines, {
      width: 60,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.inOut',
      onComplete: () => lines.forEach(l => l.classList.add('is-visible')),
    })
    .to(icon, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 0.6,
      ease: 'back.out(2)',
      onComplete: () => icon.classList.add('is-visible'),
    }, '-=0.4');
  }

  function animateSectionTitle(section) {
    const title = section.querySelector('.section-title');
    if (!title) return;

    const chars = title.querySelectorAll('.char');
    if (chars.length === 0) return;

    gsap.from(chars, {
      opacity: 0,
      y: 50,
      rotateX: -60,
      duration: 0.8,
      stagger: {
        each: 0.025,
        from: 'start',
      },
      ease: 'power3.out',
      scrollTrigger: {
        trigger: title,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ═══════════════════════════════════════════
     8. ABOUT SECTION
     ═══════════════════════════════════════════ */
  function initAbout() {
    const section = document.getElementById('about');
    if (!section) return;

    animateSectionHeader(section);
    animateSectionTitle(section);

    // Line-by-line reveal with mask
    section.querySelectorAll('.line-inner').forEach((inner, i) => {
      gsap.from(inner, {
        y: '110%',
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: inner.parentElement.parentElement,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });
    });

    // Ornament
    const ornament = section.querySelector('.about__ornament');
    const ornLine = ornament?.querySelector('.ornament-line');

    if (ornament) {
      gsap.to(ornament, {
        opacity: 1,
        duration: 0.6,
        scrollTrigger: {
          trigger: ornament,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    }

    if (ornLine) {
      gsap.to(ornLine, {
        width: 120,
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: ornLine,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Parallax on content
    gsap.to('.about__content', {
      y: -40,
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2.5,
      },
    });
  }

  /* ═══════════════════════════════════════════
     9. EVENT CARDS — Staggered 3D reveal
     ═══════════════════════════════════════════ */
  function initEvent() {
    const section = document.getElementById('event');
    if (!section) return;

    animateSectionHeader(section);
    animateSectionTitle(section);

    const cards = section.querySelectorAll('.event-card');

    // Staggered entrance with 3D depth
    cards.forEach((card, i) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.from(card, {
        opacity: 0,
        y: 100,
        rotateX: -15,
        scale: 0.88,
        duration: 1.2,
        delay: i * 0.18,
        ease: 'power3.out',
      })
      .from(card.querySelector('.event-card__icon'), {
        opacity: 0,
        scale: 0,
        rotation: -180,
        duration: 0.8,
        ease: 'back.out(2)',
      }, '-=0.6')
      .from(card.querySelectorAll('.event-card__label, .event-card__value, .event-card__sub'), {
        opacity: 0,
        y: 15,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
      }, '-=0.4');
    });

    // Parallax float
    gsap.to('.event__cards', {
      y: -30,
      scrollTrigger: {
        trigger: '.event__cards',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 3,
      },
    });
  }

  /* ═══════════════════════════════════════════
     10. COUNTDOWN
     ═══════════════════════════════════════════ */
  function initCountdownAnim() {
    const section = document.getElementById('countdown');
    if (!section) return;

    // Title words
    const titleWords = section.querySelectorAll('.section-title .word');
    if (titleWords.length) {
      gsap.from(titleWords, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Grid entrance
    gsap.from('.countdown__grid', {
      opacity: 0,
      y: 60,
      scale: 0.9,
      duration: 1.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.countdown__grid',
        start: 'top 82%',
        toggleActions: 'play none none none',
      },
    });

    // Number units stagger
    gsap.from('.countdown__unit', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.countdown__grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });

    // Background "100" parallax
    gsap.to('.countdown__bg-text', {
      y: -80,
      scale: 1.1,
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2,
      },
    });
  }

  /* ═══════════════════════════════════════════
     11. MAP SECTION
     ═══════════════════════════════════════════ */
  function initMap() {
    const section = document.querySelector('.map-section');
    if (!section) return;

    animateSectionHeader(section);
    animateSectionTitle(section);

    // Subtitle words
    const subWords = section.querySelectorAll('.map-section__subtitle .word');
    if (subWords.length) {
      gsap.from(subWords, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Map clip-path reveal
    const mapFrame = section.querySelector('.reveal-clip');
    if (mapFrame) {
      ScrollTrigger.create({
        trigger: mapFrame,
        start: 'top 82%',
        onEnter: () => mapFrame.classList.add('is-revealed'),
      });
    }

    // Button
    gsap.from('#btn-directions', {
      opacity: 0,
      y: 25,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#btn-directions',
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  }

  /* ═══════════════════════════════════════════
     12. CONTACT SECTION
     ═══════════════════════════════════════════ */
  function initContact() {
    const section = document.getElementById('contact');
    if (!section) return;

    animateSectionHeader(section);
    animateSectionTitle(section);

    // Subtitle words
    const subWords = section.querySelectorAll('.contact__subtitle .word');
    if (subWords.length) {
      gsap.from(subWords, {
        opacity: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.04,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 72%',
          toggleActions: 'play none none none',
        },
      });
    }

    // Cards — staggered 3D entrance
    const cardsContainer = section.querySelector('.contact__cards');
    const cards = section.querySelectorAll('.contact-card');

    // Set initial hidden state explicitly
    gsap.set(cards, { opacity: 0, y: 80, scale: 0.9 });

    ScrollTrigger.create({
      trigger: cardsContainer,
      start: 'top 85%',
      onEnter: () => {
        cards.forEach((card, i) => {
          const tl = gsap.timeline({ delay: i * 0.2 });

          tl.to(card, {
            opacity: 1,
            y: 0,
            rotateY: 0,
            scale: 1,
            duration: 1.1,
            ease: 'power3.out',
          })
          .from(card.querySelector('.contact-card__avatar'), {
            scale: 0,
            rotation: -90,
            duration: 0.7,
            ease: 'back.out(2)',
          }, '-=0.5')
          .fromTo(card.querySelectorAll('.contact-card__name, .contact-card__phone'), {
            opacity: 0,
            y: 12,
          }, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.08,
          }, '-=0.3');
        });
      },
      once: true,
    });
  }

  /* ═══════════════════════════════════════════
     13. RSVP SECTION
     ═══════════════════════════════════════════ */
  function initRSVP() {
    const section = document.getElementById('rsvp');
    if (!section) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        toggleActions: 'play none none none',
      },
    });

    // Decorative circle expands
    tl.from('.rsvp__decorative-circle', {
      scale: 0,
      opacity: 0,
      duration: 1.5,
      ease: 'power2.out',
    })

    // Icon
    .from('.rsvp__icon', {
      opacity: 0,
      scale: 0,
      rotation: -180,
      duration: 0.8,
      ease: 'back.out(2)',
    }, '-=1')

    // Title chars
    .from('.rsvp__title .char', {
      opacity: 0,
      y: 60,
      rotateX: -90,
      duration: 0.8,
      stagger: {
        each: 0.025,
        from: 'center',
      },
      ease: 'power3.out',
    }, '-=0.6')

    // Text line reveal
    .from('.rsvp__text .line-inner', {
      y: '100%',
      duration: 1,
      ease: 'power3.out',
    }, '-=0.4')

    // Button bounces in
    .from('#btn-rsvp', {
      opacity: 0,
      y: 30,
      scale: 0.8,
      duration: 0.8,
      ease: 'back.out(1.8)',
    }, '-=0.5');
  }

  /* ═══════════════════════════════════════════
     14. FOOTER
     ═══════════════════════════════════════════ */
  function initFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    // Hosted words
    const hostedWords = footer.querySelectorAll('.footer__hosted .word');
    if (hostedWords.length) {
      tl.from(hostedWords, {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.04,
        ease: 'power3.out',
      });
    }

    // Family name — dramatic
    tl.from('.footer__family', {
      opacity: 0,
      y: 40,
      scale: 0.8,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.2');

    const nameWords = footer.querySelectorAll('.footer__name .word');
    if (nameWords.length) {
      tl.from(nameWords, {
        opacity: 0,
        y: 15,
        duration: 0.5,
        stagger: 0.04,
        ease: 'power3.out',
      }, '-=0.5');
    }
  }

  /* ═══════════════════════════════════════════
     15. 3D CARD TILT + GLOW TRACKING
     ═══════════════════════════════════════════ */
  function initTiltCards() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 800,
          duration: 0.4,
          ease: 'power2.out',
        });

        // Update glow position
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
        });
      });
    });
  }

  /* ═══════════════════════════════════════════
     16. MAGNETIC BUTTONS
     ═══════════════════════════════════════════ */
  function initMagneticButtons() {
    const btns = document.querySelectorAll('.magnetic-btn');

    btns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.4,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1, 0.4)',
        });
      });
    });
  }

  /* ═══════════════════════════════════════════
     17. COUNTDOWN TIMER
     ═══════════════════════════════════════════ */
  function initCountdown() {
    const target = new Date('2026-05-03T16:00:00+05:30').getTime();

    const els = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      mins: document.getElementById('cd-mins'),
      secs: document.getElementById('cd-secs'),
    };

    let prev = { days: '', hours: '', mins: '', secs: '' };

    function update() {
      const diff = Math.max(0, target - Date.now());

      const vals = {
        days: String(Math.floor(diff / 864e5)).padStart(3, '0'),
        hours: String(Math.floor((diff % 864e5) / 36e5)).padStart(2, '0'),
        mins: String(Math.floor((diff % 36e5) / 6e4)).padStart(2, '0'),
        secs: String(Math.floor((diff % 6e4) / 1e3)).padStart(2, '0'),
      };

      Object.keys(vals).forEach((key) => {
        if (vals[key] !== prev[key]) {
          els[key].textContent = vals[key];
          // Flip animation
          els[key].classList.remove('flip');
          void els[key].offsetWidth; // reflow
          els[key].classList.add('flip');
          prev[key] = vals[key];
        }
      });
    }

    update();
    setInterval(update, 1000);
  }

  /* ═══════════════════════════════════════════
     18. INITIALISE EVERYTHING
     ═══════════════════════════════════════════ */

  // Create particles
  createParticles('hero-particles', 20);

  // Progress bar
  initProgressBar();

  // All scroll-triggered sections
  initAbout();
  initEvent();
  initCountdownAnim();
  initMap();
  initContact();
  initRSVP();
  initFooter();

  // Interactive features
  initCountdown();
  initTiltCards();
  initMagneticButtons();

});
