(() => {
    'use strict';

    // Determine the absolute URL of the audio file relative to the site-audio.js script
    const scriptTag = document.currentScript || document.querySelector('script[src*="site-audio.js"]');
    const SCRIPT_URL = scriptTag?.src || window.location.href;
    const AUDIO_PATH = new URL('../audio/theme.mp3', SCRIPT_URL).href;
    const AUDIO_STATE_KEY = 'portfolio-audio-state';
    const AUDIO_VOLUME_KEY = 'portfolio-audio-volume';
    const GSAP_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js';
    const GSAP_SCROLL_TRIGGER_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js';
    const GSAP_SCROLL_TO_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollToPlugin.min.js';
    const GSAP_INTEGRITY = 'sha384-g4NTh/Iv5PPU4xPyhEWqPcwtNXOvdaDI8LLnyYfyNZOjKJeYQyjzQ9X5275eBjpt';
    const GSAP_SCROLL_TRIGGER_INTEGRITY = 'sha384-Z3REaz79l2IaAZqJsSABtTbhjgOUYyV3p90XNnAPCSHg3EMTz1fouunq9WZRtj3d';
    const GSAP_SCROLL_TO_INTEGRITY = 'sha384-RVPQwTb0fPz9kI8s5GwAq1Qioto9fnEQt1aKGSQSm8xV6+DIdBSgcCShoHqfKnhv';
    let audio = document.getElementById('site-audio');
    let mutedByUser = false;
    let pausedByVisibility = false;
    let navigating = false;
    let musicPromptShown = false;
    let shouldResumeAudio = false;
    let easterEggInitialized = false;
    let savedVolume = 50;

    try {
        const storedVolume = Number.parseInt(sessionStorage.getItem(AUDIO_VOLUME_KEY) || '50', 10);
        if (Number.isFinite(storedVolume)) savedVolume = Math.min(100, Math.max(0, storedVolume));
    } catch (error) {
        console.warn('Audio volume state is unavailable.', error);
    }
    function normalizeIndexUrl() {
        if (!/\/index\.html$/.test(window.location.pathname)) return;
        const cleanPath = window.location.pathname.slice(0, -'index.html'.length) || '/';
        const cleanUrl = `${cleanPath}${window.location.search}${window.location.hash}`;
        window.history.replaceState(null, '', cleanUrl);
    }

    normalizeIndexUrl();

    function loadScript(src, integrity) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.referrerPolicy = 'no-referrer';
            if (integrity) script.integrity = integrity;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Unable to load ${src}`));
            document.head.append(script);
        });
    }

    async function loadGsapAnimations() {
        try {
            if (!window.gsap) await loadScript(GSAP_CDN, GSAP_INTEGRITY);
            // Plugins are optional: the animation script checks for each before using it.
            if (!window.ScrollTrigger) await loadScript(GSAP_SCROLL_TRIGGER_CDN, GSAP_SCROLL_TRIGGER_INTEGRITY).catch(console.warn);
            if (!window.ScrollToPlugin) await loadScript(GSAP_SCROLL_TO_CDN, GSAP_SCROLL_TO_INTEGRITY).catch(console.warn);
            const animationSource = new URL('gsap-animations.js?v=8', SCRIPT_URL).href;
            if (!document.querySelector(`script[src="${animationSource}"]`)) {
                await loadScript(animationSource);
            }
            window.initGsapAnimations?.();
        } catch (error) {
            console.warn('GSAP animations could not be loaded.', error);
        }
    }

    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'site-audio';
        audio.src = AUDIO_PATH;
        audio.loop = true;
        audio.preload = 'auto';
        document.body.append(audio);
    } else if (audio.src !== AUDIO_PATH) {
        audio.src = AUDIO_PATH;
    }
    audio.volume = savedVolume / 100;

    function saveAudioState(forcePlayingState) {
        try {
            const isPlaying = forcePlayingState !== undefined ? forcePlayingState : !audio.paused;
            sessionStorage.setItem(AUDIO_STATE_KEY, JSON.stringify({
                currentTime: audio.currentTime,
                wasPlaying: isPlaying,
                mutedByUser
            }));
        } catch (error) {
            console.warn('Audio playback state could not be saved.', error);
        }
    }

    function restoreAudioState(allowResume = false) {
        try {
            const savedState = JSON.parse(sessionStorage.getItem(AUDIO_STATE_KEY) || 'null');
            if (!savedState) return;
            mutedByUser = savedState.mutedByUser === true;
            if (allowResume) {
                shouldResumeAudio = savedState.wasPlaying === true && !mutedByUser;
            }
            if (Number.isFinite(savedState.currentTime) && savedState.currentTime > 0) {
                if (audio.readyState >= 1) {
                    audio.currentTime = savedState.currentTime;
                } else {
                    audio.addEventListener('loadedmetadata', () => {
                        audio.currentTime = savedState.currentTime;
                    }, { once: true });
                }
            }
        } catch (error) {
            console.warn('Audio playback state could not be restored.', error);
        }
    }

    restoreAudioState();

    function updateToggle(isPlaying) {
        const toggle = document.getElementById('audio-toggle');
        if (!toggle) return;
        const muted = mutedByUser || !isPlaying;
        toggle.setAttribute('aria-pressed', String(!muted));
        toggle.setAttribute('aria-label', muted ? 'Nyalakan musik' : 'Matikan musik');
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.className = isPlaying ? 'fas fa-volume-high' : 'fas fa-volume-mute';
        }
    }

    function startAudio() {
        if (mutedByUser || document.hidden) return;
        shouldResumeAudio = true;
        audio.muted = false;
        audio.play().then(() => {
            updateToggle(true);
            saveAudioState(true);
        }).catch((err) => {
            updateToggle(false);
            console.warn('Audio playback was blocked by the browser.', err);
            const resumeOnInteraction = () => {
                if (!shouldResumeAudio || mutedByUser || document.hidden) return;
                audio.muted = false;
                audio.play().then(() => {
                    updateToggle(true);
                    saveAudioState(true);
                }).catch(() => {});
            };
            window.addEventListener('pointerdown', resumeOnInteraction, { once: true });
            window.addEventListener('keydown', resumeOnInteraction, { once: true });
        });
    }

    function askToPlayMusic() {
        if (musicPromptShown || !audio.paused) return;
        musicPromptShown = true;
        const dialog = document.getElementById('music-consent-dialog');
        const yesButton = document.getElementById('music-consent-yes');
        const noButton = document.getElementById('music-consent-no');
        if (!dialog || !yesButton || !noButton) {
            console.warn('Music consent dialog is unavailable.');
            return;
        }

        let closing = false;
        const closeDialog = wantsMusic => {
            if (closing) return;
            closing = true;
            const finish = () => {
                dialog.hidden = true;
                document.body.classList.remove('music-dialog-open');
                document.removeEventListener('keydown', onDialogKeydown);
                yesButton.onclick = null;
                noButton.onclick = null;
            };

            if (wantsMusic) {
                mutedByUser = false;
                startAudio();
            } else {
                mutedByUser = true;
                shouldResumeAudio = false;
                saveAudioState(false);
                updateToggle(false);
            }

            if (window.animateMusicConsent) {
                window.animateMusicConsent(dialog, true, finish);
            } else {
                finish();
            }
        };
        const onDialogKeydown = event => {
            if (event.key === 'Escape') closeDialog(false);
        };

        yesButton.onclick = () => closeDialog(true);
        noButton.onclick = () => closeDialog(false);
        document.addEventListener('keydown', onDialogKeydown);
        dialog.hidden = false;
        document.body.classList.add('music-dialog-open');
        if (window.animateMusicConsent) {
            window.animateMusicConsent(dialog, false);
        }
        window.requestAnimationFrame(() => yesButton.focus());
    }

    audio.addEventListener('timeupdate', () => {
        if (!audio.paused) {
            saveAudioState(true);
        }
    });
    audio.addEventListener('play', () => {
        saveAudioState(true);
    });
    audio.addEventListener('pause', () => {
        // Only mark wasPlaying as false if user deliberately paused it (via mutedByUser)
        // and not because of page unloads or internal navigation
        if (mutedByUser) {
            saveAudioState(false);
        }
    });
    window.addEventListener('pagehide', () => {
        saveAudioState(!audio.paused);
    });
    window.addEventListener('beforeunload', () => {
        saveAudioState(!audio.paused);
    });

    function bindAudioToggle() {
        const toggle = document.getElementById('audio-toggle');
        if (!toggle || toggle.dataset.audioBound) return;
        toggle.dataset.audioBound = 'true';
        toggle.addEventListener('click', () => {
            if (audio.paused) {
                mutedByUser = false;
                startAudio();
            } else {
                mutedByUser = true;
                audio.pause();
                updateToggle(false);
            }
        });
    }

    function ensureAudioToggle() {
        let toggle = document.getElementById('audio-toggle');
        const navbar = document.querySelector('.navbar');
        if (!toggle && navbar) {
            toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'audio-toggle';
            toggle.id = 'audio-toggle';
            toggle.innerHTML = '<i class="fas fa-volume-mute" aria-hidden="true"></i><span>Musik</span>';
            navbar.append(toggle);
        }
        if (toggle && !toggle.parentElement?.classList.contains('audio-control')) {
            const control = document.createElement('div');
            control.className = 'audio-control';
            toggle.insertAdjacentElement('afterend', control);
            control.append(toggle);

            const panel = document.createElement('div');
            panel.className = 'audio-volume-panel';
            panel.innerHTML = `
                <label for="audio-volume">Volume <output id="audio-volume-output" for="audio-volume">${savedVolume}%</output></label>
                <input id="audio-volume" type="range" min="0" max="100" step="1" value="${savedVolume}" aria-label="Volume musik">
            `;
            control.append(panel);
        }

        bindAudioToggle();
        const control = toggle?.closest('.audio-control');
        const volume = control?.querySelector('#audio-volume');
        const volumeOutput = control?.querySelector('#audio-volume-output');
        if (volume && volume.dataset.volumeBound !== 'true') {
            volume.dataset.volumeBound = 'true';
            const updateVolume = value => {
                const volumePercent = Math.min(100, Math.max(0, Number(value)));
                audio.volume = volumePercent / 100;
                volume.value = String(volumePercent);
                volume.style.setProperty('--volume-fill', `${volumePercent}%`);
                volume.setAttribute('aria-valuetext', `${volumePercent} persen`);
                if (volumeOutput) volumeOutput.value = `${volumePercent}%`;
                try {
                    sessionStorage.setItem(AUDIO_VOLUME_KEY, String(volumePercent));
                } catch (error) {
                    console.warn('Audio volume state could not be saved.', error);
                }
            };
            volume.addEventListener('input', () => updateVolume(volume.value));
            updateVolume(volume.value);
            control.addEventListener('keydown', event => {
                if (event.key === 'Escape') control.classList.add('volume-panel-dismissed');
            });
            control.addEventListener('pointerenter', () => control.classList.remove('volume-panel-dismissed'));
            control.addEventListener('focusin', () => control.classList.remove('volume-panel-dismissed'));
        }
        updateToggle(!audio.paused);
    }

    function setupMobileNavigation() {
        const navbar = document.querySelector('.navbar');
        const navLinks = navbar?.querySelector('.nav-links');
        if (!navbar || !navLinks) return;

        document.body.classList.add('navigation-ready');
        let menuToggle = navbar.querySelector('.menu-toggle');
        if (!menuToggle) {
            menuToggle = document.createElement('button');
            menuToggle.type = 'button';
            menuToggle.className = 'menu-toggle';
            menuToggle.setAttribute('aria-label', 'Buka navigasi');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-controls', navLinks.id || 'primary-navigation');
            menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
            if (!navLinks.id) navLinks.id = 'primary-navigation';
            navbar.append(menuToggle);
        }

        if (menuToggle.dataset.mobileNavBound === 'true') return;
        menuToggle.dataset.mobileNavBound = 'true';

        const closeMenu = () => {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            const icon = menuToggle.querySelector('i');
            icon?.classList.remove('fa-times');
            icon?.classList.add('fa-bars');
        };

        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
            menuToggle.setAttribute('aria-label', isOpen ? 'Tutup navigasi' : 'Buka navigasi');
            const icon = menuToggle.querySelector('i');
            icon?.classList.toggle('fa-bars', !isOpen);
            icon?.classList.toggle('fa-times', isOpen);
            if (isOpen) window.animateNavMenu?.(navLinks);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        menuToggle.addEventListener('keydown', event => {
            if (event.key === 'Escape') closeMenu();
        });

        window.matchMedia('(min-width: 721px)').addEventListener('change', event => {
            if (event.matches) closeMenu();
        });
    }

    function initEasterEgg() {
        if (easterEggInitialized) return;
        easterEggInitialized = true;

        const trigger = 'skipped';
        const message = 'skipped{Y3_Shun99u4n9_C4nt1k_b9t}';
        let typed = '';
        let hideTimer;

        function showEasterEgg() {
            let notice = document.getElementById('easter-egg-notice');
            if (!notice) {
                notice = document.createElement('div');
                notice.id = 'easter-egg-notice';
                notice.className = 'easter-egg-notice';
                notice.setAttribute('role', 'status');
                notice.setAttribute('aria-live', 'polite');
                document.body.append(notice);
            }

            notice.textContent = message;
            window.clearTimeout(hideTimer);
            if (window.animateNotice) {
                window.animateNotice(notice, { hold: 5, offset: 16 });
                return;
            }
            // GSAP has not loaded (offline or blocked CDN): show the notice without animation.
            notice.style.opacity = '1';
            notice.style.transform = 'translate(-50%, 0)';
            hideTimer = window.setTimeout(() => {
                notice.style.opacity = '0';
            }, 5000);
        }

        document.addEventListener('keydown', event => {
            const target = event.target;
            if (target instanceof HTMLElement &&
                (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) {
                return;
            }
            if (event.key.length !== 1) return;

            typed = `${typed}${event.key.toLowerCase()}`.slice(-trigger.length);
            if (typed === trigger) {
                typed = '';
                showEasterEgg();
            }
        });
    }

    function syncEntrySession() {
        const entryScreen = document.getElementById('entry-screen');

        let hasVisited = false;
        try {
            hasVisited = sessionStorage.getItem('skipped-portfolio-entry-seen') === 'true';
        } catch (error) {
            console.warn('Entry session state is unavailable during navigation.', error);
        }

        // Visiting a page without the entry screen means the visitor has
        // already entered the portfolio. Preserve that state for SPA returns
        // to the home page.
        if (!entryScreen) {
            try {
                sessionStorage.setItem('skipped-portfolio-entry-seen', 'true');
            } catch (error) {
                console.warn('Entry session state could not be saved during navigation.', error);
            }
            return;
        }

        if (hasVisited) {
            document.documentElement.classList.add('entry-session-visited');
            document.body.classList.remove('entry-locked');
            entryScreen.hidden = true;
            entryScreen.setAttribute('aria-hidden', 'true');
        }
    }

    async function loadPageScripts(nextDocument) {
        const scripts = [
            ...nextDocument.head.querySelectorAll('script'),
            ...nextDocument.body.querySelectorAll('script')
        ];
        for (const source of scripts.filter(script => script.src)) {
            const absoluteSource = new URL(source.src, window.location.href).href;
            const shouldReload = absoluteSource.endsWith('/assets/js/writeups.js');
            if (!shouldReload && [...document.scripts].some(script => script.src === absoluteSource)) continue;
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = absoluteSource;
                script.onload = resolve;
                script.onerror = reject;
                document.head.append(script);
            });
        }
        // Inline page scripts are intentionally not re-executed. They are
        // page-initialization scripts and may redeclare top-level bindings.
    }

    async function navigate(url, pushState = true) {
        if (navigating) return;
        navigating = true;
        try {
            const response = await fetch(url, { headers: { 'X-Requested-With': 'site-navigation' } });
            if (!response.ok) throw new Error(`Navigation failed with status ${response.status}`);
            const html = await response.text();
            const nextDocument = new DOMParser().parseFromString(html, 'text/html');
            if (nextDocument.getElementById('entry-screen') &&
                !document.getElementById('entry-screen')) {
                try {
                    sessionStorage.setItem('skipped-portfolio-entry-seen', 'true');
                } catch (error) {
                    console.warn('Entry session state could not be saved before navigation.', error);
                }
            }
            const persistentAudio = audio;
            const nextBodyChildren = [...nextDocument.body.children]
                .filter(element => element.tagName !== 'AUDIO' && element.tagName !== 'SCRIPT');

            document.body.replaceChildren(...nextBodyChildren);
            document.body.append(persistentAudio);
            document.body.className = nextDocument.body.className;
            document.title = nextDocument.title;
            syncEntrySession();
            if (pushState) window.history.pushState({}, '', response.url || url);
            await loadPageScripts(nextDocument);
            ensureAudioToggle();
            setupMobileNavigation();
            window.initGsapAnimations?.();
            if (shouldResumeAudio && audio.paused) {
                startAudio();
            }
            window.scrollTo({ top: 0, behavior: 'auto' });
        } catch (error) {
            console.error('Internal navigation failed.', error);
            window.location.href = url;
        } finally {
            navigating = false;
        }
    }

    document.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (!link || event.defaultPrevented || link.target === '_blank' || link.hasAttribute('download')) return;
        const url = new URL(link.href, window.location.href);
        // Only intercept internal links with the same origin or file path
        const isSameOrigin = (url.origin === window.location.origin && url.origin !== 'null') ||
                             (window.location.protocol === 'file:' && url.protocol === 'file:');
        if (!isSameOrigin || url.hash) return;
        event.preventDefault();
        navigate(url.href);
    });

    window.addEventListener('popstate', () => navigate(window.location.href, false));
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            pausedByVisibility = !audio.paused && !mutedByUser;
            shouldResumeAudio = pausedByVisibility;
            audio.muted = true;
            audio.pause();
            updateToggle(false);
        } else if (shouldResumeAudio && !mutedByUser) {
            pausedByVisibility = false;
            startAudio();
        }
    });

    document.addEventListener('portfolio-entry-complete', askToPlayMusic, { once: true });
    initEasterEgg();
    ensureAudioToggle();
    setupMobileNavigation();
    syncEntrySession();
    loadGsapAnimations();

    // Handle Back-Forward Cache (bfcache) when user hits back button in browser
    window.addEventListener('pageshow', event => {
        restoreAudioState(event.persisted);
        ensureAudioToggle();
        if (event.persisted && shouldResumeAudio) {
            startAudio();
        }
    });
})();
