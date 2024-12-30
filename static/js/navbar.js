/*
    Project Name: Wearable Sensor Group 7: Neuropulse
    Team Members: Om Agrawal, Derek Wang, Abhinav Kartik, Aaron Rogovoy
    Date: 6/3/2024
    Description: Update navbar when logged in and add sign out functionality
*/

// ----------------- Page Loaded After User Sign-in -------------------------//

// ----------------- Firebase Setup & Initialization ------------------------//

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getDatabase, ref, set, update, child, get, remove }
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

// Function to sign out the user
function signOutUser() {
  sessionStorage.removeItem("user");  // Clear session storage
  localStorage.removeItem("user");    // Clear local storage
  localStorage.removeItem("keepLoggedIn");

  // Stop data collection
  fetch('/stopDataCollection', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
  }).then(() => {
      // Clear Firebase config
      const fbcfg = {};
      fetch('/EMGSensor', {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(fbcfg)
      }).then(() => {
          // Sign out from Firebase Auth
          signOut(auth).then(() => {
              // Sign-out successful
              window.location = "logIn";  // Redirect to login page
          }).catch((error) => {
              alert("Error: " + error);
          });
      }).catch((error) => {
          console.error("Error clearing Firebase configuration:", error);
      });
  }).catch((error) => {
      console.error('Error stopping data collection:', error);
  });
}


// Function to update the navbar based on user status. Switches log in and sign up to greeting and log out button
function updateNavbar() {
  // Get login and sign up link elements
  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");

  getUser();
  // If user is logged in, display greeting and log out button
  if (currentUser != null) {
    loginLink.innerHTML = '';
    const userMessage = document.createElement("div");
    userMessage.className = "nbMenuItem";
    userMessage.textContent = `Hello, ${currentUser.firstname}!`;
    loginLink.appendChild(userMessage);

    signupLink.innerHTML = '';
    const logoutButton = document.createElement("button");
    logoutButton.className = "btn signup";
    logoutButton.textContent = "Log out";
    logoutButton.onclick = signOutUser;
    signupLink.appendChild(logoutButton);
  }
}

// Function to change logo home link from index page to /home if user is logged in
function updateNeuroPulseLinks() {
  const neuroPulseLinks = document.querySelectorAll(`a[href="{{url_for('index')}}"], a[href="/"]`);
  if (getUser()) {
    neuroPulseLinks.forEach(link => {
      link.href = "/home";
    });
  }
}

// Run the updateNavbar function and updateNeuroPulseLinks on window load
window.addEventListener('load', function() {
  updateNavbar();
  updateNeuroPulseLinks();
});
