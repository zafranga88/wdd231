// form-confirmation.js
document.addEventListener('DOMContentLoaded', function() {
    // Get URL parameters from the form submission
    const urlParams = new URLSearchParams(window.location.search);
    const messageSummary = document.getElementById('messageSummary');
    
    // Check if we have form data
    if (urlParams.toString() === '') {
        messageSummary.innerHTML = `
            <div class="no-data-message">
                <p>No form data was received. Please <a href="contact.html">submit the form</a> to see your message details here.</p>
            </div>
        `;
        return;
    }
    
    // Function to format field names for display
    function formatFieldName(fieldName) {
        const fieldNames = {
            'firstName': 'First Name',
            'lastName': 'Last Name',
            'email': 'Email Address',
            'phone': 'Phone Number',
            'subject': 'Subject',
            'message': 'Message',
            'visitPlans': 'Planned Visit Date',
            'newsletter': 'Newsletter Subscription',
            'fullName': 'Full Name',
            'experience': 'Hiking Experience',
            'interests': 'Trail Interests',
            'frequency': 'Newsletter Frequency'
        };
        return fieldNames[fieldName] || fieldName;
    }
    
    // Function to format field values for display
    function formatFieldValue(fieldName, value) {
        // Handle special formatting cases
        switch (fieldName) {
            case 'subject':
                const subjectOptions = {
                    'trail-info': 'Trail Information',
                    'planning-help': 'Planning Assistance',
                    'conditions': 'Trail Conditions Update',
                    'feedback': 'Website Feedback',
                    'emergency': 'Emergency/Urgent',
                    'other': 'Other'
                };
                return subjectOptions[value] || value;
                
            case 'newsletter':
                return value === 'yes' ? 'Yes, subscribed to newsletter' : 'Not subscribed';
                
            case 'experience':
                return value.charAt(0).toUpperCase() + value.slice(1);
                
            case 'visitPlans':
                if (value) {
                    const date = new Date(value + '-01');
                    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                }
                return 'Not specified';
                
            case 'frequency':
                return value.charAt(0).toUpperCase() + value.slice(1);
                
            default:
                return value || 'Not provided';
        }
    }
    
    // Build the display HTML
    let displayHTML = '<div class="form-data-display">';
    
    // Get all form parameters and organize them
    const formData = {};
    const interests = [];
    
    for (const [key, value] of urlParams.entries()) {
        if (key === 'interests') {
            interests.push(value);
        } else {
            formData[key] = value;
        }
    }
    
    // Add interests array to formData if it exists
    if (interests.length > 0) {
        formData['interests'] = interests;
    }
    
    // Display each field
    for (const [fieldName, fieldValue] of Object.entries(formData)) {
        if (fieldValue && fieldValue !== '') {
            const displayName = formatFieldName(fieldName);
            let displayValue;
            
            // Handle arrays (like interests)
            if (Array.isArray(fieldValue)) {
                displayValue = fieldValue.map(item => {
                    return item.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                }).join(', ');
            } else {
                displayValue = formatFieldValue(fieldName, fieldValue);
            }
            
            // Special styling for message field
            if (fieldName === 'message') {
                displayHTML += `
                    <div class="form-field message-field">
                        <strong class="field-label">${displayName}:</strong>
                        <div class="field-value message-text">${displayValue}</div>
                    </div>
                `;
            } else {
                displayHTML += `
                    <div class="form-field">
                        <strong class="field-label">${displayName}:</strong>
                        <span class="field-value">${displayValue}</span>
                    </div>
                `;
            }
        }
    }
    
    displayHTML += '</div>';
    
    // Add timestamp
    const submissionTime = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    displayHTML += `
        <div class="submission-info">
            <p><strong>Submitted on:</strong> ${submissionTime}</p>
            <p><strong>Reference ID:</strong> MSG-${Date.now()}</p>
        </div>
    `;
    
    // Insert the HTML into the page
    messageSummary.innerHTML = displayHTML;
    
    // Update page elements with current year and last modified
    const currentYearElement = document.getElementById('currentYear');
    const lastModifiedElement = document.getElementById('lastModified');
    
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    if (lastModifiedElement) {
        lastModifiedElement.textContent = `Last Modified: ${document.lastModified}`;
    }
    
    // Initialize mobile menu functionality
    initializeMobileMenu();
});

// Mobile menu functionality
function initializeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}