/*
    Project Name: Wearable Sensor Group 7: Neuropulse
    Team Members: Om Agrawal, Derek Wang, Abhinav Kartik, Aaron Rogovoy
    Date: 6/3/2024
    Description: File for Firebase; set up buttons for Chart.JS
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getDatabase, ref, set, update, child, get, remove }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { updateDailyData, updateMonthlyData } from './chart.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSgK4oXAvW6L-GKt5n7REP-hTSQXc_J78",
  authDomain: "wearable-sensor-7.firebaseapp.com",
  databaseURL: "https://wearable-sensor-7-default-rtdb.firebaseio.com",
  projectId: "wearable-sensor-7",
  storageBucket: "wearable-sensor-7.appspot.com",
  messagingSenderId: "372835216898",
  appId: "1:372835216898:web:baec8373660bd9714ec11b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(); // Firebase authentication

// Return an instance of the database associated with your app
const db = getDatabase(app);

let currentUser = null; // Initialize currentUser to null

let isMonthlyView = false; // Track whether the monthly view is enabled

//----------------------- Get User Object ------------------------------//
function getUser() {
  // Grab value for the 'keep logged in' switch
  let keepLoggedIn = localStorage.getItem('keepLoggedIn');

  // Grab user information passed from signIn.js
  if (keepLoggedIn == "yes") {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } else {
    currentUser = JSON.parse(sessionStorage.getItem("user"));
  }
}


// Function to toggle between daily and monthly views
function toggleView() {
    isMonthlyView = !isMonthlyView;

    const datePicker = document.getElementById('datePicker');
    const monthPicker = document.getElementById('monthPicker');
    const toggleButton = document.getElementById('toggleView');

    if (isMonthlyView) {
        datePicker.style.display = 'none';
        monthPicker.style.display = 'block';
        toggleButton.textContent = 'Toggle Daily View';
        
        // Set the current month in New York time
        const currentMonth = new Date().toLocaleString('en-CA', { month: '2-digit', timeZone: 'America/New_York' });
        const currentYear = new Date().toLocaleString('en-CA', { year: 'numeric', timeZone: 'America/New_York' });
        document.getElementById('monthSelect').value = currentMonth;
        document.getElementById('yearSelect').value = currentYear;
        updateMonthlyData(`${currentYear}-${currentMonth}`);
    } else {
        datePicker.style.display = 'block';
        monthPicker.style.display = 'none';
        toggleButton.textContent = 'Toggle Monthly View';
        
        // Set the current date in New York time
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
        datePicker.value = today;
        updateDailyData(today);
    }
}

// Populate month and year selectors
function populateMonthYearSelectors() {
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = String(month).padStart(2, '0');
        option.textContent = new Date(2000, month - 1).toLocaleString('default', { month: 'long' });
        monthSelect.appendChild(option);
    }

    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Initial setup to show the current date in New York time on page load
window.addEventListener('load', function() {
  // ------------------------- Set Welcome Message -------------------------
  getUser();
  console.log("Window load event executed"); // Debugging log
  if (currentUser != null) {
    console.log("User is logged in"); // Debugging log
    // Update navbar

    // Update welcome message and profile name
    if (userDashboardName) {
      userDashboardName.textContent = currentUser.firstname;
    } 
    if (profileName) {
      profileName.textContent = currentUser.firstname;
    } 

    // Populate month and year selectors
    populateMonthYearSelectors();

    // Set the current date in New York time on page load
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    document.getElementById('datePicker').value = today;
    updateDailyData(today);
  }
});

// Add event listener for the toggle button
document.getElementById('toggleView').addEventListener('click', toggleView);

// Add event listener for date picker
document.getElementById('datePicker').addEventListener('change', (event) => {
    updateDailyData(event.target.value);
});

// Add event listener for month and year selectors
document.getElementById('monthSelect').addEventListener('change', () => {
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;
    updateMonthlyData(`${year}-${month}`);
});

document.getElementById('yearSelect').addEventListener('change', () => {
    const month = document.getElementById('monthSelect').value;
    const year = document.getElementById('yearSelect').value;
    updateMonthlyData(`${year}-${month}`);
});

let collectingData = false;

// Buttons to start and stop data collection
document.getElementById("startCollection").onclick = function () {
  startDataCollection();
};

document.getElementById("stopCollection").onclick = function () {
  stopDataCollection();
};

// Start collection using Arduino
function startDataCollection() {
  fetch('/startDataCollection', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      collectingData = data.dataCollection;
      if (collectingData) {
          alert("Data collection started");
          sendDataCollectionConfig();
      } else {
          alert("Failed to start data collection");
      }
  })
  .catch(error => {
      console.error('Error starting data collection:', error);
  });
}

// Stop collection when pressed
function stopDataCollection() {
  fetch('/stopDataCollection', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      collectingData = data.dataCollection;
      if (!collectingData) {
          alert("Data collection stopped");
      } else {
          alert("Failed to stop data collection");
      }
  })
  .catch(error => {
      console.error('Error stopping data collection:', error);
  });
}

// Send Firebase data to the website
function sendDataCollectionConfig() {
  const fbcfg = { ...firebaseConfig, userID: currentUser.uid };

  fetch('/EMGSensor', {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(fbcfg)
  })
  .then(response => response.text())
  .then(data => {
      console.log("Firebase configuration sent:", data);
  })
  .catch(error => {
      console.error("Error sending Firebase configuration:", error);
  });
}
