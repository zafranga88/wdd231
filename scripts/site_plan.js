
function setCurrentYear() {
    const currentYearElement = document.getElementById('currentyear');
    if (currentYearElement) {
        const currentYear = new Date().getFullYear();
        currentYearElement.textContent = currentYear;
    }
}

function setLastModified() {
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        const lastModified = document.lastModified;
        lastModifiedElement.textContent = `Last modified: ${lastModified}`;
    }
}

function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initColorSwatchInteractions() {
    const colorSwatches = document.querySelectorAll('.color-swatch');
    
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        swatch.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

function initWireframeInteractions() {
    const wireframeElements = document.querySelectorAll('.trail-card, .widget, .cta-button, .filter-item');
    
    wireframeElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#2c5282';
            this.style.color = '#ffffff';
            this.style.transition = 'all 0.3s ease';
            this.style.cursor = 'pointer';
        });
        
        element.addEventListener('mouseleave', function() {
            if (this.classList.contains('trail-card')) {
                this.style.backgroundColor = '#f7fafc';
            } else if (this.classList.contains('widget')) {
                this.style.backgroundColor = '#f7fafc';
            } else if (this.classList.contains('cta-button')) {
                this.style.backgroundColor = '#2c5282';
            } else if (this.classList.contains('filter-item')) {
                this.style.backgroundColor = '#e2e8f0';
            }
            this.style.color = '#1a202c';
            this.style.cursor = 'default';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setCurrentYear();
    setLastModified();
    initSmoothScrolling();
    initColorSwatchInteractions();
    initWireframeInteractions();
    
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

function addScrollToTop() {
    const scrollButton = document.createElement('button');
    scrollButton.innerHTML = '↑';
    scrollButton.setAttribute('id', 'scrollToTop');
    scrollButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #1a365d;
        color: white;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        transition: all 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(scrollButton);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    });
    
    scrollButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    scrollButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#2c5282';
        this.style.transform = 'scale(1.1)';
    });
    
    scrollButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#1a365d';
        this.style.transform = 'scale(1)';
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setCurrentYear();
    setLastModified();
    initSmoothScrolling();
    initColorSwatchInteractions();
    initWireframeInteractions();
    addScrollToTop();
    
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
    
    console.log('Patagonia Trail Explorers Website Plan loaded successfully!');
});