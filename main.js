document.addEventListener("DOMContentLoaded", () => {

    /* ==========================================================================
       1. LANGUAGES (i18n)
       ========================================================================== */
    const langSelect = document.getElementById('langSelect');
    
    function changeLanguage(lang) {
        document.querySelectorAll('.tr').forEach(el => { 
            if (el.dataset[lang]) el.innerHTML = el.dataset[lang]; 
        });
        document.querySelectorAll('.tr-ph').forEach(el => { 
            if (el.dataset[lang]) el.placeholder = el.dataset[lang]; 
        });
        document.documentElement.lang = lang;
        localStorage.setItem('preferredLang', lang); 
        if (langSelect) langSelect.value = lang;
    }

    const currentLang = localStorage.getItem('preferredLang') || document.documentElement.lang || "en";
    changeLanguage(currentLang);

    if (langSelect) {
        langSelect.addEventListener('change', (e) => changeLanguage(e.target.value));
    }

    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();


    /* ==========================================================================
       2. DARK THEME TOGGLE
       ========================================================================== */
    const themeToggle = document.getElementById('theme-toggle');
    const iconMoon = document.getElementById('theme-icon-moon');
    const iconSun = document.getElementById('theme-icon-sun');

    function updateThemeUI(isDark) {
        if(iconMoon && iconSun) {
            iconMoon.style.display = isDark ? 'none' : 'block';
            iconSun.style.display = isDark ? 'block' : 'none';
        }
    }

    // Set initial icon state
    updateThemeUI(document.documentElement.classList.contains('dark-theme'));

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeUI(isDark);
        });
    }

    /* ==========================================================================
       3. NAVIGATION, SCROLL-SPY & REVEAL
       ========================================================================== */
    const navbar = document.getElementById('navbar');
    const sentinel = document.getElementById('nav-sentinel');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');

    // Sticky Nav effect
    if (sentinel && navbar) {
        const navObserver = new IntersectionObserver((entries) => {
            navbar.classList.toggle('scrolled', !entries[0].isIntersecting);
        }, { threshold: 0 });
        navObserver.observe(sentinel);
    }

    // Scroll-Spy
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: "-45% 0px -45% 0px" });

    sections.forEach(sec => spyObserver.observe(sec));

    // Reveal Up
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));


    /* ==========================================================================
       4. VIDEO CAROUSEL & SWIPE
       ========================================================================== */
    let videoIdx = 0;
    const videoTrack = document.getElementById('video-track');
    const videoWrapper = document.getElementById('video-wrapper');
    
    function moveVideoCarousel(dir) {
        if (!videoTrack) return;
        const count = videoTrack.children.length;
        videoIdx = (videoIdx + dir + count) % count;
        videoTrack.style.transform = `translateX(-${videoIdx * 100}%)`;
    }

    document.getElementById('btn-prev-vid')?.addEventListener('click', () => moveVideoCarousel(-1));
    document.getElementById('btn-next-vid')?.addEventListener('click', () => moveVideoCarousel(1));

    let touchstartX = 0;
    videoWrapper?.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; }, {passive: true});
    videoWrapper?.addEventListener('touchend', e => {
        const diffX = touchstartX - e.changedTouches[0].screenX;
        if (Math.abs(diffX) > 50) moveVideoCarousel(diffX > 0 ? 1 : -1);
    }, {passive: true});


    /* ==========================================================================
       5. LIGHTBOX
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    let currentLightboxIndex = 0;
    
    function openLightbox(index) {
        currentLightboxIndex = index;
        lightboxImg.src = lightboxTriggers[currentLightboxIndex].src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    function navigateLightbox(dir) {
        currentLightboxIndex = (currentLightboxIndex + dir + lightboxTriggers.length) % lightboxTriggers.length;
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = lightboxTriggers[currentLightboxIndex].src;
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    lightboxTriggers.forEach((img, index) => img.addEventListener('click', () => openLightbox(index)));

    document.getElementById('btn-close-lightbox')?.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; 
    });

    document.getElementById('btn-prev-lightbox')?.addEventListener('click', () => navigateLightbox(-1));
    document.getElementById('btn-next-lightbox')?.addEventListener('click', () => navigateLightbox(1));

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === "Escape") { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
        if (e.key === "ArrowRight") navigateLightbox(1);
        if (e.key === "ArrowLeft") navigateLightbox(-1);
    });


    /* ==========================================================================
       6. FORM SIMULATION (TEMPLATE MODE) & MISC
       ========================================================================== */
    document.getElementById('contactForm')?.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const statusEl = document.getElementById('formStatus');
        const submitBtn = this.querySelector('button[type="submit"]');
        
        if (document.getElementById('honeypot').value) return false;
        
        submitBtn.disabled = true;
        const lang = document.documentElement.lang;
        const originalText = submitBtn.textContent;
        
        const loadingText = { en: "Sending...", pl: "Wysyłanie...", ru: "Отправка...", es: "Enviando...", de: "Senden...", fr: "Envoi..." };
        submitBtn.textContent = loadingText[lang] || loadingText['en'];
        
        setTimeout(() => {
            statusEl.style.display = 'block';
            statusEl.style.color = 'var(--bord)';
            
            const successText = {
                en: "Message sent successfully (Demo Mode)!",
                pl: "Wiadomość wysłana pomyślnie (Tryb Demo)!",
                ru: "Сообщение успешно отправлено (Демо)!",
                es: "¡Mensaje enviado con éxito (Demo)!",
                de: "Nachricht erfolgreich gesendet (Demo)!",
                fr: "Message envoyé avec succès (Démo)!"
            };
            
            statusEl.textContent = successText[lang] || successText['en'];
            this.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            setTimeout(() => { statusEl.style.display = 'none'; }, 5000);
        }, 1500);
    });

    document.getElementById('btn-toggle-privacy')?.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        document.getElementById('privacy-content').classList.toggle('open', !isExpanded);
    });

    const starContainer = document.querySelector('.sessions-rating .stars');
    if (starContainer) {
        const stars = starContainer.textContent.trim().split('');
        starContainer.textContent = '';
        const starSpans = stars.map((char, i) => {
            const span = document.createElement('span');
            span.textContent = char;
            Object.assign(span.style, { display: 'inline-block', opacity: '0', transform: 'scale(0)', transition: `all 0.4s ${i * 0.1}s` });
            starContainer.appendChild(span);
            return span;
        });
        
        new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                starSpans.forEach(s => { s.style.opacity = '1'; s.style.transform = 'scale(1)'; });
            }
        }).observe(starContainer);
    }

    /* ==========================================================================
       7. VIDEO DEMO CLICK HANDLER
       ========================================================================== */
    document.querySelectorAll('.video-demo-container').forEach(container => {
        container.addEventListener('click', function() {
            this.classList.add('show-message');
            setTimeout(() => this.classList.remove('show-message'), 3500);
        });
    });

});