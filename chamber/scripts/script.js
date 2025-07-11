const members = [
  {
    "name": "Estancia Los Alamos",
    "address": "Ruta Provincial 17 Km 45, Córdoba, Argentina",
    "phone": "+54 351 456-7890",
    "website": "https://estancia-los-alamos.com.ar",
    "image": "images/estancia-los-alamos.jpg",
    "membershipLevel": 3,
    "description": "Traditional Argentine estancia offering authentic gaucho experiences and premium beef",
    "founded": "1920",
    "employees": "150+"
  },
  {
    "name": "Parrilla El Asador Cordobés",
    "address": "Belgrano 245, Centro, Córdoba, Argentina",
    "phone": "+54 351 423-1234",
    "website": "https://asador-cordobes.com.ar",
    "image": "images/asador-cordobes.jpg",
    "membershipLevel": 2,
    "description": "Authentic Argentine parrilla serving the finest cuts of meat and traditional dishes",
    "founded": "1985",
    "employees": "25-35"
  },
  {
    "name": "Fernet Branca Distribuidora",
    "address": "Av. Rafael Núñez 4567, Córdoba, Argentina",
    "phone": "+54 351 468-9012",
    "website": "https://fernet-distribuidor.com.ar",
    "image": "images/fernet-distribuidor.jpg",
    "membershipLevel": 3,
    "description": "Official distributor of Fernet Branca and other premium spirits in Córdoba",
    "founded": "1978",
    "employees": "200+"
  },
  {
    "name": "Artesanías Cordobesas",
    "address": "Paseo de las Artes 89, Córdoba, Argentina",
    "phone": "+54 351 445-6789",
    "website": "https://artesanias-cordobesas.com.ar",
    "image": "images/artesanias-cordobesas.jpg",
    "membershipLevel": 1,
    "description": "Traditional crafts and handmade goods from local artisans",
    "founded": "1995",
    "employees": "8-12"
  },
  {
    "name": "Turismo Sierras de Córdoba",
    "address": "Av. Hipólito Yrigoyen 567, Córdoba, Argentina",
    "phone": "+54 351 412-3456",
    "website": "https://turismo-sierras.com.ar",
    "image": "images/turismo-sierras.jpg",
    "membershipLevel": 2,
    "description": "Adventure tourism and guided tours through the beautiful Córdoba mountains",
    "founded": "2002",
    "employees": "30-45"
  },
  {
    "name": "Hotel Sheraton Córdoba",
    "address": "Duarte Quirós 1300, Nueva Córdoba, Argentina",
    "phone": "+54 351 434-5678",
    "website": "https://sheraton-cordoba.com",
    "image": "images/sheraton-cordoba.jpg",
    "membershipLevel": 3,
    "description": "Five-star luxury hotel in the heart of Nueva Córdoba",
    "founded": "1998",
    "employees": "180+"
  },
  {
    "name": "Cooperativa Textil Córdoba",
    "address": "Barrio San Vicente 234, Córdoba, Argentina",
    "phone": "+54 351 456-7801",
    "website": "https://textil-cordoba.coop.ar",
    "image": "images/textil-cordoba.jpg",
    "membershipLevel": 1,
    "description": "Textile cooperative producing quality fabrics and supporting local workers",
    "founded": "1987",
    "employees": "65-80"
  },
  {
    "name": "TechCórdoba Solutions",
    "address": "Av. Fader 3200, Cerro de las Rosas, Córdoba, Argentina",
    "phone": "+54 351 489-0123",
    "website": "https://tech-cordoba.com.ar",
    "image": "images/tech-cordoba.jpg",
    "membershipLevel": 2,
    "description": "Software development and IT consulting for businesses across Argentina",
    "founded": "2010",
    "employees": "45-60"
  },
  {
    "name": "Universidad Nacional de Córdoba - Librería",
    "address": "Av. Haya de la Torre s/n, Ciudad Universitaria, Córdoba, Argentina",
    "phone": "+54 351 433-4567",
    "website": "https://libreria-unc.edu.ar",
    "image": "images/libreria-unc.jpg",
    "membershipLevel": 1,
    "description": "Academic bookstore serving Argentina's oldest university since 1613",
    "founded": "1613",
    "employees": "15-20"
  },
  {
    "name": "Vinos de Córdoba Bodega",
    "address": "Camino a Colonia Caroya Km 12, Córdoba, Argentina",
    "phone": "+54 351 498-7654",
    "website": "https://vinos-cordoba.com.ar",
    "image": "images/vinos-cordoba.jpg",
    "membershipLevel": 3,
    "description": "Premium wine production featuring native Argentine grape varieties",
    "founded": "1953",
    "employees": "120+"
  },
  {
    "name": "Alfajores La Falda",
    "address": "9 de Julio 1456, Córdoba, Argentina",
    "phone": "+54 351 467-8901",
    "website": "https://alfajores-lafalda.com.ar",
    "image": "images/alfajores-lafalda.jpg",
    "membershipLevel": 2,
    "description": "Traditional Argentine alfajores and confectionery since 1947",
    "founded": "1947",
    "employees": "40-55"
  }
];
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("membersContainer");
  const loading = document.getElementById("loadingMessage");

  if (loading) loading.style.display = "none";

  members.forEach(member => {
    const card = document.createElement("div");
    card.className = "member-card";

    card.innerHTML = `
      <img src="${member.image}" alt="${member.name}" class="member-image">
      <div class="member-info">
        <h3 class="member-name">${member.name}</h3>
        <p class="member-address">${member.address}</p>
        <p class="member-phone">${member.phone}</p>
        <a href="${member.website}" target="_blank" class="member-website">Visit Website</a>
        <div class="membership-badge membership-${member.membershipLevel}">
          Level ${member.membershipLevel}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
});

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

    if (membersContainer) {
        loadMembers();
    }

    if (featuredMembersContainer) {
        loadFeaturedMembers();
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