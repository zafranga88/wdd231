// 2. Declare a const variable named "url" that contains the URL string
const url = 'https://byui-cse.github.io/cse-ww-program/data/latter-day-prophets.json';

// 3. Declare a const variable name "cards" that selects the HTML div element
const cards = document.querySelector('#cards');

// 4-8. Create an async function named "getProphetData"
async function getProphetData() {
 // 5. Store the response from the fetch() method
 const response = await fetch(url);
 
 // 6. Convert the response to a JSON object
 const data = await response.json();
 
 // 7. Add a console.table() expression method to check the data
 console.table(data.prophets);
 
 // 10. Call the displayProphets function with data.prophets
 displayProphets(data.prophets);
}

// 11. Define a function expression named "displayProphets"
const displayProphets = (prophets) => {
 // 12. Use a forEach loop to process each prophet record
 prophets.forEach((prophet) => {
   // 1. Create a section element and store it in a variable named card
   const card = document.createElement('section');
   
   // 2. Create an h2 element and store it in a variable named "fullName"
   const fullName = document.createElement('h2');
   
   // 3. Create an img element and store it in a variable named "portrait"
   const portrait = document.createElement('img');
   
   // 4. Populate the heading element with the prophet's full name using a template string
   fullName.textContent = `${prophet.name} ${prophet.lastname}`;
   
   // 5. Build the image element by setting the attributes using setAttribute()
   portrait.setAttribute('src', prophet.imageurl);
   portrait.setAttribute('alt', `${prophet.name} ${prophet.lastname}`);
   portrait.setAttribute('loading', 'lazy');
   portrait.setAttribute('width', '340');
   portrait.setAttribute('height', '440');
   
   // Create birth information container
   const birthInfo = document.createElement('div');
   birthInfo.className = 'birth-info';
   
   // Create and populate birth date paragraph
   const birthDate = document.createElement('p');
   birthDate.innerHTML = `<strong>Date of Birth:</strong> ${prophet.birthdate}`;
   
   // Create and populate birth place paragraph
   const birthPlace = document.createElement('p');
   birthPlace.innerHTML = `<strong>Place of Birth:</strong> ${prophet.birthplace}`;
   
   // Add birth information to the birth info container
   birthInfo.appendChild(birthDate);
   birthInfo.appendChild(birthPlace);
   
   // Using appendChild() on the section element named "card", add the heading, image, and birth info
   card.appendChild(fullName);
   card.appendChild(portrait);
   card.appendChild(birthInfo);
   
   // Finally, add the section card to the "cards" div
   cards.appendChild(card);
 });
}

// Call the function to test
getProphetData();