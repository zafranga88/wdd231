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
   // card build code goes here
 });
}

// Call the function to test
getProphetData();