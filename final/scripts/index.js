// index.js - Main script for Patagonia Trail Explorers index page

// State management for index page
const IndexState = {
    trails: [],
    featuredTrails: [],
    favorites: [],
    weather: null,
    recentUpdates: []
};

// Utility functions
const IndexUtils = {
    // Template literal for creating featured trail cards - FIXED to use actual images
    createFeaturedTrailCard: (trail) => {
        const isFavorite = IndexState.favorites.includes(trail.id);
        const favoriteIcon = isFavorite ? '❤️' : '🤍';
        
        // Use actual image from JSON data with fallback
        const imageDisplay = `
            <img src="images/${trail.image}" 
                 alt="${trail.name}" 
                 class="trail-image"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                 loading="lazy">
            <div class="trail-image-placeholder" style="
                background: linear-gradient(45deg, var(--glacier-blue), var(--patagonian-navy));
                display: none;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 3rem;
                width: 100%;
                height: 100%;
            ">
                
            </div>
        `;
        
        return `
            <div class="trail-card grid-view featured-trail-card" data-trail-id="${trail.id}">
                <div class="trail-image-container">
                    ${imageDisplay}
                    <button class="favorite-btn ${isFavorite ? 'favorite' : ''}" 
                            data-trail-id="${trail.id}" 
                            aria-label="Toggle favorite">
                        ${favoriteIcon}
                    </button>
                    <div class="trail-status ${trail.conditions}">
                        ${trail.conditions}
                    </div>
                </div>
                <div class="trail-info">
                    <h3 class="trail-name">${trail.name}</h3>
                    <p class="trail-location">${trail.location}, ${trail.country}</p>
                    <div class="trail-meta">
                        <span class="difficulty ${trail.difficulty}">
                            ${trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
                        </span>
                        <span class="duration">${trail.duration} day${trail.duration > 1 ? 's' : ''}</span>
                        <span class="distance">${trail.distance} km</span>
                    </div>
                    <p class="trail-description">${trail.description.substring(0, 120)}...</p>
                    <button class="btn btn-primary view-details" data-trail-id="${trail.id}">
                        View Details
                    </button>
                </div>
            </div>
        `;
    },

    // Create weather display HTML
    createWeatherDisplay: (weather) => {
        return `
            <div class="weather-current">
                <div class="weather-main">
                    <span class="temperature">${Math.round(weather.temperature)}°C</span>
                    <div class="weather-desc">
                        <span class="condition">${weather.condition}</span>
                        <span class="location">${weather.location}</span>
                    </div>
                </div>
                <div class="weather-details">
                    <div class="weather-item">
                        <span class="label">Feels like:</span>
                        <span class="value">${Math.round(weather.feelsLike)}°C</span>
                    </div>
                    <div class="weather-item">
                        <span class="label">Humidity:</span>
                        <span class="value">${weather.humidity}%</span>
                    </div>
                    <div class="weather-item">
                        <span class="label">Wind:</span>
                        <span class="value">${weather.windSpeed} km/h</span>
                    </div>
                </div>
            </div>
        `;
    },

    // Create recent updates HTML
    createRecentUpdateItem: (update) => {
        const date = new Date(update.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <div class="update-item">
                <div class="update-date">${formattedDate}</div>
                <div class="update-content">
                    <h4 class="update-title">${update.title}</h4>
                    <p class="update-text">${update.content}</p>
                </div>
            </div>
        `;
    },

    // Local storage utilities - Note: These won't work in Claude artifacts
    saveToStorage: (key, data) => {
        try {
            // In a real environment, this would use localStorage
            // For Claude artifacts, we'll just store in memory
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(key, JSON.stringify(data));
            }
        } catch (error) {
            console.error('Storage not available:', error);
        }
    },

    loadFromStorage: (key, defaultValue = []) => {
        try {
            // In a real environment, this would use localStorage
            // For Claude artifacts, return default value
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem(key);
                return stored ? JSON.parse(stored) : defaultValue;
            }
            return defaultValue;
        } catch (error) {
            console.error('Storage not available:', error);
            return defaultValue;
        }
    }
};

// Data management for index page
const IndexDataManager = {
    // Fetch trail data - UPDATED to properly handle the JSON structure
    async fetchTrailData() {
        try {
            // First try to read from the uploaded file
            if (typeof window !== 'undefined' && window.fs && window.fs.readFile) {
                try {
                    const fileContent = await window.fs.readFile('trails.json', { encoding: 'utf8' });
                    const data = JSON.parse(fileContent);
                    return data;
                } catch (fileError) {
                    console.log('Could not read uploaded file, trying fetch...');
                }
            }
            
            // Fallback to fetch (for when deployed)
            const response = await fetch('data/trails.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching trail data:', error);
            // Return sample data as fallback
            return {
                trails: [
                    {
                        id: 1,
                        name: "Torres del Paine W Trek",
                        description: "The classic W Trek through Torres del Paine National Park, featuring iconic granite towers, glacial lakes, and diverse wildlife.",
                        difficulty: "intermediate",
                        duration: 5,
                        distance: 71,
                        elevation: 1200,
                        country: "Chile",
                        location: "Torres del Paine National Park",
                        season: "October-April",
                        highlights: ["Torres Base viewpoint", "French Valley", "Grey Glacier"],
                        conditions: "good",
                        image: "torres-del-paine.jpg",
                        featured: true
                    },
                    {
                        id: 2,
                        name: "Fitz Roy Circuit",
                        description: "A demanding trek around the dramatic Fitz Roy massif in Los Glaciares National Park.",
                        difficulty: "advanced",
                        duration: 3,
                        distance: 42,
                        elevation: 1400,
                        country: "Argentina",
                        location: "El Chaltén",
                        season: "November-March",
                        highlights: ["Laguna de los Tres", "Fitz Roy summit views"],
                        conditions: "excellent",
                        image: "fitz-roy.jpg",
                        featured: true
                    },
                    {
                        id: 3,
                        name: "Perito Moreno Glacier Walk",
                        description: "An accessible day hike offering stunning views of the famous Perito Moreno Glacier.",
                        difficulty: "beginner",
                        duration: 1,
                        distance: 6,
                        elevation: 200,
                        country: "Argentina",
                        location: "Los Glaciares National Park",
                        season: "Year-round",
                        highlights: ["Glacier viewpoints", "Ice formations"],
                        conditions: "excellent",
                        image: "perito-moreno.jpg",
                        featured: true
                    }
                ],
                recent_updates: [
                    {
                        date: "2025-08-01",
                        title: "Torres del Paine Access Update",
                        content: "The Catamaran service to Grey Glacier is now operational for the 2025 season."
                    }
                ]
            };
        }
    },

    // Fetch weather data from OpenWeatherMap API
    async fetchWeatherData() {
        const API_KEY = '5435015f3ffa65cdfbf86473b8e0f9a6'; 
        const LOCATION = 'El Calafate,AR'; // Main Patagonia location
        
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${LOCATION}&appid=${API_KEY}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`Weather API error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            return {
                location: data.name,
                temperature: data.main.temp,
                feelsLike: data.main.feels_like,
                condition: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                icon: data.weather[0].icon
            };
        } catch (error) {
            console.error('Error fetching weather data:', error);
            // Return fallback data
            return {
                location: 'El Calafate',
                temperature: 12,
                feelsLike: 10,
                condition: 'partly cloudy',
                humidity: 65,
                windSpeed: 15,
                icon: '02d'
            };
        }
    },

    // Initialize all data
    async initialize() {
        try {
            const [trailData, weatherData] = await Promise.all([
                this.fetchTrailData(),
                this.fetchWeatherData()
            ]);
            
            IndexState.trails = trailData.trails || [];
            IndexState.recentUpdates = trailData.recent_updates || [];
            IndexState.weather = weatherData;
            
            // Filter featured trails using array method
            IndexState.featuredTrails = IndexState.trails.filter(trail => trail.featured);
            
            // Load favorites from storage
            IndexState.favorites = IndexUtils.loadFromStorage('patagonia-favorites', []);
            
            console.log('Loaded trails:', IndexState.trails.length);
            console.log('Featured trails:', IndexState.featuredTrails.length);
            
            return true;
        } catch (error) {
            console.error('Failed to initialize index data:', error);
            IndexUI.showError('Failed to load data. Please refresh the page.');
            return false;
        }
    }
};

// UI management for index page
const IndexUI = {
    // Render featured trails
    renderFeaturedTrails() {
        const container = document.getElementById('featuredTrailsGrid');
        if (!container) {
            console.error('Featured trails container not found');
            return;
        }
        
        if (IndexState.featuredTrails.length === 0) {
            container.innerHTML = '<div class="no-trails">No featured trails available</div>';
            return;
        }
        
        // Use array method map and template literals
        const trailsHTML = IndexState.featuredTrails
            .slice(0, 6) // Show only first 6 featured trails
            .map(trail => IndexUtils.createFeaturedTrailCard(trail))
            .join('');
        
        container.innerHTML = trailsHTML;
        console.log('Rendered featured trails:', IndexState.featuredTrails.length);
    },

    // Render weather widget
    renderWeather() {
        const container = document.getElementById('weatherInfo');
        if (!container || !IndexState.weather) return;
        
        container.innerHTML = IndexUtils.createWeatherDisplay(IndexState.weather);
    },

    // Render recent updates
    renderRecentUpdates() {
        const container = document.getElementById('recentUpdates');
        if (!container || IndexState.recentUpdates.length === 0) return;
        
        // Show only the 3 most recent updates using array methods
        const recentHTML = IndexState.recentUpdates
            .slice(0, 3)
            .map(update => IndexUtils.createRecentUpdateItem(update))
            .join('');
        
        container.innerHTML = recentHTML;
    },

    // Render trail conditions for sidebar
    renderTrailConditions() {
        const container = document.getElementById('trailConditions');
        if (!container) return;
        
        // Get a sample of trail conditions using array methods
        const conditionSummary = IndexState.trails
            .reduce((acc, trail) => {
                acc[trail.conditions] = (acc[trail.conditions] || 0) + 1;
                return acc;
            }, {});
        
        const conditionsHTML = Object.entries(conditionSummary)
            .map(([condition, count]) => `
                <div class="condition-item">
                    <span class="condition-status ${condition}">${condition}</span>
                    <span class="condition-count">${count} trails</span>
                </div>
            `)
            .join('');
        
        container.innerHTML = conditionsHTML;
    },

    // Modal functionality - UPDATED to use actual images
    showTrailModal(trailId) {
        const trail = IndexState.trails.find(t => t.id === parseInt(trailId));
        if (!trail) return;
        
        const modal = document.getElementById('trailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalTitle || !modalBody) return;
        
        modalTitle.textContent = trail.name;
        
        modalBody.innerHTML = `
            <div class="modal-trail-details">
                <img src="images/${trail.image}" 
                     alt="${trail.name}" 
                     class="modal-trail-image" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                     loading="lazy">

                <div class="trail-details-grid">
                    <div class="detail-item">
                        <strong>Difficulty:</strong>
                        <span class="difficulty ${trail.difficulty}">
                            ${trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
                        </span>
                    </div>
                    <div class="detail-item">
                        <strong>Duration:</strong>
                        <span>${trail.duration} day${trail.duration > 1 ? 's' : ''}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Distance:</strong>
                        <span>${trail.distance} km</span>
                    </div>
                    <div class="detail-item">
                        <strong>Elevation:</strong>
                        <span>${trail.elevation} m</span>
                    </div>
                    <div class="detail-item">
                        <strong>Location:</strong>
                        <span>${trail.location}, ${trail.country}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Best Season:</strong>
                        <span>${trail.season}</span>
                    </div>
                </div>
                <div class="trail-description-full">
                    <h4>Description</h4>
                    <p>${trail.description}</p>
                </div>
                <div class="trail-highlights-full">
                    <h4>Highlights</h4>
                    <ul>
                        ${trail.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
        
        // Update favorite button
        const favoriteBtn = document.getElementById('addToFavorites');
        if (favoriteBtn) {
            const isFavorite = IndexState.favorites.includes(trail.id);
            favoriteBtn.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
            favoriteBtn.dataset.trailId = trail.id;
        }
        
        // Show modal
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    },

    hideTrailModal() {
        const modal = document.getElementById('trailModal');
        if (!modal) return;
        
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    },

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
};

// Event handlers for index page
const IndexEventHandlers = {
    // Toggle favorite
    toggleFavorite(trailId) {
        const id = parseInt(trailId);
        const index = IndexState.favorites.indexOf(id);
        
        if (index > -1) {
            IndexState.favorites = IndexState.favorites.filter(fav => fav !== id);
        } else {
            IndexState.favorites.push(id);
        }
        
        IndexUtils.saveToStorage('patagonia-favorites', IndexState.favorites);
        IndexUI.renderFeaturedTrails();
        
        // Update modal if open
        const modal = document.getElementById('trailModal');
        if (modal && modal.style.display === 'block') {
            const favoriteBtn = document.getElementById('addToFavorites');
            if (favoriteBtn && favoriteBtn.dataset.trailId === trailId) {
                const isFavorite = IndexState.favorites.includes(id);
                favoriteBtn.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
            }
        }
    },

    // Handle scroll to top
    handleScrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Navigation handler
const IndexNavigation = {
    init() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }
};

// Main index application
const IndexApp = {
    async init() {
        try {
            console.log('Initializing Index App...');
            
            // Initialize navigation
            IndexNavigation.init();
            
            // Load all data
            const success = await IndexDataManager.initialize();
            if (!success) {
                console.error('Failed to initialize data');
                return;
            }
            
            // Render all components
            IndexUI.renderFeaturedTrails();
            IndexUI.renderWeather();
            IndexUI.renderRecentUpdates();
            IndexUI.renderTrailConditions();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up scroll functionality
            this.setupScrollToTop();
            
            // Update footer
            this.updateFooter();
            
            console.log('Index page initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize index page:', error);
        }
    },

    setupEventListeners() {
        // Featured trails container event delegation
        const featuredContainer = document.getElementById('featuredTrailsGrid');
        if (featuredContainer) {
            featuredContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('view-details')) {
                    const trailId = e.target.dataset.trailId;
                    IndexUI.showTrailModal(trailId);
                }
                
                if (e.target.classList.contains('favorite-btn')) {
                    const trailId = e.target.dataset.trailId;
                    IndexEventHandlers.toggleFavorite(trailId);
                }
            });
        }

        // Modal event listeners
        const modalClose = document.getElementById('modalClose');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const addToFavoritesBtn = document.getElementById('addToFavorites');
        const modal = document.getElementById('trailModal');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => IndexUI.hideTrailModal());
        }
        
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => IndexUI.hideTrailModal());
        }
        
        if (addToFavoritesBtn) {
            addToFavoritesBtn.addEventListener('click', (e) => {
                const trailId = e.target.dataset.trailId;
                IndexEventHandlers.toggleFavorite(trailId);
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    IndexUI.hideTrailModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                IndexUI.hideTrailModal();
            }
        });
        
        // Newsletter form handling
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                // Form will submit naturally to form-confirmation.html
                console.log('Newsletter form submitted');
            });
        }
    },

    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            });
            
            scrollToTopBtn.addEventListener('click', () => IndexEventHandlers.handleScrollToTop());
        }
    },

    updateFooter() {
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
        
        const lastModifiedElement = document.getElementById('lastModified');
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last modified: ${document.lastModified}`;
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    IndexApp.init();
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IndexApp, IndexDataManager, IndexEventHandlers, IndexUI };
}