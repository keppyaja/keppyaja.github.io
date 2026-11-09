(() => {
    'use strict';

    const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
    const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;

    let activeContext = null;
    let activeMedia = null;
    let entryAmbient = [];
    let refreshFrame = 0;

    function registerPlugins() {
        const plugins = [window.ScrollTrigger, window.ScrollToPlugin].filter(Boolean);
        if (plugins.length) window.gsap.registerPlugin(...plugins);
    }

    /* ------------------------------------------------------------------ *
     * Helpers
     * ------------------------------------------------------------------ */

    function readPalette() {
        const styles = getComputedStyle(document.documentElement);
        const read = name => styles.getPropertyValue(name).trim();
        return {
            accent: read('--accent-color'),
            border: read('--border'),
            secondary: read('--secondary-color'),
            light: read('--light-color'),
            gray: read('--gray-color'),
            surface: read('--surface'),
            surface2: read('--surface-2')
        };
    }

    const rgba = (color, alpha) => {
        const [r, g, b] = window.gsap.utils.splitColor(color);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const shadow = (color, x, y, blur, spread = 0) => `${color} ${x}px ${y}px ${blur}px ${spread}px`;
    const clearShadow = color => shadow(rgba(color, 0), 0, 0, 0, 0);
    const ALL_SIDES = ['Top', 'Right', 'Bottom', 'Left'];
    const borders = (color, sides = ALL_SIDES) =>
        Object.fromEntries(sides.map(side => [`border${side}Color`, color]));

    /**
     * Binds rest / hover / press states of an element to GSAP tweens.
     * `rest` values must match the element's CSS so nothing shifts visually.
     */
    function bindStates(targets, getStates, options) {
        const { gsap } = window;
        const {
            duration, ease = 'power2.out', instant = [], pinned, observe,
            signal, handler, reduceMotion
        } = options;

        gsap.utils.toArray(targets).forEach(element => {
            const states = getStates(element);
            let hovered = false;
            let pressed = false;
            let current = null;

            const resolve = () => {
                if (pressed && states.press) return 'press';
                return hovered || pinned?.(element) ? 'hover' : 'rest';
            };

            const update = handler(() => {
                const next = resolve();
                if (next === current) return;
                current = next;

                const immediate = {};
                const animated = {};
                Object.entries(states[next]).forEach(([property, value]) => {
                    (instant.includes(property) ? immediate : animated)[property] = value;
                });
                if (Object.keys(immediate).length) gsap.set(element, immediate);
                gsap.to(element, {
                    ...animated,
                    duration: reduceMotion ? 0 : duration,
                    ease,
                    overwrite: 'auto'
                });
            });

            current = resolve();
            gsap.set(element, states[current]);

            const on = (type, callback) => element.addEventListener(type, handler(callback), { signal });
            on('pointerenter', () => { hovered = true; update(); });
            on('pointerleave', () => { hovered = false; pressed = false; update(); });
            if (states.press) {
                on('pointerdown', event => {
                    if (event.button !== 0) return;
                    pressed = true;
                    update();
                });
                on('pointerup', () => { pressed = false; update(); });
                on('pointercancel', () => { pressed = false; update(); });
            }

            if (observe) {
                const observer = new MutationObserver(() => update());
                observer.observe(element, { attributes: true, attributeFilter: [observe] });
                signal.addEventListener('abort', () => observer.disconnect(), { once: true });
            }
        });
    }

    /* ------------------------------------------------------------------ *
     * Hover / press interactions (replace the old CSS transitions)
     * ------------------------------------------------------------------ */

    function bindInteractions(config) {
        const p = readPalette();
        const black = alpha => `rgba(0, 0, 0, ${alpha})`;

        const cardRest = () => ({
            ...borders(rgba(p.accent, 0.28), ['Right', 'Bottom', 'Left']),
            boxShadow: `${shadow(black(0.7), 0, 0, 0, 1)}, ${shadow(black(0.4), 0, 18, 55, 0)}`,
            filter: 'brightness(1)',
            scale: 1
        });
        const cardHover = () => ({
            ...borders(p.accent, ['Right', 'Bottom', 'Left']),
            boxShadow: `${shadow(rgba(p.accent, 0.15), 0, 0, 28, 0)}, ${shadow(black(0.55), 0, 22, 70, 0)}`,
            filter: 'brightness(1.04)',
            scale: 1.015
        });
        bindStates('.entry-screen-content, .hero-char-wrap',
            () => ({ rest: cardRest(), hover: cardHover() }),
            { ...config, duration: 0.35 });

        bindStates('.btn', element => {
            if (element.classList.contains('btn-accent')) {
                const rest = {
                    backgroundColor: p.accent,
                    ...borders(p.accent),
                    color: '#0f1115',
                    boxShadow: shadow('#78350f', 4, 4, 0),
                    x: 0,
                    y: 0
                };
                const hover = {
                    backgroundColor: '#fbbf24',
                    ...borders('#fbbf24'),
                    color: '#0f1115',
                    boxShadow: shadow('#92400e', 6, 6, 0),
                    x: -2,
                    y: -2
                };
                return { rest, hover, press: { ...hover, x: 0, y: 0, boxShadow: clearShadow('#92400e') } };
            }
            const rest = {
                backgroundColor: rgba(p.secondary, 0),
                ...borders(p.secondary),
                color: p.secondary,
                boxShadow: clearShadow(p.accent),
                x: 0,
                y: 0
            };
            const hover = {
                backgroundColor: p.secondary,
                ...borders(p.secondary),
                color: '#0a0a0a',
                boxShadow: shadow(p.accent, 4, 4, 0),
                x: -2,
                y: -2
            };
            return { rest, hover, press: { ...hover, x: 0, y: 0, boxShadow: clearShadow(p.accent) } };
        }, { ...config, duration: 0.15 });

        const audioActive = {
            color: p.accent,
            ...borders(p.accent),
            backgroundColor: rgba(p.accent, 0.08)
        };
        bindStates('.audio-toggle', () => ({
            rest: {
                color: p.gray,
                ...borders(p.border),
                backgroundColor: rgba(p.accent, 0),
                y: 0
            },
            hover: { ...audioActive, y: 0 },
            press: { ...audioActive, y: 1 }
        }), {
            ...config,
            duration: 0.2,
            observe: 'aria-pressed',
            pinned: element => element.getAttribute('aria-pressed') === 'true'
        });

        bindStates('.portfolio-item', () => ({
            rest: { borderLeftColor: p.border, backgroundColor: p.surface },
            hover: { borderLeftColor: p.accent, backgroundColor: p.surface2 }
        }), { ...config, duration: 0.15 });

        bindStates('.social-icons a', () => ({
            rest: {
                backgroundColor: rgba(p.accent, 0),
                color: p.light,
                ...borders(p.border),
                y: 0
            },
            hover: {
                backgroundColor: p.accent,
                color: '#0a0a0a',
                ...borders(p.accent),
                y: -3
            }
        }), {
            ...config,
            duration: 0.15,
            instant: ALL_SIDES.map(side => `border${side}Color`)
        });

        bindStates('.writeup-link', () => ({
            rest: {
                backgroundColor: rgba(p.surface, 0),
                borderLeftColor: rgba(p.accent, 0),
                color: p.light
            },
            hover: {
                backgroundColor: p.surface,
                borderLeftColor: p.accent,
                color: p.accent
            }
        }), { ...config, duration: 0.15, instant: ['color'] });
    }

    /* ------------------------------------------------------------------ *
     * Pointer tilt (hero + entry card)
     * ------------------------------------------------------------------ */

    function bindTilt({ gsap, signal, handler }) {
        const pointerOffset = (event, rect) => ({
            dx: (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
            dy: (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
        });

        const hero = document.querySelector('.hero.parallax-scene');
        const heroRoot = document.getElementById('hero-tilt-root');
        if (hero && heroRoot) {
            gsap.set(heroRoot, { transformPerspective: 1200 });
            hero.addEventListener('pointermove', handler(event => {
                if (event.pointerType === 'touch') return;
                const rect = hero.getBoundingClientRect();
                if (rect.bottom < 0 || rect.top > window.innerHeight) return;
                const { dx, dy } = pointerOffset(event, rect);
                gsap.to(heroRoot, {
                    rotationY: dx * 6,
                    rotationX: -dy * 6 * 0.6,
                    duration: 0.1,
                    ease: 'none',
                    overwrite: 'auto'
                });
            }), { signal, passive: true });
            hero.addEventListener('pointerleave', handler(() => {
                gsap.to(heroRoot, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 0.6,
                    ease: 'expo.out',
                    overwrite: 'auto'
                });
            }), { signal });
        }

        const entryScreen = document.querySelector('.entry-screen');
        const entryCard = entryScreen?.querySelector('.entry-screen-content');
        if (entryScreen && entryCard && !entryScreen.hidden) {
            gsap.set(entryCard, { transformPerspective: 1200 });
            entryScreen.addEventListener('pointermove', handler(event => {
                if (event.pointerType === 'touch') return;
                const { dx, dy } = pointerOffset(event, entryScreen.getBoundingClientRect());
                gsap.to(entryCard, {
                    rotationY: dx * 4,
                    rotationX: -dy * 3,
                    duration: 0.7,
                    ease: 'expo.out',
                    overwrite: 'auto'
                });
            }), { signal, passive: true });
            entryScreen.addEventListener('pointerleave', handler(() => {
                gsap.to(entryCard, {
                    rotationX: 0,
                    rotationY: 0,
                    duration: 0.6,
                    ease: 'expo.out',
                    overwrite: 'auto'
                });
            }), { signal });
        }
    }

    /* ------------------------------------------------------------------ *
     * Entry screen: ambient loops, intro and exit
     * ------------------------------------------------------------------ */

    function startOrbitLoops(gsap, screen) {
        if (screen.hidden || screen.classList.contains('is-leaving')) return;
        const [one, two] = screen.querySelectorAll('.entry-screen-orbit');
        const drift = (orbit, shiftX, shiftY, rotation, scale, duration) => {
            if (!orbit) return;
            gsap.set(orbit, { rotation: -22, scale: 1 });
            // Pixel offsets keep the translation in page space, like the original CSS translate3d().
            entryAmbient.push(gsap.to(orbit, {
                x: () => orbit.offsetWidth * shiftX,
                y: () => orbit.offsetHeight * shiftY,
                rotation,
                scale,
                duration,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true
            }));
        };
        drift(one, -0.04, 0.08, -15, 1.08, 16);
        drift(two, 0.08, -0.06, -30, 0.92, 12);
    }

    function startEntryAmbient(gsap, screen) {
        // The aurora and scan layers are pseudo-elements, so they are driven through CSS variables.
        gsap.set(screen, {
            '--aurora-x': -4,
            '--aurora-y': -2,
            '--aurora-scale': 0.96,
            '--aurora-rotate': 0,
            '--aurora-opacity': 0.65,
            '--scan-y': -12
        });

        entryAmbient.push(
            gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut', duration: 7 } })
                .to(screen, {
                    '--aurora-x': 3,
                    '--aurora-y': 4,
                    '--aurora-scale': 1.05,
                    '--aurora-rotate': 4,
                    '--aurora-opacity': 1
                })
                .to(screen, {
                    '--aurora-x': -2,
                    '--aurora-y': 1,
                    '--aurora-scale': 1.02,
                    '--aurora-rotate': -3,
                    '--aurora-opacity': 0.78
                }),
            gsap.to(screen, { '--scan-y': 12, duration: 9, ease: 'none', repeat: -1 })
        );

        const grid = screen.querySelector('.entry-screen-grid');
        if (grid) {
            entryAmbient.push(gsap.fromTo(grid,
                { backgroundPosition: '0px 0px' },
                { backgroundPosition: '52px 52px', duration: 18, ease: 'none', repeat: -1 }));
        }

        // Negative CSS animation-delays become a pre-wound playhead.
        const windUp = [1, 4, 2.5, 5, 3.5, 6, 1.5, 4.5];
        screen.querySelectorAll('.entry-particles span').forEach((particle, index) => {
            gsap.set(particle, { x: 0, y: 18, scale: 0.7, opacity: 0 });
            const motion = gsap.timeline({ repeat: -1, defaults: { duration: 3.5, ease: 'sine.inOut' } })
                .to(particle, { x: 12, y: -26, scale: 1 })
                .to(particle, { x: 0, y: 18, scale: 0.7 });
            const fade = gsap.timeline({ repeat: -1, defaults: { duration: 1.75, ease: 'sine.inOut' } })
                .to(particle, { opacity: 0.8 })
                .to(particle, { opacity: 0.2 })
                .to(particle, { opacity: 0.8 })
                .to(particle, { opacity: 0 });
            const offset = windUp[index % windUp.length];
            motion.time(offset, true);
            fade.time(offset, true);
            entryAmbient.push(motion, fade);
        });
    }

    function animateEntryExit(entryScreen) {
        if (!window.gsap || !entryScreen || entryScreen.classList.contains('is-leaving')) {
            return false;
        }

        entryScreen.classList.add('is-leaving');
        document.body.classList.remove('entry-locked');

        if (prefersReducedMotion()) {
            entryAmbient.forEach(tween => tween.kill());
            entryAmbient = [];
            entryScreen.hidden = true;
            entryScreen.setAttribute('aria-hidden', 'true');
            return true;
        }

        const { gsap } = window;
        gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => {
                entryAmbient.forEach(tween => tween.kill());
                entryAmbient = [];
                entryScreen.hidden = true;
                entryScreen.setAttribute('aria-hidden', 'true');
            }
        })
            .to(entryScreen.querySelector('.entry-screen-content'), {
                y: -28,
                scale: 0.96,
                autoAlpha: 0,
                duration: 0.55,
                ease: 'power2.in',
                overwrite: 'auto'
            }, 0)
            .to(entryScreen.querySelectorAll('.entry-screen-grid, .entry-screen-orbit, .entry-particles, .entry-silhouette'), {
                autoAlpha: 0,
                duration: 0.35,
                stagger: 0.04
            }, 0)
            .to(entryScreen, { yPercent: -100, duration: 0.85 }, 0.22);

        return true;
    }

    /* ------------------------------------------------------------------ *
     * Hero ambient loops (desktop, motion allowed)
     * ------------------------------------------------------------------ */

    function startHeroAmbient(gsap) {
        // [duration, delay] per .sakura:nth-child(n)
        const sakuraTimings = [
            [9, 0], [11, 2], [8, 5], [13, 1], [10, 7], [7, 3],
            [12, 6], [9, 4], [11, 0.5], [8, 8], [14, 2.5], [10, 5.5],
            [13, 9], [7, 1.5], [11, 3.5], [16, 4.5], [9, 7.5], [12, 0.8]
        ];

        document.querySelectorAll('.hero-particles .sakura').forEach((petal, index) => {
            const [duration, delay] = sakuraTimings[index % sakuraTimings.length];
            const setX = gsap.quickSetter(petal, 'x', 'px');
            const setY = gsap.quickSetter(petal, 'y', 'px');
            const setRotation = gsap.quickSetter(petal, 'rotation', 'deg');
            const fall = { progress: 0 };

            gsap.timeline({ repeat: -1, delay, defaults: { ease: 'none' } })
                .fromTo(fall, { progress: 0 }, {
                    progress: 1,
                    duration,
                    onUpdate: () => {
                        // translateY(110vh) rotate(720deg) translateX(60px): the sideways
                        // offset is applied after the rotation, so it spirals.
                        const angle = fall.progress * 720;
                        const radians = angle * Math.PI / 180;
                        const sideways = fall.progress * 60;
                        setX(sideways * Math.cos(radians));
                        setY(window.innerHeight * 1.1 * fall.progress + sideways * Math.sin(radians));
                        setRotation(angle);
                    }
                }, 0)
                .fromTo(petal, { opacity: 0 }, { opacity: 1, duration: duration * 0.05 }, 0)
                .to(petal, { opacity: 0.6, duration: duration * 0.85 }, duration * 0.05)
                .to(petal, { opacity: 0, duration: duration * 0.1 }, duration * 0.9);
        });

        document.querySelectorAll('.hero-hud-line').forEach((line, index) => {
            gsap.timeline({ repeat: -1, delay: index * 0.4, defaults: { duration: 0.1, ease: 'sine.inOut' } })
                .to(line, { opacity: 0.3 }, 4.6)
                .to(line, { opacity: 0.9 })
                .to(line, { opacity: 0.5 })
                .to(line, { opacity: 1 });
        });
    }

    /* ------------------------------------------------------------------ *
     * Loadout marquee: endless loop that can still be scrolled by hand
     * ------------------------------------------------------------------ */

    function startSkillsMarquee({ gsap, signal }) {
        const marquee = document.querySelector('.skills-marquee');
        const track = marquee?.querySelector('.skills-track');
        const source = track?.querySelector('.skills-container:not([data-marquee-clone])');
        if (!marquee || !source) return () => {};

        const SPEED = 40; // px per second
        const RESUME_DELAY = 1.5; // seconds of idle time after manual interaction

        // Inert copies before and after the original make the loop seamless in both directions.
        const makeClone = () => {
            const copy = source.cloneNode(true);
            copy.setAttribute('aria-hidden', 'true');
            copy.inert = true;
            copy.dataset.marqueeClone = 'true';
            return copy;
        };
        const clones = [makeClone(), makeClone()];
        source.before(clones[0]);
        source.after(clones[1]);
        marquee.classList.add('is-looping');

        let loopWidth = 0;
        let windowStart = 0; // position is kept in [windowStart, windowStart + loopWidth)
        let position = 0;
        let written = 0; // scrollLeft as the browser stored our last write
        let started = false;
        let interacting = false;
        let inView = true;
        let resumeCall = null;
        let drag = null;

        // The copies look identical every `loopWidth` px, so any position can be shifted by a
        // whole loop. The window is the original set, with a copy on each side to scroll into.
        const write = value => {
            marquee.scrollLeft = value;
            written = marquee.scrollLeft;
        };
        const normalize = value => {
            if (!loopWidth) return value;
            while (value >= windowStart + loopWidth) value -= loopWidth;
            while (value < windowStart) value += loopWidth;
            return value;
        };
        const measure = () => {
            loopWidth = clones[1].offsetLeft - source.offsetLeft;
            const previousStart = windowStart;
            windowStart = source.offsetLeft - clones[0].offsetLeft;
            position = started ? normalize(position - previousStart + windowStart) : windowStart;
            started = true;
            write(position);
        };
        // Pointer hover never pauses the loop. It only yields while the user is actively
        // dragging/scrolling, or while keyboard focus is on the region (so it can be read).
        const paused = () =>
            Boolean(drag) || interacting || !inView || document.hidden || marquee.matches(':focus-visible');

        const touch = () => {
            interacting = true;
            resumeCall?.kill();
            resumeCall = gsap.delayedCall(RESUME_DELAY, () => { interacting = false; });
        };

        const wrapScroll = () => {
            const wrapped = normalize(position);
            if (wrapped === position) return;
            if (drag) drag.left += wrapped - position;
            position = wrapped;
            write(position);
        };

        const tick = (time, deltaTime) => {
            if (paused() || !loopWidth) return;
            position = normalize(position + SPEED * Math.min(deltaTime, 100) / 1000);
            write(position);
        };

        const on = (target, type, callback, options = {}) =>
            target.addEventListener(type, callback, { signal, ...options });

        on(marquee, 'scroll', () => {
            // Our own writes read back exactly as stored; any other value came from the user.
            if (marquee.scrollLeft === written) return;
            position = marquee.scrollLeft;
            touch();
            wrapScroll();
        }, { passive: true });

        on(marquee, 'wheel', touch, { passive: true });
        on(marquee, 'touchstart', touch, { passive: true });
        on(marquee, 'keydown', touch);

        // Mouse drag-to-scroll (touch and trackpads already scroll natively).
        on(marquee, 'pointerdown', event => {
            if (event.pointerType !== 'mouse' || event.button !== 0) return;
            drag = { x: event.clientX, left: marquee.scrollLeft };
            position = marquee.scrollLeft;
            try { marquee.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
            marquee.classList.add('is-dragging');
            touch();
        });
        on(marquee, 'pointermove', event => {
            if (!drag) return;
            marquee.scrollLeft = drag.left - (event.clientX - drag.x);
        });
        const endDrag = () => {
            if (!drag) return;
            drag = null;
            marquee.classList.remove('is-dragging');
            touch();
        };
        on(marquee, 'pointerup', endDrag);
        on(marquee, 'pointercancel', endDrag);
        on(marquee, 'lostpointercapture', endDrag);

        const resizeObserver = new ResizeObserver(measure);
        resizeObserver.observe(marquee);
        resizeObserver.observe(source);
        const viewObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; });
        viewObserver.observe(marquee);

        measure();
        gsap.ticker.add(tick);

        return () => {
            gsap.ticker.remove(tick);
            resumeCall?.kill();
            resizeObserver.disconnect();
            viewObserver.disconnect();
            clones.forEach(copy => copy.remove());
            marquee.classList.remove('is-looping', 'is-dragging');
            marquee.scrollLeft = 0;
        };
    }

    /* ------------------------------------------------------------------ *
     * Main initialisation
     * ------------------------------------------------------------------ */

    function teardown() {
        activeMedia?.revert();
        activeMedia = null;
        activeContext?.revert();
        activeContext = null;
        entryAmbient.forEach(tween => tween.kill());
        entryAmbient = [];
    }

    function initAnimations() {
        if (!window.gsap) return;
        teardown();
        registerPlugins();

        const { gsap } = window;
        const reduceMotion = prefersReducedMotion();
        const controller = new AbortController();
        const { signal } = controller;

        activeContext = gsap.context(self => {
            // Event handlers run later; routing them through the context keeps their
            // tweens collected so the next init can revert them.
            self.add('run', callback => callback());
            const handler = callback => (...args) => self.run(() => callback(...args));

            bindInteractions({ signal, handler, reduceMotion });
            if (reduceMotion) return () => controller.abort();

            const entryScreen = document.querySelector('.entry-screen');
            const entryVisible = Boolean(entryScreen) && !entryScreen.hidden &&
                !entryScreen.classList.contains('is-leaving') &&
                !document.documentElement.classList.contains('entry-session-visited');

            bindTilt({ gsap, signal, handler });
            const stopMarquee = startSkillsMarquee({ gsap, signal });

            if (entryVisible) {
                startEntryAmbient(gsap, entryScreen);
                gsap.timeline({
                    defaults: { ease: 'power3.out' },
                    onComplete: handler(() => startOrbitLoops(gsap, entryScreen))
                })
                    .from('.entry-screen-content > *', {
                        y: 28,
                        autoAlpha: 0,
                        duration: 0.7,
                        stagger: 0.08
                    })
                    .from('.entry-silhouette', { x: 90, autoAlpha: 0, duration: 1.1 }, '-=0.8')
                    .from('.entry-screen-orbit', { scale: 0.7, autoAlpha: 0, duration: 1 }, '-=0.9');
            }

            gsap.from('.navbar', {
                y: -24,
                autoAlpha: 0,
                duration: 0.7,
                ease: 'power3.out'
            });

            if (document.querySelector('.hero-content')) {
                gsap.timeline({ defaults: { ease: 'power3.out' } })
                    .from('.hero-content > *', {
                        y: 30,
                        autoAlpha: 0,
                        duration: 0.75,
                        stagger: 0.1
                    })
                    .from('.hero-char-wrap', { x: 46, rotate: 2, autoAlpha: 0, duration: 0.9 }, '-=0.65')
                    .from('.case-file', { y: 34, autoAlpha: 0, duration: 0.7 }, '-=0.5');
            }

            const pageIntro = gsap.utils.toArray('.writeup-breadcrumb, .archive-header, .writeup-page-header');
            if (pageIntro.length) {
                gsap.from(pageIntro, {
                    y: 24,
                    autoAlpha: 0,
                    duration: 0.7,
                    stagger: 0.1,
                    ease: 'power3.out'
                });
            }

            if (window.ScrollTrigger) {
                const heroSection = document.querySelector('.hero');
                if (heroSection) {
                    gsap.utils.toArray('[data-parallax]').forEach(element => {
                        const speed = Number(element.dataset.parallax) || 0;
                        gsap.to(element, {
                            // Over the hero's scroll distance the shift equals scrollY * speed.
                            y: () => heroSection.offsetHeight * speed,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: heroSection,
                                start: 'top top',
                                end: 'bottom top',
                                scrub: true,
                                invalidateOnRefresh: true
                            }
                        });
                    });
                }

                gsap.utils.toArray('section:not(.hero) .section-heading, .about-content, .skills-marquee, .portfolio-grid, .contact-container, .writeup-comp, .writeup-page-footer, footer .container').forEach(element => {
                    gsap.from(element, {
                        y: 34,
                        autoAlpha: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: element,
                            start: 'top 84%',
                            once: true
                        }
                    });
                });

                gsap.utils.toArray('.portfolio-item, .contact-item, .writeup-category').forEach(element => {
                    gsap.from(element, {
                        y: 22,
                        autoAlpha: 0,
                        duration: 0.55,
                        delay: (element.parentElement ? Array.from(element.parentElement.children).indexOf(element) : 0) * 0.06,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: element,
                            start: 'top 92%',
                            once: true
                        }
                    });
                });

                const articleBlocks = gsap.utils.toArray('.writeup-page-body-content > *');
                if (articleBlocks.length) {
                    gsap.set(articleBlocks, { autoAlpha: 0, y: 18 });
                    window.ScrollTrigger.batch(articleBlocks, {
                        start: 'top 94%',
                        once: true,
                        onEnter: batch => gsap.to(batch, {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.55,
                            stagger: 0.06,
                            ease: 'power2.out',
                            overwrite: true
                        })
                    });
                }
            }

            return () => {
                controller.abort();
                stopMarquee();
            };
        });

        // Ambient hero loops only run on desktop layouts where those elements are visible.
        activeMedia = gsap.matchMedia();
        activeMedia.add('(min-width: 721px) and (prefers-reduced-motion: no-preference)', () => {
            startHeroAmbient(gsap);
        });
    }

    /* ------------------------------------------------------------------ *
     * Public helpers used by the page scripts
     * ------------------------------------------------------------------ */

    window.animateProjectModal = modal => {
        if (!window.gsap || !modal || prefersReducedMotion()) return;
        window.gsap.fromTo(modal.querySelector('.modal-content'), {
            y: 36,
            scale: 0.96,
            autoAlpha: 0
        }, {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.45,
            ease: 'power3.out'
        });
    };

    /**
     * Fades a fixed, horizontally centered notice in, holds it, then fades it out.
     * `offset` is the vertical distance it slides from/to while fading.
     */
    window.animateNotice = (element, { hold = 3.5, offset = 0, onHidden } = {}) => {
        if (!window.gsap || !element) return null;
        const { gsap } = window;
        const seconds = value => (prefersReducedMotion() ? 0 : value);

        if (!element.dataset.noticeReady) {
            element.dataset.noticeReady = 'true';
            gsap.set(element, { xPercent: -50, y: offset, autoAlpha: 0 });
        }
        element.noticeTimeline?.kill();
        element.noticeTimeline = gsap.timeline({ onComplete: () => onHidden?.() })
            .to(element, { autoAlpha: 1, y: 0, duration: seconds(0.2), ease: 'power1.out' })
            .to(element, { autoAlpha: 0, y: offset, duration: seconds(0.2), ease: 'power1.out' }, hold);
        return element.noticeTimeline;
    };

    window.animateNavMenu = menu => {
        if (!window.gsap || !menu || prefersReducedMotion()) return;
        window.gsap.fromTo(menu.children, { y: -10, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.35,
            stagger: 0.05,
            ease: 'power2.out',
            clearProps: 'transform,opacity,visibility',
            overwrite: true
        });
    };

    window.animateSpinner = icon => {
        if (!window.gsap || !icon || prefersReducedMotion()) return null;
        icon.style.animation = 'none';
        return window.gsap.to(icon, { rotation: 360, duration: 2, ease: 'none', repeat: -1 });
    };

    window.animateArchiveRows = rows => {
        if (!window.gsap || !rows?.length || prefersReducedMotion()) return;
        window.gsap.fromTo(rows, { autoAlpha: 0, y: 10 }, {
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.03,
            ease: 'power2.out',
            clearProps: 'transform,opacity,visibility',
            overwrite: true
        });
    };

    window.refreshGsapScroll = () => {
        if (!window.ScrollTrigger) return;
        window.cancelAnimationFrame(refreshFrame);
        refreshFrame = window.requestAnimationFrame(() => window.ScrollTrigger.refresh());
    };

    window.gsapScrollTo = (top, { duration } = {}) => {
        const target = Math.max(0, top);
        const reduced = prefersReducedMotion();
        if (!window.gsap || !window.ScrollToPlugin) {
            window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });
            return;
        }
        if (reduced) {
            window.scrollTo({ top: target, behavior: 'auto' });
            return;
        }
        const distance = Math.abs(target - window.scrollY);
        window.gsap.to(window, {
            scrollTo: { y: target, autoKill: true },
            duration: duration ?? window.gsap.utils.clamp(0.5, 1.2, distance / 2000),
            ease: 'power3.inOut',
            overwrite: true
        });
    };

    window.playEntryExitAnimation = animateEntryExit;
    window.initGsapAnimations = initAnimations;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnimations, { once: true });
    } else {
        initAnimations();
    }
})();
