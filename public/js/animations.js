document.addEventListener('DOMContentLoaded', () => {
  // ── 1. Scroll Reveal Observer ────────────────────────────
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── 2. Stat Counter Animation ────────────────────────────
  const counterElements = document.querySelectorAll('.stat-num[data-target]');
  let hasCounted = false;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasCounted) {
        hasCounted = true;
        counterElements.forEach(counter => {
          const target = parseFloat(counter.getAttribute('data-target'));
          const suffix = counter.getAttribute('data-suffix') || '';
          const duration = 1500; // ms
          const startTime = performance.now();

          const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const currentValue = easeProgress * target;

            if (target % 1 !== 0) {
              counter.innerText = currentValue.toFixed(1) + suffix;
            } else {
              counter.innerText = Math.floor(currentValue).toLocaleString() + suffix;
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              counter.innerText = (target % 1 !== 0 ? target.toFixed(1) : target.toLocaleString()) + suffix;
            }
          };

          requestAnimationFrame(animate);
        });
      }
    });
  }, {
    threshold: 0.3
  });

  const statsSection = document.getElementById('stats-section');
  if (statsSection) {
    counterObserver.observe(statsSection);
  }

  // ── 3. Interactive Hero Particles (Canvas-Based) ─────────
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null, radius: 100 };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track mouse over hero section
    const heroSection = canvas.closest('.premium-hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      heroSection.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
      });
    }

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * canvas.width;
        this.y = init ? Math.random() * canvas.height : canvas.height + 10;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.color = Math.random() > 0.4 ? 'rgba(0, 198, 255, ' : 'rgba(255, 153, 0, '; // Blue/Cyan or Orange sparks
        this.opacity = Math.random() * 0.5 + 0.3;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.fadeSpeed;

        // Interaction with mouse (push particles away slightly)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force * 2;
            this.y += Math.sin(angle) * force * 2;
          }
        }

        if (this.opacity <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.opacity + ')';
        ctx.shadowColor = this.color === 'rgba(0, 198, 255, ' ? '#00c6ff' : '#ff9900';
        ctx.shadowBlur = this.size * 4;
        ctx.fill();
        ctx.restore();
      }
    }

    const initParticles = () => {
      particles = [];
      const count = Math.min(Math.floor(canvas.width / 15), 80);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    };
    initParticles();
    window.addEventListener('resize', initParticles);

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }

  // ── 4. Parallax Mouse Move Effect for Hero Image ──────────
  const heroImg = document.querySelector('.hero-image');
  const heroContainer = document.querySelector('.premium-hero');
  if (heroImg && heroContainer) {
    heroContainer.addEventListener('mousemove', (e) => {
      const rect = heroContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const moveX = (x - rect.width / 2) / rect.width * 20; // max 20px
      const moveY = (y - rect.height / 2) / rect.height * 20; // max 20px
      
      heroImg.style.transform = `scale(1.08) translate(${moveX}px, ${moveY}px)`;
    });
  }

  // ── 5. 3D Tilt Effect for Premium Cards ──────────────────
  const tiltCards = document.querySelectorAll('.service-premium-card, .trust-card-glass, .stat-box');
  
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate normalized values (-0.5 to 0.5)
      const xNorm = (x / rect.width) - 0.5;
      const yNorm = (y / rect.height) - 0.5;
      
      // Calculate tilt angles (max 10 degrees)
      const tiltX = -yNorm * 10;
      const tiltY = xNorm * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
      card.style.transition = 'none';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.transition = 'transform 0.5s ease';
    });
  });

  // ── 6. Scroll To Top Button ──────────────────────────────
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
