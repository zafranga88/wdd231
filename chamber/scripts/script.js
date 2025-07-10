const membersContainer = document.getElementById('membersContainer');
const loadingMessage = document.getElementById('loadingMessage');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const currentYearSpan = document.getElementById('currentYear');
const lastModifiedSpan = document.getElementById('lastModified');
const featuredMembersContainer = document.getElementById('featuredMembers');

const hamburger = document.getElementById('hamburger');
const navigation = document.getElementById('navigation');

let currentView = 'grid';
let membersData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Load members for directory page
    if (membersContainer) {
        loadMembers();
    }
    
    // Load featured members for home page
    if (featuredMembersContainer) {
        loadFeaturedMembers();
    }
    
    setupEventListeners();
    updateFooterInfo();
});

function setupEventListeners() {
    // View controls (only for directory page)
    if (gridViewBtn && listViewBtn) {
        gridViewBtn.addEventListener('click', () => switchView('grid'));
        listViewBtn.addEventListener('click', () => switchView('list'));
    }

    // Mobile menu
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

async function loadMembers() {
    try {
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

async function loadFeaturedMembers() {
    try {
        const response = await fetch('members.json');
        if (!response.ok) {
            throw new Error('Failed to load members data');
        }
        const allMembers = await response.json();
        
        // Filter for gold and silver members, then get first 3
        const featuredMembers = allMembers
            .filter(member => member.membershipLevel === 3 || member.membershipLevel === 2)
            .sort((a, b) => b.membershipLevel - a.membershipLevel)
            .slice(0, 3);
        
        displayFeaturedMembers(featuredMembers);
    } catch (error) {
        console.error('Error loading featured members:', error);
        featuredMembersContainer.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 2rem; color: #d32f2f;">
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
            <div class="error-message" style="text-align: center; padding: 2rem; color: #d32f2f;">
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