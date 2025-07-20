
const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course will introduce students to programming. It will introduce the building blocks of programming languages (variables, decisions, calculations, loops, array, and input/output) and use them to solve problems.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course introduces students to the World Wide Web and to careers in web site design and development. The course is hands-on with students actually participating in simple web designs and programming. It is anticipated that students who complete this course will understand the fields of web design and development and will have a good idea if they want to pursue this degree as a major.',
        technology: [
            'HTML',
            'CSS'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'CSE 111 students become more organized, efficient, and powerful computer programmers by learning to research and call functions written by others; to write, call , debug, and test their own functions; and to handle errors within functions. CSE 111 students write programs with functions to solve problems in many disciplines, including business, physical science, human performance, and humanities.',
        technology: [
            'Python'
        ],
        completed: true
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'CSE 210 students learn to solve problems by writing programs with classes. Topics include encapsulation, inheritance, and polymorphism. Object-oriented programming paradigms are introduced and used. CSE 210 students write programs with classes to solve problems in many disciplines, including business, physical science, human performance, and humanities.',
        technology: [
            'C#'
        ],
        completed: false
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience in Web Fundamentals and programming. Students will learn to create dynamic websites that use JavaScript to respond to events, update content, and create responsive user experiences.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: true
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Frontend Web Development I',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'This course builds on prior experience with Dynamic Web Fundamentals and programming. Students will focus on user experience, accessibility, compliance, performance optimization, and basic API usage.',
        technology: [
            'HTML',
            'CSS',
            'JavaScript'
        ],
        completed: false
    }
];

let currentFilter = 'all';
let filteredCourses = [...courses];

document.addEventListener('DOMContentLoaded', function() {

    setCurrentYear();

    setLastModified();

    initializeResponsiveMenu();

    initializeCourses();
});

function setCurrentYear() {
    const currentYearElement = document.getElementById('currentyear');
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

function initializeResponsiveMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

function initializeCourses() {
    displayCourses(courses);
    updateCreditsDisplay(courses);
    initializeFilterButtons();
}

function displayCourses(coursesToDisplay) {
    const coursesContainer = document.getElementById('courses-container');
    if (!coursesContainer) return;
    
    coursesContainer.innerHTML = '';
    
    coursesToDisplay.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesContainer.appendChild(courseCard);
    });
}

function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = `course-card ${course.completed ? 'completed' : ''}`;
    
    card.innerHTML = `
        <div class="course-subject">${course.subject}</div>
        <div class="course-number">${course.subject} ${course.number}</div>
        <div class="course-title">${course.title}</div>
        <div class="course-credits">${course.credits} Credits</div>
    `;
    
    return card;
}

function updateCreditsDisplay(coursesToDisplay) {
    const totalCreditsElement = document.getElementById('total-credits');
    if (!totalCreditsElement) return;
    
    const totalCredits = coursesToDisplay.reduce((total, course) => {
        return total + course.credits;
    }, 0);
    
    totalCreditsElement.textContent = totalCredits;
}

function initializeFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');

            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            filterCourses(filter);
        });
    });
}

function filterCourses(filter) {
    currentFilter = filter;
    
    if (filter === 'all') {
        filteredCourses = [...courses];
    } else {
        filteredCourses = courses.filter(course => course.subject === filter);
    }
    
    displayCourses(filteredCourses);
    updateCreditsDisplay(filteredCourses);
}

function getCompletedCourses() {
    return courses.filter(course => course.completed);
}

function getIncompleteCourses() {
    return courses.filter(course => !course.completed);
}

function getTotalCredits() {
    return courses.reduce((total, course) => total + course.credits, 0);
}

function getCompletedCredits() {
    return courses.filter(course => course.completed)
                  .reduce((total, course) => total + course.credits, 0);
}


function displayCourseDetails(course) {
    const courseDetails = document.getElementById('course-details');
    
    courseDetails.innerHTML = '';
    courseDetails.innerHTML = `
        <button id="closeModal">❌</button>
        <h2>${course.subject} ${course.number}</h2>
        <h3>${course.title}</h3>
        <p><strong>Credits</strong>: ${course.credits}</p>
        <p><strong>Certificate</strong>: ${course.certificate}</p>
        <p>${course.description}</p>
        <p><strong>Technologies</strong>: ${course.technology.join(', ')}</p>
    `;
    
    courseDetails.showModal();
    
    const closeModal = document.getElementById('closeModal');
    closeModal.addEventListener("click", () => {
        courseDetails.close();
    });
    
    courseDetails.addEventListener('click', (e) => {
        if (e.target === courseDetails) {
            courseDetails.close();
        }
    });
}

function createCourseCard(course) {
    const courseDiv = document.createElement('div');
    courseDiv.className = `course-card ${course.completed ? 'completed' : ''}`;
    
    courseDiv.innerHTML = `
        <div class="course-subject">${course.subject}</div>
        <div class="course-number">${course.number}</div>
        <div class="course-title">${course.title}</div>
        <div class="course-credits">${course.credits} Credits</div>
    `;
    
    courseDiv.addEventListener('click', () => {
        displayCourseDetails(course);
    });
    
    return courseDiv;
}

function addModalEventListeners(courses) {
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            displayCourseDetails(courses[index]);
        });
    });
}