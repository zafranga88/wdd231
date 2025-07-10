// DOM Elements
const membersContainer = document.getElementById('membersContainer');
const loadingMessage = document.getElementById('loadingMessage');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const currentYearSpan = document.getElementById('currentYear');
const lastModifiedSpan = document.getElementById('lastModified');

// Current view state
let currentView = 'grid';
let membersData = [];

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadMembers();
    setupEventListeners();
    updateFooterInfo();
});

// Event listeners
function setupEventListeners() {
    gridViewBtn.addEventListener('click', () => switchView('grid'));
    listViewBtn.addEventListener('click', () => switchView('list'));
}

// Load members data from JSON
async function loadMembers() {
    try {
        // Fixed: Changed path from 'data/members.json' to 'members.json'
        const response = await fetch('members.json');
        if (!response.ok) {
            throw new Error('Failed to load members data');
        }
        membersData = await response.json();
        displayMembers();
    } catch (error) {
        console.error('Error loading members:', error);
        showError('Failed to load members data. Please try again later.');
    }
}

// Display members based on current view
function displayMembers() {
    hideLoading();
    
    if (currentView === 'grid') {
        displayGridView();
    } else {
        displayListView();
    }
}

// Display members in grid view
function displayGridView() {
    membersContainer.className = 'members-grid';
    membersContainer.innerHTML = '';
    
    membersData.forEach(member => {
        const memberCard = createMemberCard(member);
        membersContainer.appendChild(memberCard);
    });
}

// Display members in list view
function displayListView() {
    membersContainer.className = 'members-list';
    membersContainer.innerHTML = '';
    
    membersData.forEach(member => {
        const memberCard = createMemberListItem(member);
        membersContainer.appendChild(memberCard);
    });
}

// Create member card for grid view
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

// Create member list item for list view
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

// Get membership level label
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

// Switch between grid and list views
function switchView(view) {
    currentView = view;
    
    // Update button states
    gridViewBtn.classList.toggle('active', view === 'grid');
    listViewBtn.classList.toggle('active', view === 'list');
    
    // Display members in new view
    displayMembers();
}

// Hide loading message
function hideLoading() {
    loadingMessage.style.display = 'none';
}

// Show error message
function showError(message) {
    hideLoading();
    membersContainer.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 2rem; color: #d32f2f;">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Update footer information
function updateFooterInfo() {
    // Set current year
    const currentYear = new Date().getFullYear();
    if (currentYearSpan) {
        currentYearSpan.textContent = currentYear;
    }
    
    // Set last modified date
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