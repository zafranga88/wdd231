// planning.js - Enhanced JavaScript for Patagonia Trail Explorers Planning Page
// ES Modules structure with all required functionality

// Planning State Management
const PlanningState = {
    checklist: [],
    checklistProgress: 0,
    weatherData: {},
    currentWeatherLocation: 'el-calafate',
    gpsCoordinates: [
        { name: 'Torres del Paine Base', coordinates: '-50.9423, -73.4068', description: 'Base of the iconic towers' },
        { name: 'Fitz Roy Base Camp', coordinates: '-49.2931, -73.0544', description: 'El Chaltén base camp' },
        { name: 'Perito Moreno Glacier', coordinates: '-50.4952, -73.1378', description: 'Main glacier viewpoint' },
        { name: 'El Calafate Airport', coordinates: '-50.2803, -72.0533', description: 'Emergency evacuation point' },
        { name: 'El Chaltén Hospital', coordinates: '-49.3319, -73.0131', description: 'Medical emergency' },
        { name: 'Puerto Natales Port', coordinates: '-51.7236, -72.5064', description: 'Emergency services' }
    ]
};

// Planning Utilities
const PlanningUtils = {
    // Weather API configuration
    WEATHER_API_KEY: '5435015f3ffa65cdfbf86473b8e0f9a6', 
    WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',

    // Location mapping for weather API
    weatherLocations: {
        'el-calafate': { name: 'El Calafate', lat: -50.3374, lon: -72.2647 },
        'el-chalten': { name: 'El Chaltén', lat: -49.3319, lon: -73.0131 },
        'ushuaia': { name: 'Ushuaia', lat: -54.8019, lon: -68.3030 },
        'puerto-natales': { name: 'Puerto Natales', lat: -51.7236, lon: -72.5064 }
    },

    // Calculate hiking duration using Naismith's rule
    calculateHikingTime: (distance, elevationGain, fitnessLevel = 'average') => {
        // Base time: 1 hour per 5km
        let baseTime = distance / 5;
        
        // Add time for elevation: 1 hour per 600m gain
        let elevationTime = elevationGain / 600;
        
        // Fitness adjustment
        const fitnessMultipliers = {
            'beginner': 1.3,
            'average': 1.0,
            'experienced': 0.8
        };
        
        let totalTime = (baseTime + elevationTime) * fitnessMultipliers[fitnessLevel];
        
        return Math.round(totalTime * 10) / 10; // Round to 1 decimal
    },

    // Budget calculation
    calculateBudget: (days, accommodation, transportation) => {
        const costs = {
            accommodation: {
                camping: 15,
                hostels: 35,
                hotels: 120
            },
            food: 25, // per day
            transport: {
                flights: 800,
                domestic: 200,
                bus: 50,
                rental: 60
            },
            gear: 200,
            permits: 30
        };
        
        let total = 0;
        
        // Accommodation costs
        total += costs.accommodation[accommodation] * days;
        
        // Food costs
        total += costs.food * days;
        
        // Transportation costs
        transportation.forEach(transport => {
            if (costs.transport[transport]) {
                total += costs.transport[transport];
            }
        });
        
        // Base costs (gear rental, permits)
        total += costs.gear + costs.permits;
        
        return total;
    },

    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format weather data
    formatWeatherData: (data) => {
        return {
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            pressure: data.main.pressure
        };
    },

    // Local storage utilities
    saveToStorage: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    loadFromStorage: (key, defaultValue = null) => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }
};

// Data Management for Planning Tools
const PlanningDataManager = {
    // Fetch weather data from API
    async fetchWeatherData(locationKey) {
        const location = PlanningUtils.weatherLocations[locationKey];
        if (!location) return null;

        try {
            // Using OpenWeatherMap API (you'll need to get a free API key)
            const response = await fetch(
                `${PlanningUtils.WEATHER_BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${PlanningUtils.WEATHER_API_KEY}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            return PlanningUtils.formatWeatherData(data);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            // Return mock data for demonstration
            return this.getMockWeatherData(locationKey);
        }
    },

    // Fetch 5-day forecast
    async fetchWeatherForecast(locationKey) {
        const location = PlanningUtils.weatherLocations[locationKey];
        if (!location) return null;

        try {
            const response = await fetch(
                `${PlanningUtils.WEATHER_BASE_URL}/forecast?lat=${location.lat}&lon=${location.lon}&appid=${PlanningUtils.WEATHER_API_KEY}&units=metric`
            );
            
            if (!response.ok) {
                throw new Error(`Forecast API error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.formatForecastData(data);
        } catch (error) {
            console.error('Error fetching forecast data:', error);
            return this.getMockForecastData(locationKey);
        }
    },

    // Format forecast data
    formatForecastData: (data) => {
        const dailyForecasts = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    date: date,
                    temp: Math.round(item.main.temp),
                    description: item.weather[0].description,
                    icon: item.weather[0].icon,
                    windSpeed: Math.round(item.wind.speed * 3.6)
                };
            }
        });
        
        return Object.values(dailyForecasts).slice(0, 5);
    },

    // Mock weather data for demonstration
    getMockWeatherData: (locationKey) => {
        const mockData = {
            'el-calafate': { temp: 8, feelsLike: 5, description: 'partly cloudy', icon: '02d', humidity: 65, windSpeed: 25, pressure: 1013 },
            'el-chalten': { temp: 6, feelsLike: 2, description: 'windy', icon: '50d', humidity: 70, windSpeed: 35, pressure: 1008 },
            'ushuaia': { temp: 4, feelsLike: 0, description: 'light rain', icon: '10d', humidity: 85, windSpeed: 20, pressure: 1015 },
            'puerto-natales': { temp: 7, feelsLike: 4, description: 'overcast', icon: '04d', humidity: 75, windSpeed: 30, pressure: 1010 }
        };
        return mockData[locationKey] || mockData['el-calafate'];
    },

    // Mock forecast data
    getMockForecastData: (locationKey) => {
        const dates = Array.from({length: 5}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return date;
        });
        
        return dates.map((date, index) => ({
            date: date.toDateString(),
            temp: Math.round(5 + Math.random() * 10),
            description: ['sunny', 'partly cloudy', 'cloudy', 'light rain', 'windy'][index],
            icon: ['01d', '02d', '03d', '10d', '50d'][index],
            windSpeed: Math.round(15 + Math.random() * 20)
        }));
    },

    // Load packing checklist from JSON
    async loadPackingChecklist() {
        try {
            const response = await fetch('data/trails.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.planning_tools || [];
        } catch (error) {
            console.error('Error loading checklist data:', error);
            return this.getDefaultChecklist();
        }
    },

    // Default checklist if JSON fails to load
    getDefaultChecklist: () => [
        {
            category: "Essential Gear",
            items: [
                "Waterproof hiking boots",
                "Rain jacket and pants",
                "Warm insulation layer",
                "Hiking poles",
                "Headlamp with extra batteries",
                "First aid kit",
                "Navigation tools (GPS/map/compass)",
                "Emergency whistle",
                "Sunglasses and sunscreen",
                "Water bottles/hydration system"
            ]
        },
        {
            category: "Camping Gear",
            items: [
                "4-season tent (wind resistant)",
                "Sleeping bag rated for -10°C",
                "Insulated sleeping pad",
                "Portable stove and fuel",
                "Lightweight cookware",
                "Food storage containers",
                "Water purification tablets",
                "Rope and guy lines",
                "Camping pillow",
                "Multi-tool or knife"
            ]
        },
        {
            category: "Clothing",
            items: [
                "Moisture-wicking base layers",
                "Insulating mid-layers",
                "Windproof outer shell",
                "Warm hat and sun hat",
                "Insulated gloves",
                "Extra socks and underwear",
                "Gaiters",
                "Comfortable hiking pants",
                "Quick-dry shirts",
                "Warm sleeping clothes"
            ]
        }
    ]
};

// UI Management for Planning Tools
const PlanningUI = {
    // Initialize all planning components
    async initialize() {
        await this.initializePackingChecklist();
        this.initializeDurationCalculator();
        await this.initializeWeatherForecast();
        this.initializeGPSCoordinates();
        this.initializeBudgetPlanner();
        this.setupEventListeners();
    },

    // Initialize packing checklist
    async initializePackingChecklist() {
        const checklistContainer = document.getElementById('packingChecklist');
        if (!checklistContainer) return;

        try {
            const checklistData = await PlanningDataManager.loadPackingChecklist();
            
            // Load saved checklist state
            const savedChecklist = PlanningUtils.loadFromStorage('patagonia-checklist', {});
            
            let checklistHTML = '';
            checklistData.forEach(category => {
                checklistHTML += `
                    <div class="checklist-category">
                        <h4 class="category-title">${category.category}</h4>
                        <div class="checklist-items">
                `;
                
                category.items.forEach((item, index) => {
                    const itemId = `${category.category}-${index}`;
                    const isChecked = savedChecklist[itemId] || false;
                    
                    checklistHTML += `
                        <label class="checklist-item">
                            <input type="checkbox" data-item-id="${itemId}" ${isChecked ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            <span class="item-text">${item}</span>
                        </label>
                    `;
                });
                
                checklistHTML += `
                        </div>
                    </div>
                `;
            });
            
            checklistContainer.innerHTML = checklistHTML;
            this.updateChecklistProgress();
            
        } catch (error) {
            console.error('Error initializing checklist:', error);
            checklistContainer.innerHTML = '<p class="error">Error loading checklist. Please refresh the page.</p>';
        }
    },

    // Initialize duration calculator
    initializeDurationCalculator() {
        const calculatorContainer = document.getElementById('durationCalculator');
        if (!calculatorContainer) return;

        calculatorContainer.innerHTML = `
            <div class="calculator-form">
                <div class="form-group">
                    <label for="distance">Distance (km)</label>
                    <input type="number" id="distance" min="1" max="100" value="10" step="0.1">
                </div>
                <div class="form-group">
                    <label for="elevation">Elevation Gain (m)</label>
                    <input type="number" id="elevation" min="0" max="3000" value="500" step="50">
                </div>
                <div class="form-group">
                    <label for="fitness">Fitness Level</label>
                    <select id="fitness">
                        <option value="beginner">Beginner</option>
                        <option value="average" selected>Average</option>
                        <option value="experienced">Experienced</option>
                    </select>
                </div>
                <button type="button" class="btn btn-primary" id="calculateTime">Calculate Time</button>
                <div class="calculation-result" id="timeResult">
                    <h4>Estimated Hiking Time</h4>
                    <div class="time-display">
                        <span class="time-value" id="timeValue">5.2</span>
                        <span class="time-unit">hours</span>
                    </div>
                    <p class="time-note">This includes rest stops and is based on Naismith's rule</p>
                </div>
            </div>
        `;

        // Calculate initial time
        this.calculateHikingTime();
    },

    // Initialize weather forecast
    async initializeWeatherForecast() {
        const weatherContainer = document.getElementById('weatherForecast');
        if (!weatherContainer) return;

        try {
            await this.updateWeatherForecast('el-calafate');
        } catch (error) {
            console.error('Error initializing weather:', error);
            weatherContainer.innerHTML = '<p class="error">Error loading weather data. Please try again later.</p>';
        }
    },

    // Update weather forecast
    async updateWeatherForecast(locationKey) {
        const weatherContainer = document.getElementById('weatherForecast');
        if (!weatherContainer) return;

        weatherContainer.innerHTML = '<div class="loading">Loading weather data...</div>';

        try {
            const currentWeather = await PlanningDataManager.fetchWeatherData(locationKey);
            const forecast = await PlanningDataManager.fetchWeatherForecast(locationKey);
            const location = PlanningUtils.weatherLocations[locationKey];

            let weatherHTML = `
                <div class="current-weather">
                    <div class="weather-header">
                        <h4>Current Weather - ${location.name}</h4>
                        <span class="weather-temp">${currentWeather.temp}°C</span>
                    </div>
                    <div class="weather-details">
                        <div class="weather-detail">
                            <span class="detail-label">Feels like:</span>
                            <span class="detail-value">${currentWeather.feelsLike}°C</span>
                        </div>
                        <div class="weather-detail">
                            <span class="detail-label">Conditions:</span>
                            <span class="detail-value">${currentWeather.description}</span>
                        </div>
                        <div class="weather-detail">
                            <span class="detail-label">Wind:</span>
                            <span class="detail-value">${currentWeather.windSpeed} km/h</span>
                        </div>
                        <div class="weather-detail">
                            <span class="detail-label">Humidity:</span>
                            <span class="detail-value">${currentWeather.humidity}%</span>
                        </div>
                    </div>
                </div>
                <div class="forecast-grid">
            `;

            forecast.forEach(day => {
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                
                weatherHTML += `
                    <div class="forecast-day">
                        <div class="day-name">${dayName}</div>
                        <div class="day-temp">${day.temp}°C</div>
                        <div class="day-desc">${day.description}</div>
                        <div class="day-wind">${day.windSpeed} km/h</div>
                    </div>
                `;
            });

            weatherHTML += '</div>';
            weatherContainer.innerHTML = weatherHTML;

        } catch (error) {
            console.error('Error updating weather:', error);
            weatherContainer.innerHTML = '<p class="error">Unable to load weather data. Please try again later.</p>';
        }
    },

    // Initialize GPS coordinates
    initializeGPSCoordinates() {
        const gpsList = document.getElementById('gpsList');
        if (!gpsList) return;

        let gpsHTML = '';
        PlanningState.gpsCoordinates.forEach(location => {
            gpsHTML += `
                <div class="gps-item">
                    <div class="gps-name">${location.name}</div>
                    <div class="gps-coords">${location.coordinates}</div>
                    <div class="gps-desc">${location.description}</div>
                    <button class="btn btn-sm copy-coords" data-coords="${location.coordinates}">Copy</button>
                </div>
            `;
        });
        
        gpsList.innerHTML = gpsHTML;
    },

    // Initialize budget planner
    initializeBudgetPlanner() {
        // Budget planner is already in HTML, just need to set up the calculation
        this.calculateBudget();
    },

    // Calculate hiking time
    calculateHikingTime() {
        const distance = parseFloat(document.getElementById('distance')?.value || 10);
        const elevation = parseFloat(document.getElementById('elevation')?.value || 500);
        const fitness = document.getElementById('fitness')?.value || 'average';

        const time = PlanningUtils.calculateHikingTime(distance, elevation, fitness);
        const timeValue = document.getElementById('timeValue');
        
        if (timeValue) {
            timeValue.textContent = time;
        }
    },

    // Calculate budget
    calculateBudget() {
        const days = parseInt(document.getElementById('tripDays')?.value || 7);
        const accommodation = document.querySelector('input[name="accommodation"]:checked')?.value || 'camping';
        
        const transportationElements = document.querySelectorAll('input[name="transport"]:checked');
        const transportation = Array.from(transportationElements).map(el => el.value);

        const total = PlanningUtils.calculateBudget(days, accommodation, transportation);
        
        const budgetResult = document.getElementById('budgetResult');
        if (budgetResult) {
            budgetResult.innerHTML = `
                <div class="budget-summary">
                    <h4>Estimated Budget</h4>
                    <div class="budget-total">${PlanningUtils.formatCurrency(total)}</div>
                    <div class="budget-breakdown">
                        <div class="budget-item">
                            <span>Per day average:</span>
                            <span>${PlanningUtils.formatCurrency(total / days)}</span>
                        </div>
                        <p class="budget-note">
                            This is a rough estimate. Actual costs may vary based on season, 
                            exchange rates, and personal spending habits.
                        </p>
                    </div>
                </div>
            `;
        }
    },

    // Update checklist progress
    updateChecklistProgress() {
        const checkboxes = document.querySelectorAll('#packingChecklist input[type="checkbox"]');
        const checked = document.querySelectorAll('#packingChecklist input[type="checkbox"]:checked');
        
        if (checkboxes.length === 0) return;
        
        const progress = (checked.length / checkboxes.length) * 100;
        
        const progressFill = document.getElementById('checklistProgress');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(progress)}% Complete`;
        }
        
        // Save checklist state
        const checklistState = {};
        checkboxes.forEach(checkbox => {
            checklistState[checkbox.dataset.itemId] = checkbox.checked;
        });
        PlanningUtils.saveToStorage('patagonia-checklist', checklistState);
    },

    // Clear checklist
    clearChecklist() {
        const checkboxes = document.querySelectorAll('#packingChecklist input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateChecklistProgress();
    },

    // Print checklist
    printChecklist() {
        const checklistContent = document.getElementById('packingChecklist');
        if (!checklistContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Patagonia Packing Checklist</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #2c5530; }
                        .category-title { color: #4a7c59; margin-top: 20px; }
                        .checklist-item { display: block; margin: 5px 0; }
                        input[type="checkbox"] { margin-right: 10px; }
                        @media print { 
                            body { margin: 0; }
                            .category-title { page-break-before: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Patagonia Trail Explorers - Packing Checklist</h1>
                    ${checklistContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    // Setup event listeners
    setupEventListeners() {
        // Checklist events
        document.addEventListener('change', (e) => {
            if (e.target.matches('#packingChecklist input[type="checkbox"]')) {
                this.updateChecklistProgress();
            }
        });

        // Clear checklist button
        const clearBtn = document.getElementById('clearChecklist');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearChecklist());
        }

        // Print checklist button
        const printBtn = document.getElementById('printChecklist');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printChecklist());
        }

        // Duration calculator events
        const calculateBtn = document.getElementById('calculateTime');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateHikingTime());
        }

        // Auto-calculate on input change
        ['distance', 'elevation', 'fitness'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.calculateHikingTime());
            }
        });

        // Weather location change
        const weatherLocation = document.getElementById('weatherLocation');
        if (weatherLocation) {
            weatherLocation.addEventListener('change', (e) => {
                this.updateWeatherForecast(e.target.value);
            });
        }

        // GPS coordinates copy
        document.addEventListener('click', (e) => {
            if (e.target.matches('.copy-coords')) {
                const coords = e.target.dataset.coords;
                navigator.clipboard.writeText(coords).then(() => {
                    e.target.textContent = 'Copied!';
                    setTimeout(() => {
                        e.target.textContent = 'Copy';
                    }, 2000);
                }).catch(() => {
                    alert(`Coordinates: ${coords}`);
                });
            }
        });

        // Budget calculator events
        const budgetInputs = ['tripDays', 'calculateBudget'];
        budgetInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => this.calculateBudget());
            }
        });

        // Auto-calculate budget on input change
        document.addEventListener('change', (e) => {
            if (e.target.matches('input[name="accommodation"], input[name="transport"], #tripDays')) {
                this.calculateBudget();
            }
        });
    }
};

// Modal functionality (reused from main script)
const Modal = {
    show: (title, content) => {
        // Create modal if it doesn't exist
        let modal = document.getElementById('planningModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'planningModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="planningModalTitle">${title}</h3>
                        <span class="modal-close" id="planningModalClose">&times;</span>
                    </div>
                    <div class="modal-body" id="planningModalBody">
                        ${content}
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Setup close functionality
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => Modal.hide());
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) Modal.hide();
            });
        } else {
            document.getElementById('planningModalTitle').textContent = title;
            document.getElementById('planningModalBody').innerHTML = content;
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    },

    hide: () => {
        const modal = document.getElementById('planningModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
};

// Navigation functionality (reused from main script)
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

// Scroll to top functionality
const ScrollToTop = {
    init() {
        const scrollBtn = document.getElementById('scrollToTop');
        if (!scrollBtn) return;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        });

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
};

// Footer updates
const Footer = {
    updateFooter() {
        // Update current year
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

// Main Planning App initialization
const PlanningApp = {
    async init() {
        try {
            console.log('Initializing Patagonia Planning Tools...');
            
            // Initialize navigation
            Navigation.init();
            
            // Initialize scroll to top
            ScrollToTop.init();
            
            // Update footer
            Footer.updateFooter();
            
            // Initialize planning components
            await PlanningUI.initialize();
            
            console.log('Planning tools initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize planning app:', error);
            
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification';
            errorDiv.innerHTML = `
                <div class="error-content">
                    <h3>Initialization Error</h3>
                    <p>Some planning tools may not work correctly. Please refresh the page.</p>
                    <button onclick="this.parentElement.parentElement.remove()">Close</button>
                </div>
            `;
            document.body.appendChild(errorDiv);
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PlanningApp.init();
});

// Export modules for potential external use
export { PlanningApp, PlanningUI, PlanningDataManager, PlanningUtils, Modal };