// Complete Trail Management Script - script.js (FIXED VERSION)

// ===== TRAIL DATA FETCHER =====
class TrailDataFetcher {
    constructor() {
        this.trails = [];
        this.dataLoaded = false;
    }

    /**
     * Fetches trail data from trails.json
     * @returns {Promise<Array>} Array of trail objects
     */
    async fetchTrailData() {
        try {
            const response = await fetch('./data/trails.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.trails = data.trails;
            this.dataLoaded = true;
            
            console.log(`Successfully loaded ${this.trails.length} trails`);
            return this.trails;
            
        } catch (error) {
            console.error('Error fetching trail data:', error);
            this.showErrorMessage('Failed to load trail data. Please refresh the page.');
            throw error;
        }
    }

    /**
     * Displays trails in the container using template literals
     * @param {Array} trails - Array of trail objects to display
     * @param {string} containerId - ID of the container element
     */
    displayTrails(trails = this.trails, containerId = 'trailsContainer') {
        const container = document.getElementById(containerId);
        
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        if (!trails || trails.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No trails found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            `;
            return;
        }

        // Update results count
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            resultsCount.textContent = `Showing ${trails.length} trail${trails.length === 1 ? '' : 's'}`;
        }

        // Generate trail cards using template literals
        container.innerHTML = trails.map(trail => this.createTrailCard(trail)).join('');
        
        // Attach event listeners to the new cards
        this.attachTrailCardEvents(container);
        
        // Initialize lazy loading for images
        this.initializeLazyLoading();
    }

    /**
     * Creates a trail card HTML using template literals
     * @param {Object} trail - Trail object
     * @returns {string} HTML string for the trail card
     */
    createTrailCard(trail) {
        const isFavorite = favoritesManager.isFavorite(trail.id);
        const favoriteClass = isFavorite ? 'favorite-active' : '';
        const favoriteText = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';

        return `
            <div class="trail-card" data-trail-id="${trail.id}">
                <div class="trail-card-image">
                    <img src="images/placeholder.jpg" 
                         data-src="images/${trail.image || 'default-trail.jpg'}" 
                         alt="${trail.name}" 
                         class="lazy-load trail-image"
                         loading="lazy">
                    <div class="favorite-indicator ${favoriteClass}" 
                         data-trail-id="${trail.id}" 
                         title="${favoriteText}">
                        ❤️
                    </div>
                    <div class="trail-difficulty-badge difficulty ${trail.difficulty}">
                        ${trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
                    </div>
                </div>
                <div class="trail-card-content">
                    <h3 class="trail-card-title">${trail.name}</h3>
                    <p class="trail-card-location">
                        📍 ${trail.location}, ${trail.country}
                    </p>
                    <p class="trail-card-description">
                        ${trail.description.length > 120 ? 
                          trail.description.substring(0, 120) + '...' : 
                          trail.description}
                    </p>
                    <div class="trail-card-stats">
                        <div class="stat">
                            <span class="stat-icon">🕒</span>
                            <span class="stat-text">${trail.duration} day${trail.duration > 1 ? 's' : ''}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">📏</span>
                            <span class="stat-text">${trail.distance} km</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">⛰️</span>
                            <span class="stat-text">${trail.elevation} m</span>
                        </div>
                        <div class="stat">
                            <span class="stat-icon">🗓️</span>
                            <span class="stat-text">${trail.season}</span>
                        </div>
                    </div>
                    <div class="trail-card-actions">
                        <button class="btn btn-primary btn-sm view-details" 
                                data-trail-id="${trail.id}"
                                aria-label="View details for ${trail.name}">
                            View Details
                        </button>
                        <button class="btn btn-secondary btn-sm toggle-favorite ${favoriteClass}" 
                                data-trail-id="${trail.id}"
                                aria-label="${favoriteText} for ${trail.name}">
                            ${favoriteText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Attaches event listeners to trail cards
     * @param {HTMLElement} container - Container element with trail cards
     */
    attachTrailCardEvents(container) {
        // View details buttons
        container.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const trailId = parseInt(btn.dataset.trailId);
                const trail = this.getTrailById(trailId);
                if (trail) {
                    trailModal.openModal(trail);
                }
            });
        });

        // Toggle favorite buttons
        container.querySelectorAll('.toggle-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const trailId = parseInt(btn.dataset.trailId);
                favoritesManager.toggleFavorite(trailId);
                // Refresh display to update favorite indicators
                trailFilters.applyFiltersAndSort();
            });
        });

        // Favorite indicators
        container.querySelectorAll('.favorite-indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                e.stopPropagation();
                const trailId = parseInt(indicator.dataset.trailId);
                favoritesManager.toggleFavorite(trailId);
                trailFilters.applyFiltersAndSort();
            });
        });

        // Trail card clicks (open modal)
        container.querySelectorAll('.trail-card').forEach(card => {
            card.addEventListener('click', () => {
                const trailId = parseInt(card.dataset.trailId);
                const trail = this.getTrailById(trailId);
                if (trail) {
                    trailModal.openModal(trail);
                }
            });
        });
    }

    /**
     * Gets a trail by its ID
     * @param {number} trailId - Trail ID
     * @returns {Object|null} Trail object or null if not found
     */
    getTrailById(trailId) {
        return this.trails.find(trail => trail.id === trailId) || null;
    }

    /**
     * Initialize lazy loading for trail images
     */
    initializeLazyLoading() {
        const lazyImages = document.querySelectorAll('.lazy-load');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }

    /**
     * Shows error message to user
     * @param {string} message - Error message to display
     */
    showErrorMessage(message) {
        const container = document.getElementById('trailsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Error Loading Trails</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// ===== TRAIL FILTERS AND SORTING =====
class TrailFilters {
    constructor(trailDataFetcher) {
        this.trailDataFetcher = trailDataFetcher;
        this.currentFilters = {
            difficulty: '',
            country: '',
            duration: '',
            search: ''
        };
        this.currentSort = 'name';
        this.showFavoritesOnly = false;
    }

    /**
     * Initialize filter and sort functionality
     */
    init() {
        this.setupFilterEventListeners();
        this.setupSortEventListeners();
        this.setupSearchEventListeners();
        this.setupFavoritesFilter();
        this.setupClearFilters();
        console.log('Trail filters initialized');
    }

    /**
     * Setup event listeners for filter dropdowns
     */
    setupFilterEventListeners() {
        const difficultyFilter = document.getElementById('difficultyFilter');
        const countryFilter = document.getElementById('countryFilter');
        const durationFilter = document.getElementById('durationFilter');

        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', (e) => {
                this.currentFilters.difficulty = e.target.value;
                this.applyFiltersAndSort();
            });
        }

        if (countryFilter) {
            countryFilter.addEventListener('change', (e) => {
                this.currentFilters.country = e.target.value;
                this.applyFiltersAndSort();
            });
        }

        if (durationFilter) {
            durationFilter.addEventListener('change', (e) => {
                this.currentFilters.duration = e.target.value;
                this.applyFiltersAndSort();
            });
        }
    }

    /**
     * Setup event listeners for search functionality
     */
    setupSearchEventListeners() {
        const searchInput = document.getElementById('trailSearch');
        const searchBtn = document.getElementById('searchBtn');

        if (searchInput) {
            // Debounce search input to avoid excessive filtering
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.currentFilters.search = e.target.value.toLowerCase().trim();
                    this.applyFiltersAndSort();
                }, 300);
            });

            // Handle Enter key
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentFilters.search = e.target.value.toLowerCase().trim();
                    this.applyFiltersAndSort();
                }
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                if (searchInput) {
                    this.currentFilters.search = searchInput.value.toLowerCase().trim();
                    this.applyFiltersAndSort();
                }
            });
        }
    }

    /**
     * Setup event listeners for sorting
     */
    setupSortEventListeners() {
        const sortSelect = document.getElementById('sortTrails');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFiltersAndSort();
            });
        }
    }

    /**
     * Setup favorites filter button
     */
    setupFavoritesFilter() {
        const showFavoritesBtn = document.getElementById('showFavorites');
        
        if (showFavoritesBtn) {
            showFavoritesBtn.addEventListener('click', () => {
                this.showFavoritesOnly = !this.showFavoritesOnly;
                showFavoritesBtn.textContent = this.showFavoritesOnly ? 
                    'Show All Trails' : 'Show Favorites Only';
                showFavoritesBtn.classList.toggle('active', this.showFavoritesOnly);
                this.applyFiltersAndSort();
            });
        }
    }

    /**
     * Setup clear filters button
     */
    setupClearFilters() {
        const clearFiltersBtn = document.getElementById('clearFilters');
        
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }

    /**
     * Apply all filters to the trails array
     * @param {Array} trails - Array of trail objects
     * @returns {Array} Filtered array of trails
     */
    filterTrails(trails) {
        return trails.filter(trail => {
            // Check favorites filter first
            if (this.showFavoritesOnly) {
                if (!favoritesManager.isFavorite(trail.id)) {
                    return false;
                }
            }

            // Difficulty filter
            if (this.currentFilters.difficulty && trail.difficulty !== this.currentFilters.difficulty) {
                return false;
            }

            // Country filter
            if (this.currentFilters.country && trail.country !== this.currentFilters.country) {
                return false;
            }

            // Duration filter
            if (this.currentFilters.duration && !this.matchesDurationFilter(trail.duration, this.currentFilters.duration)) {
                return false;
            }

            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search;
                const searchableText = `${trail.name} ${trail.description} ${trail.location} ${trail.country}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Check if trail duration matches the filter
     * @param {number} duration - Trail duration in days
     * @param {string} filter - Duration filter value
     * @returns {boolean} True if matches
     */
    matchesDurationFilter(duration, filter) {
        switch (filter) {
            case '1': return duration === 1;
            case '2-3': return duration >= 2 && duration <= 3;
            case '4-7': return duration >= 4 && duration <= 7;
            case '7+': return duration > 7;
            default: return true;
        }
    }

    /**
     * Sort trails array based on criteria
     * @param {Array} trails - Array of trail objects
     * @returns {Array} Sorted array of trails
     */
    sortTrails(trails) {
        const sortedTrails = [...trails];
        
        switch (this.currentSort) {
            case 'name':
                return sortedTrails.sort((a, b) => a.name.localeCompare(b.name));
            
            case 'difficulty':
                const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                return sortedTrails.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
            
            case 'duration':
                return sortedTrails.sort((a, b) => a.duration - b.duration);
            
            case 'distance':
                return sortedTrails.sort((a, b) => a.distance - b.distance);
            
            default:
                return sortedTrails;
        }
    }

    /**
     * Apply filters and sorting, then display results
     */
    applyFiltersAndSort() {
        if (!this.trailDataFetcher.dataLoaded) {
            console.warn('Trail data not loaded yet');
            return;
        }

        let trails = [...this.trailDataFetcher.trails];
        
        // Apply filters using filter method
        trails = this.filterTrails(trails);
        
        // Apply sorting using sort method
        trails = this.sortTrails(trails);
        
        // Display filtered and sorted trails
        this.trailDataFetcher.displayTrails(trails);
    }

    /**
     * Clear all filters and reset to default view
     */
    clearAllFilters() {
        // Reset filter values
        this.currentFilters = {
            difficulty: '',
            country: '',
            duration: '',
            search: ''
        };
        this.showFavoritesOnly = false;

        // Reset form elements
        const difficultyFilter = document.getElementById('difficultyFilter');
        const countryFilter = document.getElementById('countryFilter');
        const durationFilter = document.getElementById('durationFilter');
        const searchInput = document.getElementById('trailSearch');
        const showFavoritesBtn = document.getElementById('showFavorites');

        if (difficultyFilter) difficultyFilter.value = '';
        if (countryFilter) countryFilter.value = '';
        if (durationFilter) durationFilter.value = '';
        if (searchInput) searchInput.value = '';
        if (showFavoritesBtn) {
            showFavoritesBtn.textContent = 'Show Favorites Only';
            showFavoritesBtn.classList.remove('active');
        }

        // Apply cleared filters
        this.applyFiltersAndSort();
    }
}

// ===== TRAIL MODAL =====
class TrailModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
    }

    /**
     * Initialize modal functionality
     */
    init() {
        this.modal = document.getElementById('trailModal');
        if (this.modal) {
            this.setupEventListeners();
            console.log('Trail modal initialized');
        }
    }

    /**
     * Open modal with trail data
     * @param {Object} trailData - Trail object to display
     */
    openModal(trailData) {
        if (!this.modal || !trailData) return;

        this.populateModal(trailData);
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        this.isOpen = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus trap
        this.trapFocus();
        
        // Focus first focusable element
        const firstFocusable = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) firstFocusable.focus();
    }

    /**
     * Close modal
     */
    closeModal() {
        if (!this.modal) return;

        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Populate modal with trail data using template literals
     * @param {Object} trail - Trail object
     */
    populateModal(trail) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const addToFavoritesBtn = document.getElementById('addToFavorites');

        if (modalTitle) {
            modalTitle.textContent = trail.name;
        }

        if (modalBody) {
            modalBody.innerHTML = `
                <div class="modal-trail-content">
                    <div class="modal-trail-image">
                        <img src="images/${trail.image || 'default-trail.jpg'}" 
                             alt="${trail.name}" 
                             class="trail-modal-img">
                        <div class="modal-difficulty-badge difficulty ${trail.difficulty}">
                            ${trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}
                        </div>
                    </div>
                    
                    <div class="modal-trail-info">
                        <div class="trail-location">
                            <h4>📍 Location</h4>
                            <p>${trail.location}, ${trail.country}</p>
                        </div>
                        
                        <div class="trail-description">
                            <h4>📝 Description</h4>
                            <p>${trail.description}</p>
                        </div>
                        
                        <div class="trail-stats-detailed">
                            <h4>📊 Trail Statistics</h4>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <span class="stat-icon">🕒</span>
                                    <div class="stat-content">
                                        <strong>Duration</strong>
                                        <span>${trail.duration} day${trail.duration > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">📏</span>
                                    <div class="stat-content">
                                        <strong>Distance</strong>
                                        <span>${trail.distance} km</span>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">⛰️</span>
                                    <div class="stat-content">
                                        <strong>Elevation Gain</strong>
                                        <span>${trail.elevation} m</span>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">🗓️</span>
                                    <div class="stat-content">
                                        <strong>Best Season</strong>
                                        <span>${trail.season}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ${trail.highlights && trail.highlights.length > 0 ? `
                            <div class="trail-highlights">
                                <h4>⭐ Highlights</h4>
                                <ul class="highlights-list">
                                    ${trail.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        <div class="trail-conditions">
                            <h4>🔍 Current Conditions</h4>
                            <span class="condition-status ${trail.conditions || 'good'}">
                                ${(trail.conditions || 'good').charAt(0).toUpperCase() + (trail.conditions || 'good').slice(1)}
                            </span>
                        </div>
                        
                        ${trail.coordinates ? `
                            <div class="trail-coordinates">
                                <h4>🗺️ Coordinates</h4>
                                <p>Lat: ${trail.coordinates.lat}, Lng: ${trail.coordinates.lng}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        // Update favorites button
        if (addToFavoritesBtn) {
            const isFavorite = favoritesManager.isFavorite(trail.id);
            addToFavoritesBtn.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
            addToFavoritesBtn.className = `btn ${isFavorite ? 'btn-secondary' : 'btn-primary'}`;
            addToFavoritesBtn.dataset.trailId = trail.id;
            
            // Remove existing event listener and add new one
            const newBtn = addToFavoritesBtn.cloneNode(true);
            addToFavoritesBtn.parentNode.replaceChild(newBtn, addToFavoritesBtn);
            
            newBtn.addEventListener('click', () => {
                favoritesManager.toggleFavorite(trail.id);
                // Update button text and style
                const isNowFavorite = favoritesManager.isFavorite(trail.id);
                newBtn.textContent = isNowFavorite ? 'Remove from Favorites' : 'Add to Favorites';
                newBtn.className = `btn ${isNowFavorite ? 'btn-secondary' : 'btn-primary'}`;
                
                // Refresh trail display to update favorite indicators
                trailFilters.applyFiltersAndSort();
            });
        }
    }

    /**
     * Setup modal event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('modalClose');
        const closeBtnBottom = document.getElementById('modalCloseBtn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (closeBtnBottom) {
            closeBtnBottom.addEventListener('click', () => this.closeModal());
        }

        // Click outside modal to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });
    }

    /**
     * Trap focus within modal for accessibility
     */
    trapFocus() {
        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        this.modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }
}

// ===== FAVORITES MANAGER (FIXED VERSION) =====
class FavoritesManager {
    constructor() {
        // Use in-memory storage instead of localStorage
        this.favorites = [];
        this.storageKey = 'patagonia-trail-favorites';
    }

    /**
     * Load favorites from memory (no localStorage)
     * @returns {Array} Array of favorite trail IDs
     */
    loadFavorites() {
        // Return empty array since we're using in-memory storage
        return [];
    }

    /**
     * Save favorites (in-memory only)
     */
    saveFavorites() {
        // No-op for in-memory storage
        console.log('Favorites saved to memory:', this.favorites);
    }

    /**
     * Add trail to favorites
     * @param {number} trailId - Trail ID to add
     */
    addToFavorites(trailId) {
        if (!this.isFavorite(trailId)) {
            this.favorites.push(trailId);
            this.saveFavorites();
            this.showNotification(`Trail added to favorites!`, 'success');
        }
    }

    /**
     * Remove trail from favorites
     * @param {number} trailId - Trail ID to remove
     */
    removeFromFavorites(trailId) {
        const index = this.favorites.indexOf(trailId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
            this.showNotification(`Trail removed from favorites!`, 'info');
        }
    }

    /**
     * Toggle trail favorite status
     * @param {number} trailId - Trail ID to toggle
     */
    toggleFavorite(trailId) {
        if (this.isFavorite(trailId)) {
            this.removeFromFavorites(trailId);
        } else {
            this.addToFavorites(trailId);
        }
    }

    /**
     * Check if trail is in favorites
     * @param {number} trailId - Trail ID to check
     * @returns {boolean} True if trail is favorite
     */
    isFavorite(trailId) {
        return this.favorites.includes(trailId);
    }

    /**
     * Get all favorite trails
     * @returns {Array} Array of favorite trail IDs
     */
    getFavorites() {
        return [...this.favorites];
    }

    /**
     * Get count of favorite trails
     * @returns {number} Number of favorite trails
     */
    getFavoriteCount() {
        return this.favorites.length;
    }

    /**
     * Clear all favorites
     */
    clearAllFavorites() {
        this.favorites = [];
        this.saveFavorites();
        this.showNotification('All favorites cleared!', 'info');
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 9999;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// ===== ADDITIONAL UTILITIES =====
class UtilityFunctions {
    /**
     * Setup scroll to top button
     */
    static setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (!scrollToTopBtn) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        // Scroll to top when clicked
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    /**
     * Setup mobile navigation
     */
    static setupMobileNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');

        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on a nav link
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    /**
     * Setup view toggle (grid/list view)
     */
    static setupViewToggle() {
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        const trailsContainer = document.getElementById('trailsContainer');

        if (gridViewBtn && listViewBtn && trailsContainer) {
            gridViewBtn.addEventListener('click', () => {
                trailsContainer.classList.remove('list-view');
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
            });

            listViewBtn.addEventListener('click', () => {
                trailsContainer.classList.add('list-view');
                listViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
            });
        }
    }

    /**
     * Update footer with current year and last modified date
     */
    static updateFooter() {
        const currentYearElement = document.getElementById('currentYear');
        const lastModifiedElement = document.getElementById('lastModified');

        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }

        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last updated: ${document.lastModified}`;
        }
    }

    /**
     * Format date for display
     * @param {string} dateString - Date string to format
     * @returns {string} Formatted date
     */
    static formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
}

// ===== MAIN APPLICATION INITIALIZATION =====
class TrailApp {
    constructor() {
        this.dataFetcher = null;
        this.filters = null;
        this.modal = null;
        this.favorites = null;
    }

    /**
     * Initialize the entire application
     */
    async init() {
        try {
            console.log('Initializing Trail App...');

            // Initialize core components
            this.dataFetcher = new TrailDataFetcher();
            this.favorites = new FavoritesManager();
            this.modal = new TrailModal();
            this.filters = new TrailFilters(this.dataFetcher);

            // Make instances globally available
            window.trailDataFetcher = this.dataFetcher;
            window.favoritesManager = this.favorites;
            window.trailModal = this.modal;
            window.trailFilters = this.filters;

            // Initialize components
            this.modal.init();
            this.filters.init();

            // Load trail data and display
            await this.dataFetcher.fetchTrailData();
            this.dataFetcher.displayTrails();

            // Setup utility functions
            UtilityFunctions.setupScrollToTop();
            UtilityFunctions.setupMobileNavigation();
            UtilityFunctions.setupViewToggle();
            UtilityFunctions.updateFooter();

            // Add CSS animations
            this.addAnimationStyles();

            console.log('Trail App initialized successfully!');

        } catch (error) {
            console.error('Error initializing Trail App:', error);
            this.showInitializationError();
        }
    }

    /**
     * Add CSS animation styles dynamically
     */
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            .trail-card {
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .trail-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            }

            .favorite-indicator {
                transition: all 0.3s ease;
                opacity: 0.7;
            }

            .favorite-indicator:hover,
            .favorite-indicator.favorite-active {
                opacity: 1;
                transform: scale(1.1);
            }

            .error-message {
                text-align: center;
                padding: 2rem;
                background: var(--light-gray);
                border-radius: 12px;
                margin: 2rem 0;
            }

            .no-results {
                text-align: center;
                padding: 3rem;
                color: var(--glacier-blue);
            }

            .modal-trail-content {
                display: grid;
                gap: 2rem;
            }

            .modal-trail-image img {
                width: 100%;
                height: 300px;
                object-fit: cover;
                border-radius: 8px;
            }

            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }

            .stat-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem;
                background: var(--light-gray);
                border-radius: 6px;
            }

            .stat-content {
                display: flex;
                flex-direction: column;
            }

            .stat-content strong {
                font-size: 0.9rem;
                color: var(--patagonian-navy);
            }

            .highlights-list {
                list-style: none;
                padding: 0;
            }

            .highlights-list li {
                padding: 0.5rem 0;
                border-bottom: 1px solid var(--medium-gray);
            }

            .highlights-list li:before {
                content: "⭐ ";
                margin-right: 0.5rem;
            }

            .list-view .trail-card {
                display: grid;
                grid-template-columns: 300px 1fr;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .list-view .trail-card-image {
                height: 200px;
            }

            @media (max-width: 768px) {
                .list-view .trail-card {
                    grid-template-columns: 1fr;
                }
                
                .stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Show initialization error
     */
    showInitializationError() {
        const container = document.getElementById('trailsContainer');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>⚠️ Application Error</h3>
                    <p>Failed to initialize the trail application. Please check your internet connection and try refreshing the page.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }
}

// ===== GLOBAL VARIABLES =====
let trailDataFetcher;
let trailFilters;
let trailModal;
let favoritesManager;

// ===== INITIALIZE APPLICATION =====
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize on trails page
    if (window.location.pathname.includes('trails.html') || document.getElementById('trailsContainer')) {
        const app = new TrailApp();
        await app.init();
    } else {
        // Initialize basic utilities for other pages
        UtilityFunctions.setupScrollToTop();
        UtilityFunctions.setupMobileNavigation();
        UtilityFunctions.updateFooter();
    }
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TrailDataFetcher,
        TrailFilters,
        TrailModal,
        FavoritesManager,
        UtilityFunctions,
        TrailApp
    };
}