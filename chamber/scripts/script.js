const membersContainer = document.getElementById('membersContainer');
const loadingMessage = document.getElementById('loadingMessage');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const currentYearSpan = document.getElementById('currentYear');
const lastModifiedSpan = document.getElementById('lastModified');
const featuredMembersContainer = document.getElementById('featuredMembers');
const spotlightsContainer = document.getElementById('spotlightsContainer');
const currentWeatherContainer = document.getElementById('currentWeather');
const forecastGrid = document.getElementById('forecastGrid');

const hamburger = document.getElementById('hamburger');
const navigation = document.getElementById('navigation');

const key = "5435015f3ffa65cdfbf86473b8e0f9a6";
const lat = "-31.4201"; 
const long = "-64.1888"; 
const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=metric`;
const FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=metric`;

let currentView = 'grid';
let membersData = [];

document.addEventListener('DOMContentLoaded', function() {
    if (membersContainer) {
        loadMembers();
    }

    if (featuredMembersContainer) {
        loadFeaturedMembers();
    }

    if (spotlightsContainer) {
        loadMemberSpotlights();
    }

    if (currentWeatherContainer) {
        loadWeatherData();
    }
    
    setupEventListeners();
    updateFooterInfo();
});

function setupEventListeners() {
    if (gridViewBtn && listViewBtn) {
        gridViewBtn.addEventListener('click', () => switchView('grid'));
        listViewBtn.addEventListener('click', () => switchView('list'));
    }

    if (hamburger && navigation) {
        hamburger.addEventListener('click', toggleMobileMenu);

        const navLinks = document.querySelectorAll('.nav-list a');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        document.addEventListener('click', (e) => {
            if (!navigation.contains(e.target) && !hamburger.contains(e.target)) {
                closeMobileMenu();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }
}

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navigation.classList.toggle('active');
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    navigation.classList.remove('active');
}

async function loadWeatherData() {
    try {
        if (key === 'YOUR_API_KEY_HERE') {
            showWeatherError('Please configure your OpenWeatherMap API key in the JavaScript file.');
            return;
        }

        const response = await fetch(WEATHER_API_URL);
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            displayCurrentWeather(data);
        } else {
            throw Error(await response.text());
        }

        const forecastResponse = await fetch(FORECAST_API_URL);
        if (forecastResponse.ok) {
            const forecastData = await forecastResponse.json();
            displayForecast(forecastData);
        } else {
            throw Error(await forecastResponse.text());
        }

    } catch (error) {
        console.error('Error loading weather data:', error);
        showWeatherError('Unable to load weather data at this time.');
    }
}

function displayCurrentWeather(data) {
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    currentWeatherContainer.innerHTML = `
        <div class="current-weather-content">
            <div class="weather-main">
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="weather-icon">
                <div class="weather-info">
                    <div class="temperature">${temperature}°C</div>
                    <div class="description">${description.charAt(0).toUpperCase() + description.slice(1)}</div>
                </div>
            </div>
            <div class="weather-details">
                <div class="detail-item">
                    <span class="detail-label">Humidity:</span>
                    <span class="detail-value">${humidity}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Wind Speed:</span>
                    <span class="detail-value">${windSpeed} m/s</span>
                </div>
            </div>
        </div>
    `;
}

function displayForecast(data) {
    const dailyForecasts = [];
    const today = new Date();
    const currentTime = today.getTime();
    
    for (let i = 0; i < data.list.length && dailyForecasts.length < 3; i++) {
        const forecast = data.list[i];
        const forecastDate = new Date(forecast.dt * 1000);
        
        if (forecastDate.getTime() > currentTime && forecastDate.getHours() >= 12 && forecastDate.getHours() <= 15) {
            const existingDay = dailyForecasts.find(f => {
                const existing = new Date(f.dt * 1000);
                return existing.getDate() === forecastDate.getDate();
            });
            
            if (!existingDay) {
                dailyForecasts.push(forecast);
            }
        }
    }

    if (dailyForecasts.length < 3) {
        dailyForecasts.length = 0;
        for (let i = 0; i < Math.min(3, data.list.length); i++) {
            dailyForecasts.push(data.list[i]);
        }
    }

    forecastGrid.innerHTML = dailyForecasts.map(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const temp = Math.round(forecast.main.temp);
        const description = forecast.weather[0].description;
        const icon = forecast.weather[0].icon;

        return `
            <div class="forecast-item">
                <div class="forecast-day">${dayName}</div>
                <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}" class="forecast-icon">
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-desc">${description}</div>
            </div>
        `;
    }).join('');
}

function showWeatherError(message) {
    if (currentWeatherContainer) {
        currentWeatherContainer.innerHTML = `
            <div class="weather-error">
                <p>${message}</p>
            </div>
        `;
    }
    
    if (forecastGrid) {
        forecastGrid.innerHTML = `
            <div class="forecast-error">
                <p>Forecast unavailable</p>
            </div>
        `;
    }
}

async function loadMemberSpotlights() {
    try {
        const response = await fetch('data/members.json');
        if (!response.ok) {
            throw new Error('Failed to fetch members data');
        }
        const allMembers = await response.json();

        const qualifiedMembers = allMembers.filter(member => 
            member.membershipLevel === 3 || member.membershipLevel === 2
        );

        const numberOfSpotlights = Math.min(3, qualifiedMembers.length);
        const selectedMembers = getRandomMembers(qualifiedMembers, numberOfSpotlights);
        
        displayMemberSpotlights(selectedMembers);
    } catch (error) {
        console.error('Error loading member spotlights:', error);
        showSpotlightError('Unable to load member spotlights at this time.');
    }
}

function getRandomMembers(members, count) {
    const shuffled = [...members].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayMemberSpotlights(members) {
    spotlightsContainer.innerHTML = '';
    
    members.forEach(member => {
        const spotlightCard = createSpotlightCard(member);
        spotlightsContainer.appendChild(spotlightCard);
    });
}

function createSpotlightCard(member) {
    const card = document.createElement('div');
    card.className = 'spotlight-card';
    
    card.innerHTML = `
        <div class="spotlight-header">
            <img src="${member.image}" alt="${member.name} logo" class="spotlight-logo" 
                 onerror="this.src='images/placeholder-logo.jpg'">
            <div class="membership-badge membership-${member.membershipLevel}">
                ${getMembershipLabel(member.membershipLevel)}
            </div>
        </div>
        <div class="spotlight-content">
            <h3 class="spotlight-name">${member.name}</h3>
            <div class="spotlight-details">
                <p class="spotlight-address">📍 ${member.address}</p>
                <p class="spotlight-phone">📞 ${member.phone}</p>
                <a href="${member.website}" target="_blank" class="spotlight-website">
                    🌐 Visit Website
                </a>
            </div>
        </div>
    `;
    
    return card;
}

function showSpotlightError(message) {
    if (spotlightsContainer) {
        spotlightsContainer.innerHTML = `
            <div class="spotlight-error">
                <p>${message}</p>
            </div>
        `;
    }
}

async function loadMembers() {
    try {
        const response = await fetch('data/members.json');
        if (!response.ok) {
            throw new Error('Failed to fetch members data');
        }
        membersData = await response.json();
        displayMembers();
    } catch (error) {
        console.error('Error loading members:', error);
        showError('Failed to load members data. Please try again later.');
    }
}

async function loadFeaturedMembers() {
    try {
        const response = await fetch('data/members.json');
        if (!response.ok) {
            throw new Error('Failed to fetch members data');
        }
        const allMembers = await response.json();

        const featuredMembers = allMembers
            .filter(member => member.membershipLevel === 3 || member.membershipLevel === 2)
            .sort((a, b) => b.membershipLevel - a.membershipLevel)
            .slice(0, 3);
        
        displayFeaturedMembers(featuredMembers);
    } catch (error) {
        console.error('Error loading featured members:', error);
        featuredMembersContainer.innerHTML = `
            <div class="error-message">
                <p>Unable to load featured members at this time.</p>
            </div>
        `;
    }
}

function displayFeaturedMembers(members) {
    featuredMembersContainer.innerHTML = '';
    
    members.forEach(member => {
        const memberCard = createFeaturedMemberCard(member);
        featuredMembersContainer.appendChild(memberCard);
    });
}

function createFeaturedMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'featured-member-card';
    
    card.innerHTML = `
        <img src="${member.image}" alt="${member.name}" class="featured-member-image" 
             onerror="this.src='images/placeholder.jpg'">
        <div class="featured-member-info">
            <h3 class="featured-member-name">${member.name}</h3>
            <p class="featured-member-address">${member.address}</p>
            <p class="featured-member-phone">${member.phone}</p>
            <a href="${member.website}" target="_blank" class="featured-member-website">
                Visit Website
            </a>
            <div class="membership-badge membership-${member.membershipLevel}">
                ${getMembershipLabel(member.membershipLevel)}
            </div>
        </div>
    `;
    
    return card;
}

function displayMembers() {
    if (loadingMessage) {
        hideLoading();
    }
    
    if (currentView === 'grid') {
        displayGridView();
    } else {
        displayListView();
    }
}

function displayGridView() {
    membersContainer.className = 'members-grid';
    membersContainer.innerHTML = '';
    
    membersData.forEach(member => {
        const memberCard = createMemberCard(member);
        membersContainer.appendChild(memberCard);
    });
}

function displayListView() {
    membersContainer.className = 'members-list';
    membersContainer.innerHTML = '';
    
    membersData.forEach(member => {
        const memberCard = createMemberListItem(member);
        membersContainer.appendChild(memberCard);
    });
}

function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    
    card.innerHTML = `
        <img src="${member.image}" alt="${member.name}" class="member-image" 
             onerror="this.src='images/placeholder.jpg'">
        <div class="member-info">
            <h3 class="member-name">${member.name}</h3>
            <p class="member-address">${member.address}</p>
            <p class="member-phone">${member.phone}</p>
            <a href="${member.website}" target="_blank" class="member-website">
                Visit Website
            </a>
            <div class="membership-badge membership-${member.membershipLevel}">
                ${getMembershipLabel(member.membershipLevel)}
            </div>
        </div>
    `;
    
    return card;
}

function createMemberListItem(member) {
    const item = document.createElement('div');
    item.className = 'member-card';
    
    item.innerHTML = `
        <img src="${member.image}" alt="${member.name}" class="member-image"
             onerror="this.src='images/placeholder.jpg'">
        <div class="member-info">
            <div class="member-details">
                <h3 class="member-name">${member.name}</h3>
                <p class="member-address">${member.address}</p>
                <p class="member-phone">${member.phone}</p>
                <a href="${member.website}" target="_blank" class="member-website">
                    Visit Website
                </a>
            </div>
            <div class="membership-badge membership-${member.membershipLevel}">
                ${getMembershipLabel(member.membershipLevel)}
            </div>
        </div>
    `;
    
    return item;
}

function getMembershipLabel(level) {
    switch(level) {
        case 1:
            return 'Member';
        case 2:
            return 'Silver';
        case 3:
            return 'Gold';
        default:
            return 'Member';
    }
}

function switchView(view) {
    currentView = view;

    gridViewBtn.classList.toggle('active', view === 'grid');
    listViewBtn.classList.toggle('active', view === 'list');

    displayMembers();
}

function hideLoading() {
    if (loadingMessage) {
        loadingMessage.style.display = 'none';
    }
}

function showError(message) {
    hideLoading();
    if (membersContainer) {
        membersContainer.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

function updateFooterInfo() {
    const currentYear = new Date().getFullYear();
    if (currentYearSpan) {
        currentYearSpan.textContent = currentYear;
    }

    const lastModified = new Date(document.lastModified);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    if (lastModifiedSpan) {
        lastModifiedSpan.textContent = lastModified.toLocaleDateString('en-US', options);
    }
}