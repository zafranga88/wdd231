// trails.js - Complete JavaScript implementation for Patagonia Trail Explorers

// ES Modules structure with all required functionality

// State management
const AppState = {
    trails: [],
    filteredTrails: [],
    favorites: [],
    currentView: 'grid',
    currentPage: 1,
    itemsPerPage: 9,
    filters: {
        search: '',
        difficulty: '',
        country: '',
        duration: '',
        sort: 'name'
    }
};

// Utility functions
const Utils = {
    // Template literal for creating HTML strings
    createTrailCard: (trail, viewType = 'grid') => {
        const isFavorite = AppState.favorites.includes(trail.id);
        const favoriteClass = isFavorite ? 'favorite' : '';
        const favoriteIcon = isFavorite ? '❤️' : '🤍';
        
        if (viewType === 'list') {
            return `
                <div class="trail-card list-view" data-trail-id="${trail.id}">
                    <img src="images/${trail.image}" alt="${trail.name}" class="trail-image" loading="lazy">
                    <div class="trail-info">
                        <div class="trail-header">
                            <h3 class="trail-name">${trail.name}</h3>
                            <button class="favorite-btn ${favoriteClass}" data-trail-id="${trail.id}" aria-label="Toggle favorite">
                                ${favoriteIcon}
                            </button>
                        </div>
                        <div class="trail-meta">
                            <span class="difficulty ${trail.difficulty}">${trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}</span>
                            <span class="duration">${trail.duration} day${trail.duration > 1 ? 's' : ''}</span>
                            <span class="distance">${trail.distance} km</span>
                            <span class="location">${trail.location}, ${trail.country}</span>
                        </div>
                        <p class="trail-description">${trail.description.substring(0, 150)}...</p>
                        <div class="trail-highlights">
                            ${trail.highlights.slice(0, 3).map(highlight => `<span class="highlight-tag">${highlight}</span>`).join('')}
                        </div>
                        <button class="btn btn-primary view-details" data-trail-id="${trail.id}">View Details</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="trail-card grid-view" data-trail-id="${trail.id}">
                <div class="trail-image-container">
                    <img src="images/${trail.image}" alt="${trail.name}" class="trail-image" loading="lazy">
                    <button class="favorite-btn ${favoriteClass}" data-trail-id="${trail.id}" aria-label="Toggle favorite">
                        ${favoriteIcon}
                    </button>
                    <div class="trail-status ${trail.conditions}">
                        ${trail.conditions}
                    </div>
                </div>
                <div class="trail-info">
                    <h3 class="trail-name">${trail.name}</h3>
                    <div class="trail-meta">
                        <span class="difficulty ${trail.difficulty}">${trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}</span>
                        <span class="duration">${trail.duration} day${trail.duration > 1 ? 's' : ''}</span>
                        <span class="distance">${trail.distance} km</span>
                    </div>
                    <p class="trail-location">${trail.location}, ${trail.country}</p>
                    <p class="trail-description">${trail.description.substring(0, 100)}...</p>
                    <button class="btn btn-primary view-details" data-trail-id="${trail.id}">View Details</button>
                </div>
            </div>
        `;
    },

    // Array method: filter trails based on current filters
    filterTrails: (trails) => {
        return trails.filter(trail => {
            const matchesSearch = !AppState.filters.search || 
                trail.name.toLowerCase().includes(AppState.filters.search.toLowerCase()) ||
                trail.description.toLowerCase().includes(AppState.filters.search.toLowerCase()) ||
                trail.location.toLowerCase().includes(AppState.filters.search.toLowerCase());
            
            const matchesDifficulty = !AppState.filters.difficulty || 
                trail.difficulty === AppState.filters.difficulty;
            
            const matchesCountry = !AppState.filters.country || 
                trail.country === AppState.filters.country;
            
            const matchesDuration = !AppState.filters.duration || 
                Utils.matchesDurationFilter(trail.duration, AppState.filters.duration);
            
            return matchesSearch && matchesDifficulty && matchesCountry && matchesDuration;
        });
    },

    // Array method: sort trails
    sortTrails: (trails, sortBy) => {
        return [...trails].sort((a, b) => {
            switch (sortBy) {
                case 'difficulty':
                    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                case 'duration':
                    return a.duration - b.duration;
                case 'distance':
                    return a.distance - b.distance;
                case 'name':
                default:
                    return a.name.localeCompare(b.name);
            }
        });
    },

    matchesDurationFilter: (duration, filter) => {
        switch (filter) {
            case '1':
                return duration === 1;
            case '2-3':
                return duration >= 2 && duration <= 3;
            case '4-7':
                return duration >= 4 && duration <= 7;
            case '7+':
                return duration > 7;
            default:
                return true;
        }
    },

    // Local storage utilities
    saveToStorage: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            // Silent failure for storage issues
        }
    },

    loadFromStorage: (key, defaultValue = []) => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            return defaultValue;
        }
    }
};

// Data management module
const DataManager = {
    // Fetch API implementation with error handling
    async fetchTrailData() {
        try {
            const response = await fetch('data/trails.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Initialize data with error handling
    async initialize() {
        try {
            const data = await this.fetchTrailData();
            AppState.trails = data.trails || [];
            AppState.filteredTrails = [...AppState.trails];
            
            // Load favorites from localStorage
            AppState.favorites = Utils.loadFromStorage('patagonia-favorites', []);
            
            // Load user preferences
            const savedView = Utils.loadFromStorage('patagonia-view', 'grid');
            AppState.currentView = savedView;
            
            return data;
        } catch (error) {
            // Show error message to user
            UI.showError('Failed to load trail data. Please refresh the page.');
            throw error;
        }
    }
};

// UI Management module
const UI = {
    // DOM element selectors
    elements: {
        trailsContainer: null,
        resultsCount: null,
        searchInput: null,
        filters: {},
        modal: null,
        modalBody: null,
        modalTitle: null,
        pagination: null,
        viewButtons: {},
        scrollToTop: null
    },

    // Initialize DOM elements
    initializeElements() {
        this.elements.trailsContainer = document.getElementById('trailsContainer');
        this.elements.resultsCount = document.getElementById('resultsCount');
        this.elements.searchInput = document.getElementById('trailSearch');
        this.elements.modal = document.getElementById('trailModal');
        this.elements.modalBody = document.getElementById('modalBody');
        this.elements.modalTitle = document.getElementById('modalTitle');
        this.elements.pagination = document.getElementById('pagination');
        this.elements.scrollToTop = document.getElementById('scrollToTop');
        
        // Filter elements
        this.elements.filters = {
            difficulty: document.getElementById('difficultyFilter'),
            country: document.getElementById('countryFilter'),
            duration: document.getElementById('durationFilter'),
            sort: document.getElementById('sortTrails')
        };
        
        // View buttons
        this.elements.viewButtons = {
            grid: document.getElementById('gridView'),
            list: document.getElementById('listView')
        };
    },

    // Render trails with pagination
    renderTrails() {
        if (!this.elements.trailsContainer) return;
        
        const startIndex = (AppState.currentPage - 1) * AppState.itemsPerPage;
        const endIndex = startIndex + AppState.itemsPerPage;
        const trailsToShow = AppState.filteredTrails.slice(startIndex, endIndex);
        
        // Update view classes
        this.elements.trailsContainer.className = `trails-container ${AppState.currentView}-layout`;
        
        if (trailsToShow.length === 0) {
            this.elements.trailsContainer.innerHTML = `
                <div class="no-results">
                    <h3>No trails found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }
        
        // Use template literals to create HTML
        this.elements.trailsContainer.innerHTML = trailsToShow
            .map(trail => Utils.createTrailCard(trail, AppState.currentView))
            .join('');
        
        this.updateResultsCount();
        this.renderPagination();
        this.updateViewButtons();
    },

    updateResultsCount() {
        if (!this.elements.resultsCount) return;
        
        const total = AppState.filteredTrails.length;
        const start = (AppState.currentPage - 1) * AppState.itemsPerPage + 1;
        const end = Math.min(start + AppState.itemsPerPage - 1, total);
        
        if (total === 0) {
            this.elements.resultsCount.textContent = 'No trails found';
        } else {
            this.elements.resultsCount.textContent = `Showing ${start}-${end} of ${total} trails`;
        }
    },

    renderPagination() {
        if (!this.elements.pagination) return;
        
        const totalPages = Math.ceil(AppState.filteredTrails.length / AppState.itemsPerPage);
        
        if (totalPages <= 1) {
            this.elements.pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        if (AppState.currentPage > 1) {
            paginationHTML += `<button class="page-btn" data-page="${AppState.currentPage - 1}">Previous</button>`;
        }
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === AppState.currentPage ? 'active' : '';
            paginationHTML += `<button class="page-btn ${activeClass}" data-page="${i}">${i}</button>`;
        }
        
        // Next button
        if (AppState.currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" data-page="${AppState.currentPage + 1}">Next</button>`;
        }
        
        this.elements.pagination.innerHTML = paginationHTML;
    },

    updateViewButtons() {
        Object.keys(this.elements.viewButtons).forEach(view => {
            const button = this.elements.viewButtons[view];
            if (button) {
                button.classList.toggle('active', AppState.currentView === view);
            }
        });
    },

    // Modal functionality
    showTrailModal(trailId) {
        const trail = AppState.trails.find(t => t.id === parseInt(trailId));
        if (!trail || !this.elements.modal) return;
        
        this.elements.modalTitle.textContent = trail.name;
        
        // Create detailed modal content using template literals
        this.elements.modalBody.innerHTML = `
            <div class="modal-trail-details">
                <img src="images/${trail.image}" alt="${trail.name}" class="modal-trail-image" loading="lazy">
                <div class="trail-details-grid">
                    <div class="detail-item">
                        <strong>Difficulty:</strong>
                        <span class="difficulty ${trail.difficulty}">${trail.difficulty.charAt(0).toUpperCase() + trail.difficulty.slice(1)}</span>
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
                    <div class="detail-item">
                        <strong>Conditions:</strong>
                        <span class="trail-status ${trail.conditions}">${trail.conditions}</span>
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
        const isFavorite = AppState.favorites.includes(trail.id);
        favoriteBtn.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
        favoriteBtn.dataset.trailId = trail.id;
        
        // Show modal
        this.elements.modal.style.display = 'block';
        this.elements.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        this.elements.modal.focus();
    },

    hideTrailModal() {
        if (!this.elements.modal) return;
        
        this.elements.modal.style.display = 'none';
        this.elements.modal.setAttribute('aria-hidden', 'true');
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
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }
};

// Event handlers module
const EventHandlers = {
    // Search functionality
    handleSearch() {
        const searchTerm = UI.elements.searchInput.value.trim();
        AppState.filters.search = searchTerm;
        this.applyFilters();
    },

    // Filter handling
    handleFilterChange(filterType, value) {
        AppState.filters[filterType] = value;
        this.applyFilters();
    },

    // Apply all filters and re-render
    applyFilters() {
        let filtered = Utils.filterTrails(AppState.trails);
        filtered = Utils.sortTrails(filtered, AppState.filters.sort);
        
        AppState.filteredTrails = filtered;
        AppState.currentPage = 1; // Reset to first page
        UI.renderTrails();
    },

    // Clear all filters
    clearFilters() {
        AppState.filters = {
            search: '',
            difficulty: '',
            country: '',
            duration: '',
            sort: 'name'
        };
        
        // Reset form elements
        if (UI.elements.searchInput) UI.elements.searchInput.value = '';
        Object.values(UI.elements.filters).forEach(filter => {
            if (filter && filter.tagName === 'SELECT') {
                filter.selectedIndex = 0;
            }
        });
        
        this.applyFilters();
    },

    // Favorites functionality
    toggleFavorite(trailId) {
        const id = parseInt(trailId);
        const index = AppState.favorites.indexOf(id);
        
        if (index > -1) {
            // Remove from favorites using array method
            AppState.favorites = AppState.favorites.filter(fav => fav !== id);
        } else {
            // Add to favorites
            AppState.favorites.push(id);
        }
        
        // Save to localStorage
        Utils.saveToStorage('patagonia-favorites', AppState.favorites);
        
        // Re-render to update UI
        UI.renderTrails();
        
        // Update modal if open
        const modal = document.getElementById('trailModal');
        if (modal && modal.style.display === 'block') {
            const favoriteBtn = document.getElementById('addToFavorites');
            if (favoriteBtn && favoriteBtn.dataset.trailId === trailId) {
                const isFavorite = AppState.favorites.includes(id);
                favoriteBtn.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
            }
        }
    },

    // Show only favorites
    showFavoritesOnly() {
        if (AppState.favorites.length === 0) {
            alert('You have no favorite trails yet. Click the heart icon on trails to add them to favorites.');
            return;
        }
        
        // Filter to show only favorites using array method
        AppState.filteredTrails = AppState.trails.filter(trail => 
            AppState.favorites.includes(trail.id)
        );
        AppState.currentPage = 1;
        UI.renderTrails();
    },

    // View toggle
    toggleView(viewType) {
        AppState.currentView = viewType;
        Utils.saveToStorage('patagonia-view', viewType);
        UI.renderTrails();
    },

    // Pagination
    goToPage(page) {
        AppState.currentPage = parseInt(page);
        UI.renderTrails();
        
        // Scroll to top of results
        const trailsSection = document.querySelector('.trails-main');
        if (trailsSection) {
            trailsSection.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // Scroll to top functionality
    handleScrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Navigation module (for hamburger menu)
const Navigation = {
    init() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
            
            // Close menu when clicking on links
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

// Main application initialization
const App = {
    async init() {
        try {
            // Initialize UI elements
            UI.initializeElements();
            
            // Initialize navigation
            Navigation.init();
            
            // Load data
            await DataManager.initialize();
            
            // Initial render
            UI.renderTrails();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up scroll to top functionality
            this.setupScrollToTop();
            
            // Update footer year and last modified
            this.updateFooter();
            
        } catch (error) {
            // Silent error handling
        }
    },

    setupEventListeners() {
        // Search functionality
        const searchInput = UI.elements.searchInput;
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', () => EventHandlers.handleSearch());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') EventHandlers.handleSearch();
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => EventHandlers.handleSearch());
        }
        
        // Filter event listeners
        Object.entries(UI.elements.filters).forEach(([filterType, element]) => {
            if (element) {
                element.addEventListener('change', (e) => {
                    EventHandlers.handleFilterChange(filterType, e.target.value);
                });
            }
        });
        
        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => EventHandlers.clearFilters());
        }
        
        // Show favorites button
        const showFavoritesBtn = document.getElementById('showFavorites');
        if (showFavoritesBtn) {
            showFavoritesBtn.addEventListener('click', () => EventHandlers.showFavoritesOnly());
        }
        
        // View toggle buttons
        Object.entries(UI.elements.viewButtons).forEach(([viewType, button]) => {
            if (button) {
                button.addEventListener('click', () => EventHandlers.toggleView(viewType));
            }
        });
        
        // Trails container event delegation
        if (UI.elements.trailsContainer) {
            UI.elements.trailsContainer.addEventListener('click', (e) => {
                // View details buttons
                if (e.target.classList.contains('view-details')) {
                    const trailId = e.target.dataset.trailId;
                    UI.showTrailModal(trailId);
                }
                
                // Favorite buttons
                if (e.target.classList.contains('favorite-btn')) {
                    const trailId = e.target.dataset.trailId;
                    EventHandlers.toggleFavorite(trailId);
                }
            });
        }
        
        // Pagination event delegation
        if (UI.elements.pagination) {
            UI.elements.pagination.addEventListener('click', (e) => {
                if (e.target.classList.contains('page-btn')) {
                    const page = e.target.dataset.page;
                    EventHandlers.goToPage(page);
                }
            });
        }
        
        // Modal event listeners
        const modalClose = document.getElementById('modalClose');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const addToFavoritesBtn = document.getElementById('addToFavorites');
        const modal = UI.elements.modal;
        
        if (modalClose) {
            modalClose.addEventListener('click', () => UI.hideTrailModal());
        }
        
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => UI.hideTrailModal());
        }
        
        if (addToFavoritesBtn) {
            addToFavoritesBtn.addEventListener('click', (e) => {
                const trailId = e.target.dataset.trailId;
                EventHandlers.toggleFavorite(trailId);
            });
        }
        
        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    UI.hideTrailModal();
                }
            });
        }
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.style.display === 'block') {
                UI.hideTrailModal();
            }
        });
    },

    setupScrollToTop() {
        const scrollToTopBtn = UI.elements.scrollToTop;
        
        if (scrollToTopBtn) {
            // Show/hide scroll to top button
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            });
            
            // Scroll to top functionality
            scrollToTopBtn.addEventListener('click', () => EventHandlers.handleScrollToTop());
        }
    },

    updateFooter() {
        
        const currentYearElement = document.getElementById('currentYear');
        if (currentYearElement) {
            currentYearElement.textContent = new Date().getFullYear();
        }
        
        // Update last modified date
        const lastModifiedElement = document.getElementById('lastModified');
        if (lastModifiedElement) {
            lastModifiedElement.textContent = `Last modified: ${document.lastModified}`;
        }
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Export for potential use in other modules (ES Modules structure)
export { App, DataManager, EventHandlers, UI, Utils };