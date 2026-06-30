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
            setTimeout(typeTerminal, 40); // Kecepatan ketik
        } else {
            currentP.classList.remove('cursor-blink');
            lineIndex++;
            charIndex = 0;
            setTimeout(typeTerminal, 400); // Jeda sebelum baris baru
        }
    } else {
        // Biarkan cursor berkedip di baris kosong terakhir
        const p = document.createElement('p');
        p.innerHTML = `<span class="terminal-prompt">kali@tsaqif:~$</span> <span class="cursor-blink"></span>`;
        terminalContent.appendChild(p);
    }
}

// Mulai animasi saat halaman dimuat
window.addEventListener('load', typeTerminal);


// --- Toggle menu mobile (Tetap sama) ---
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
    this.querySelector('i').classList.toggle('fa-bars');
    this.querySelector('i').classList.toggle('fa-times');
});

// Tutup menu saat klik link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelector('.nav-links').classList.remove('active');
        const icon = document.querySelector('.menu-toggle i');
        if(icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
});

// --- Smooth scroll & Header shadow (Tetap sama) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if(this.getAttribute('href') === '#') return;
        e.preventDefault();
        const targetElement = document.querySelector(this.getAttribute('href'));
        if(targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 4px 10px rgba(0, 255, 65, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
});

// --- Form submission alert hacker-style ---
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('[+] Payload Delivered. Connection established successfully.');
    this.reset();
});