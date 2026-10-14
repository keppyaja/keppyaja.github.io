(() => {
    'use strict';

    const AUDIO_PATH = new URL('../audio/theme.mp3', document.currentScript?.src || window.location.href).href;
    const AUDIO_STATE_KEY = 'portfolio-audio-state';
    let audio = document.getElementById('site-audio');
    let mutedByUser = false;
    let pausedByVisibility = false;
    let navigating = false;
    let shouldResumeAudio = false;

    if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'site-audio';
        audio.src = AUDIO_PATH;
        audio.loop = true;
        audio.preload = 'auto';
        document.body.append(audio);
    }

    function saveAudioState() {
        try {
            sessionStorage.setItem(AUDIO_STATE_KEY, JSON.stringify({
                currentTime: audio.currentTime,
                wasPlaying: !audio.paused,
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
            if (Number.isFinite(savedState.currentTime) && savedState.currentTime > 0) {
                audio.currentTime = savedState.currentTime;
            }
            mutedByUser = savedState.mutedByUser === true;
        } catch (error) {
            console.warn('Audio playback state could not be restored.', error);
        }
    }

    restoreAudioState();
    audio.addEventListener('loadedmetadata', () => {
        restoreAudioState();
        if (shouldResumeAudio) startAudio();
    }, { once: true });
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
        audio.play().then(() => updateToggle(true)).catch(() => updateToggle(false));
    }

    audio.addEventListener('timeupdate', saveAudioState);
    audio.addEventListener('pause', saveAudioState);
    audio.addEventListener('play', saveAudioState);
    window.addEventListener('pagehide', saveAudioState);
    window.addEventListener('beforeunload', saveAudioState);

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

    function syncEntrySession() {
        const entryScreen = document.getElementById('entry-screen');
        if (!entryScreen) return;

        let hasVisited = false;
        try {
            hasVisited = sessionStorage.getItem('skipped-portfolio-entry-seen') === 'true';
        } catch (error) {
            console.warn('Entry session state is unavailable during navigation.', error);
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
            const persistentAudio = audio;
            const nextBodyChildren = [...nextDocument.body.children]
                .filter(element => element.tagName !== 'AUDIO' && element.tagName !== 'SCRIPT');

            document.body.replaceChildren(...nextBodyChildren);
            document.body.append(persistentAudio);
            document.body.className = nextDocument.body.className;
            document.title = nextDocument.title;
            syncEntrySession();
            if (pushState) window.history.pushState({}, '', url);
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
        if (url.origin !== window.location.origin || url.hash) return;
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

    ensureAudioToggle();
    syncEntrySession();
    if (!shouldResumeAudio) startAudio();
})();
