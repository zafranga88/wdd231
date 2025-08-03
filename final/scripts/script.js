// Import modules
import { TrailManager } from './modules/trailManager.js';
import { WeatherService } from './modules/weatherService.js';
import { LocalStorageManager } from './modules/storageManager.js';
import { ModalHandler } from './modules/modalHandler.js';

// Global variables
let trailManager;
let weatherService;
let storageManager;
let modalHandler;

// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const featuredTrailsGrid = document.getElementById('featuredTrailsGrid');
const scrollToTopBtn = document.getElementById('scrollToTop');
const recentUpdates = document.getElementById('recentUpdates');
const trailConditions = document.getElementById('trailConditions');

// Statistics elements
const totalTrailsEl = document.getElementById('totalTrails');
const totalDistanceEl = document.getElementById('totalDistance');
const avgDurationEl = document.getElementById('avgDuration');
const maxElevationEl = document.getElementById('maxElevation');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

async function initializeWebsite() {
    try {
        // Initialize services
        trailManager = new TrailManager();
        weatherService = new WeatherService();
        storageManager = new LocalStorageManager();
        modalHandler = new ModalHandler();

        // Set basic info
        setCurrentYear();
        setLastModified();
        
        // Load data and initialize features
        await loadAndDisplayData();
        initializeEventListeners();
        initializeScrollAnimations();
        handleScrollToTop();
        
        // Load user preferences
        loadUserPreferences();
        
        console.log('Patagonia Trail Explorers loaded successfully!');
    } catch (error) {
        console.error('Error initializing website:', error);
        showErrorMessage('Failed to load trail data. Please refresh the page.');
    }
}

// Load and display all data
async function loadAndDisplayData() {
    try {
        // Load trail data
        await trailManager.loadTrails();
        
        // Display featured trails (first 4)
        displayFeaturedTrails();
        
        // Display statistics
        displayStatistics();
        
        // Display recent updates
        displayRecentUpdates();
        
        // Display trail conditions
        displayTrailConditions();
        
        // Update weather
        updateWeatherWidget();
        
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Display featured trails on homepage
function displayFeaturedTrails() {
    const featuredTrails = trailManager.getFeaturedTrails(4);
    
    if (!featuredTrailsGrid) return;
    
    featuredTrailsGrid.innerHTML = '';
    
    featuredTrails.forEach((trail, index) => {
        const trailCard = createFeaturedTrailCard(trail);
        trailCard.classList.add('fade-in');
        featuredTrailsGrid.appendChild(trailCard);
        
        // Stagger animation
        setTimeout(() => {
            trailCard.classList.add('visible');
        }, index * 150);
    });
}

// Create featured trail card
function createFeaturedTrailCard(trail) {
    const card = document.createElement('div');
    card.className = 'trail-preview-card';
    
    // Get trail icon based on difficulty
    const trailIcon = getTrailIcon(trail.difficulty);
    
    card.innerHTML = `
        <div class="trail-preview-image">
            ${trailIcon}
        </div>
        <div class="trail-preview-info">
            <h4 class="trail-preview-title">${trail.name}</h4>
            <p class="trail-preview-description">${trail.description}</p>
            <div class="trail-preview-meta">
                <span class="difficulty ${trail.difficulty}">${trail.difficulty}</span>
                <span class="trail-preview-duration">${trail.duration}</span>
            </div>
        </div>
    `;
    
    // Add click event for trail details
    card.addEventListener('click', () => {
        showTrailModal(trail);
    });
    
    return card;
}

// Get trail icon based on difficulty
function getTrailIcon(difficulty) {
    const icons = {
        beginner: '🥾',
        intermediate: '⛰️',
        advanced: '🏔️'
    };
    return icons[difficulty] || '🏞️';
}

// Display statistics
function displayStatistics() {
    const stats = trailManager.getStatistics();
    
    if (totalTrailsEl) animateNumber(totalTrailsEl, stats.totalTrails);
    if (totalDistanceEl) animateNumber(totalDistanceEl, stats.totalDistance);
    if (avgDurationEl) animateNumber(avgDurationEl, stats.avgDuration);
    if (maxElevationEl) animateNumber(maxElevationEl, stats.maxElevation);
}

// Animate numbers counting up
function animateNumber(element, finalValue) {
    const duration = 2000; // 2 seconds
    const start = 0;
    const increment = finalValue / (duration / 16); // 60fps
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
            current = finalValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Display recent updates
function displayRecentUpdates() {
    const updates = getRecentUpdates();
    
    if (!recentUpdates) return;
    
    recentUpdates.innerHTML = '';
    
    updates.slice(0, 5).forEach(update => {
        const updateItem = document.createElement('div');
        updateItem.className = 'update-item fade-in';
        updateItem.innerHTML = `
            <div class="update-date">${update.date}</div>
            <div class="update-title">${update.title}</div>
            <div class="update-content">${update.content}</div>
        `;
        recentUpdates.appendChild(updateItem);
    });
}

// Get recent updates data
function getRecentUpdates() {
    return [
        {
            date: '2024-03-15',
            title: 'Trail Conditions Update',
            content: 'Fitz Roy Circuit trail is now fully accessible after recent weather improvements.'
        },
        {
            date: '2024-03-12',
            title: 'New Safety Guidelines',
            content: 'Updated safety recommendations for high-altitude trekking in Patagonia.'
        },
        {
            date: '2024-03-10',
            title: 'Weather Alert',
            content: 'Strong winds expected in Torres del Paine area. Check conditions before departing.'
        },
        {
            date: '2024-03-08',
            title: 'Permit Requirements',
            content: 'New permit system implemented for Valle del Frances. Book in advance.'
        },
        {
            date: '2024-03-05',
            title: 'Trail Closure',
            content: 'Cerro Torre Base Trek temporarily closed due to bridge maintenance.'
        }
    ];
}

// Display trail conditions
function displayTrailConditions() {
    const conditions = getTrailConditions();
    
    if (!trailConditions) return;
    
    trailConditions.innerHTML = '';
    
    conditions.forEach(condition => {
        const conditionItem = document.createElement('div');
        conditionItem.className = 'condition-item';
        conditionItem.innerHTML = `
            <span class="condition-trail">${condition.trail}</span>
            <span class="condition-status ${condition.status.toLowerCase()}">${condition.status}</span>
        `;
        trailConditions.appendChild(conditionItem);
    });
}

// Get trail conditions data
function getTrailConditions() {
    return [
        { trail: 'Fitz Roy Circuit', status: 'Good' },
        { trail: 'Torres del Paine W', status: 'Caution' },
        { trail: 'Perito Moreno', status: 'Excellent' },
        { trail: 'Laguna de los Tres', status: 'Good' },
        { trail: 'Valle del Frances', status: 'Caution' }
    ];
}

// Show trail modal
function showTrailModal(trail) {
    modalHandler.showTrailDetails(trail);
    
    // Save to recently viewed
    storageManager.addToRecentlyViewed(trail);
}

// Initialize event listeners
function initializeEventListeners() {
    // Mobile menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu && navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
    
    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Modal events
    modalHandler.initializeEvents();
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Toggle mobile menu
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Handle newsletter form submission
function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Get checkbox values
    const interests = formData.getAll('interests');
    data.interests = interests;
    
    // Save to localStorage
    storageManager.saveNewsletterPreferences(data);
    
    // Show success message
    showSuccessMessage('Thank you for subscribing to our newsletter!');
    
    // Reset form
    e.target.reset();
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
    // ESC key closes mobile menu and modals
    if (e.key === 'Escape') {
        if (navMenu && navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
        modalHandler.closeModal();
    }
}

// Weather widget functionality
function updateWeatherWidget() {
    weatherService.getCurrentWeather()
        .then(weather => {
            const weatherInfo = document.getElementById('weatherInfo');
            if (weatherInfo) {
                weatherInfo.innerHTML = `
                    <div class="weather-location">${weather.location}</div>
                    <div class="weather-temp">${weather.temperature}°C</div>
                    <div class="weather-condition">${weather.condition}</div>
                    <div class="weather-wind">Wind: ${weather.windSpeed} km/h ${weather.windDirection}</div>
                `;
            }
        })
        .catch(error => {
            console.error('Error updating weather:', error);
        });
}

// Handle scroll to top button
function handleScrollToTop() {
    if (!scrollToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe sections for fade-in animation
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in');
        observer.observe(section);
    });
    
    // Special handling for stats section
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Load user preferences
function loadUserPreferences() {
    const preferences = storageManager.getUserPreferences();
    
    if (preferences) {
        // Apply user preferences (theme, language, etc.)
        console.log('User preferences loaded:', preferences);
    }
}

// Utility functions
function setCurrentYear() {
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}

function setLastModified() {
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        lastModifiedElement.textContent = `Last modified: ${document.lastModified}`;
    }
}

function showSuccessMessage(message) {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-green);
        color: white;
        padding: 1rem 2rem;
        border-radius: 6px;
        z-index: 3000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showErrorMessage(message) {
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger-red);
        color: white;
        padding: 1rem 2rem;
        border-radius: 6px;
        z-index: 3000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Initialize weather updates
setInterval(updateWeatherWidget, 300000); // Update every 5 minutes

// Export for other modules
export { trailManager, storageManager, modalHandler };