document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal observer
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Counter animation observer
    const counterElements = document.querySelectorAll('.stat-num[data-target]');
    let hasCounted = false;

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasCounted) {
                hasCounted = true;
                counterElements.forEach(counter => {
                    const updateCount = () => {
                        const target = parseFloat(counter.getAttribute('data-target'));
                        const current = parseFloat(counter.innerText.replace(/[^0-9.]/g, '') || 0);
                        
                        const isDecimal = target % 1 !== 0;
                        const inc = target / 100;

                        if (current < target) {
                            counter.innerText = isDecimal ? (current + inc).toFixed(1) : Math.ceil(current + inc);
                            setTimeout(updateCount, 15);
                        } else {
                            counter.innerText = isDecimal ? target.toFixed(1) : target.toLocaleString();
                            if(counter.getAttribute('data-suffix')) {
                                counter.innerText += counter.getAttribute('data-suffix');
                            }
                        }
                    };
                    updateCount();
                });
            }
        });
    }, {
        threshold: 0.5
    });

    const statsSection = document.getElementById('stats-section');
    if(statsSection) {
        counterObserver.observe(statsSection);
    }
});
