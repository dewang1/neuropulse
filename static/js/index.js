/*
    Project Name: Wearable Sensor Group 7: Neuropulse
    Team Members: Om Agrawal, Derek Wang, Abhinav Kartik, Aaron Rogovoy
    Date: 6/3/2024
    Description: Set up redirection function for index page to redirect logged in user to home page
*/

// ----------------- Firebase Setup & Initialization ------------------------//

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth} 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getDatabase}
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// Function to get user from local/session storage
function getUser() {
  let keepLoggedIn = localStorage.getItem('keepLoggedIn');
  if (keepLoggedIn == "yes") {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } else {
    currentUser = JSON.parse(sessionStorage.getItem("user"));
  }

  console.log("Current User:", currentUser); // Debugging log
  return currentUser != null;
}

// Redirect to /home if user is logged in
function redirectToHomeIfLoggedIn() {
  if (getUser()) {
    window.location.href = "/home";
  }
}

// Run the redirection function and updateNavbar on window load
window.addEventListener('load', function() {
  redirectToHomeIfLoggedIn();
  updateNavbar();
});