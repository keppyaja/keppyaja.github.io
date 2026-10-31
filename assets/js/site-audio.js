(() => {
    'use strict';

    // Determine the absolute URL of the audio file relative to the site-audio.js script
    const scriptTag = document.currentScript || document.querySelector('script[src*="site-audio.js"]');
    const SCRIPT_URL = scriptTag?.src || window.location.href;
    const AUDIO_PATH = new URL('../audio/theme.mp3', SCRIPT_URL).href;
    const AUDIO_STATE_KEY = 'portfolio-audio-state';
    let audio = document.getElementById('site-audio');
    let mutedByUser = false;
    let pausedByVisibility = false;
    let navigating = false;
    let shouldResumeAudio = false;
    let easterEggInitialized = false;

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

    function restoreAudioState() {
        try {
            const savedState = JSON.parse(sessionStorage.getItem(AUDIO_STATE_KEY) || 'null');
            if (!savedState) return;
            shouldResumeAudio = savedState.wasPlaying === true;
            mutedByUser = savedState.mutedByUser === true;
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
        audio.muted = false;
        audio.play().then(() => {
            updateToggle(true);
            saveAudioState(true);
        }).catch((err) => {
            updateToggle(false);
            // Browser autoplay restrictions: resume on first user interaction
            const resumeOnInteraction = () => {
                if (mutedByUser || !shouldResumeAudio) return;
                audio.play().then(() => {
                    updateToggle(true);
                    saveAudioState(true);
                }).catch(() => {});
            };
            window.addEventListener('click', resumeOnInteraction, { once: true });
            window.addEventListener('keydown', resumeOnInteraction, { once: true });
            window.addEventListener('touchstart', resumeOnInteraction, { once: true });
        });
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
        bindAudioToggle();
        updateToggle(!audio.paused);
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
            notice.classList.add('is-visible');
            window.clearTimeout(hideTimer);
            hideTimer = window.setTimeout(() => {
                notice.classList.remove('is-visible');
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
            startAudio();
            window.scrollTo({ top: 0, behavior: 'auto' });
        } catch (error) {
            console.error('Internal navigation failed.', error);
            window.location.href = url;
        } finally {
            navigating = false;
        }
    }

    document.addEventListener('click', event => {
        if (event.target.closest('#enter-site')) {
            startAudio();
            return;
        }
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
            audio.muted = true;
            audio.pause();
            updateToggle(false);
        } else if (pausedByVisibility && !mutedByUser) {
            pausedByVisibility = false;
            startAudio();
        }
    });

    initEasterEgg();
    ensureAudioToggle();
    syncEntrySession();
    if (shouldResumeAudio) {
        startAudio();
    }

    // Handle Back-Forward Cache (bfcache) when user hits back button in browser
    window.addEventListener('pageshow', (event) => {
        restoreAudioState();
        ensureAudioToggle();
        if (shouldResumeAudio && audio.paused) {
            startAudio();
        }
    });
})();
