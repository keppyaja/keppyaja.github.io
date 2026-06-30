// --- Terminal Typewriter Effect ---
        const terminalContent = document.getElementById('terminal-content');
        const commands = [
            { text: "kali@tsaqif:~$ whoami", isCommand: true },
            { text: "Tsaqif Fawwaz - Cyber Security & CP Enthusiast", isCommand: false },
            { text: "kali@tsaqif:~$ ./show_focus.sh", isCommand: true },
            { text: "[+] Cryptography [+] Binary Exploitation [+] Linux", isCommand: false }
        ];

        let lineIndex = 0;
        let charIndex = 0;

        function typeTerminal() {
            if (lineIndex < commands.length) {
                if (charIndex === 0) {
                    const p = document.createElement('p');
                    if (commands[lineIndex].isCommand) {
                        p.innerHTML = `<span class="terminal-prompt">${commands[lineIndex].text.split(' ')[0]}</span> `;
                        // Mulai mengetik command setelah prompt
                        commands[lineIndex].textToType = commands[lineIndex].text.substring(commands[lineIndex].text.indexOf(' ') + 1);
                    } else {
                        p.className = "terminal-output";
                        commands[lineIndex].textToType = commands[lineIndex].text;
                    }
                    p.innerHTML += `<span class="typing-text cursor-blink"></span>`;
                    terminalContent.appendChild(p);
                }

                const currentP = terminalContent.lastElementChild.querySelector('.typing-text');
                
                if (charIndex < commands[lineIndex].textToType.length) {
                    currentP.textContent += commands[lineIndex].textToType.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeTerminal, 40); 
                } else {
                    currentP.classList.remove('cursor-blink');
                    lineIndex++;
                    charIndex = 0;
                    setTimeout(typeTerminal, 400); 
                }
            } else {
                const p = document.createElement('p');
                p.innerHTML = `<span class="terminal-prompt">kali@tsaqif:~$</span> <span class="cursor-blink"></span>`;
                terminalContent.appendChild(p);
            }
        }

        window.addEventListener('load', typeTerminal);

        // --- NEW: Mobile menu toggle ---
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');

        menuToggle.addEventListener('click', function () {
            const isOpen = navLinks.classList.toggle('active');
            this.setAttribute('aria-expanded', isOpen);
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });

        // Close mobile menu when a nav link is clicked
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                menuToggle.querySelector('i').classList.remove('fa-times');
                menuToggle.querySelector('i').classList.add('fa-bars');
            });
        });

        // --- Smooth scroll untuk anchor links ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (this.getAttribute('href') === '#') return;
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // --- NEW: Header glow + active-section nav highlighting on scroll ---
        const header = document.querySelector('header');
        const sections = document.querySelectorAll('section[id]');
        const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

        function handleScrollEffects() {
            // Toggle glow pada header
            header.classList.toggle('scrolled', window.scrollY > 100);

            // Deteksi menu aktif berdasarkan section di layar
            let currentSection = '';
            sections.forEach(section => {
                if (window.scrollY >= section.offsetTop - 120) {
                    currentSection = section.id;
                }
            });

            navAnchors.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${currentSection}`);
            });
        }

        window.addEventListener('scroll', handleScrollEffects);
        handleScrollEffects(); // Trigger once on load

        // --- Form submission alert hacker-style ---
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('[+] Payload Delivered. Connection established successfully.');
            this.reset();
        });