/*
    Project Name: Wearable Sensor Group 7: Neuropulse
    Team Members: Om Agrawal, Derek Wang, Abhinav Kartik, Aaron Rogovoy
    Date: 6/3/2024
    Description: Add user registration functionality to the sign-up page
*/

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getDatabase, ref, set, update, child, get }
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

// Initialize Firebase Authentication
const auth = getAuth();

// Returns instance of your apps' FRD
const db = getDatabase(app);

// --------------- Check for null, empty ("") or all spaces only ------------//
function isEmptyorSpaces(str) {
  return str === null || str.match(/^ *$/) !== null;
}

// ---------------------- Validate Registration Data -----------------------//
function validation(firstName, lastName, email, password) {
  let fNameRegex = /^[a-zA-Z]+$/;
  let lNameRegex = /^[a-zA-Z]+$/;
  let emailRegex = /^[a-zA-Z0-9]+@ctemc\.org$/;

  if (
    isEmptyorSpaces(firstName) ||
    isEmptyorSpaces(lastName) ||
    isEmptyorSpaces(email) ||
    isEmptyorSpaces(password)
  ) {
    alert("Please complete all fields.");
    return false;
  }

  if (!fNameRegex.test(firstName)) {
    alert("The first name should only contain letters.");
    return false;
  }
  if (!lNameRegex.test(lastName)) {
    alert("The last name should only contain letters.");
    return false;
  }
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email. Domain must be ctemc.org.");
    return false;
  }
  return true;
}

// --------------- Password Encryption -------------------------------------//
function encryptPass(password) {
  let encrypted = CryptoJS.AES.encrypt(password, password);
  return encrypted.toString();
}

// ---------------- Register new user -------------------------------//
document.getElementById("signUpForm").onsubmit = function (e) {
  // Prevent page from refreshing
  e.preventDefault();
  
  // Form data uses the name attribute of input elements
  const formData = new FormData(e.target);
  const data = {};
  for (let field of formData) {
    const [key, value] = field;
    data[key] = value;
  }

  // Get details of new account
  const firstName = data.firstName;
  const lastName = data.lastName;
  const email = data.email;
  const password = data.password;

  // Firebase requires a password of at least 6 characters
  // Validate the user inputs
  if (!validation(firstName, lastName, email, password)) {
    return;
  }

  // Create new app user using email/password auth
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Create user credential
      const user = userCredential.user;

      // Add user account info to the FRD
      // set() function will create a new ref. or completely replace existing one
      // Each new user will be placed under the 'users' node
      set(ref(db, "users/" + user.uid + "/accountInfo"), {
        uid: user.uid, // save userID for home.js reference
        email: email,
        password: encryptPass(password),
        firstname: firstName,
        lastname: lastName,
      })
        .then(() => {
          // Data saved successfully
          alert("User created succesfully!");
          location = "logIn"; // Redirect to login page
        })
        .catch((error) => {
          // The write failed...
          alert(error);
        });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });
};