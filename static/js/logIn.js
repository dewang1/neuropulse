/*
    Project Name: Wearable Sensor Group 7: Neuropulse
    Team Members: Om Agrawal, Derek Wang, Abhinav Kartik, Aaron Rogovoy
    Date: 6/3/2024
    Description: Script for logging in a user from login page
*/

// ---------------------- Firebase configuration ----------------------
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

// ---------------------- Sign-In User ---------------------------------------//
document.getElementById("loginForm").onsubmit = function (e) {
  // Prevent page from refreshing
  e.preventDefault();

  // Form data uses the name attribute of input elements
  const formData = new FormData(e.target);
  const data = {};
  for (let field of formData) {
    const [key, value] = field;
    data[key] = value;
  }

  // Get user's email and password for sign in
  const email = data.email;
  const password = data.password;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Create user credential and store user ID
      const user = userCredential.user;

      // Log sign-in date in Database
      // 'Update" function wil only add the last_login infor and won't overwrite everuthing else
      let logDate = new Date();
      update(ref(db, "users/" + user.uid + "/accountInfo"), {
        last_login: logDate,
      })
        .then(() => {
          // User signed in successfully
          alert("User signed in successfully!");

          // Get snapshot of all the user info (including the uid) that will be
          // passed to the login function and stored in session or local storage
          get(ref(db, "users/" + user.uid + "/accountInfo"))
            .then((snapshot) => {
              if (snapshot.exists()) {
                logIn(snapshot.val(), firebaseConfig); // logIn function will keep user logged in
              } else {
                console.log("User does not exist.");
              }
            })
            .catch((error) => {
              console.log(error);
            });
        })
        .catch((error) => {
          // Sign-in failed...
          alert(error);
        });
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(errorMessage);
    });
};

// ---------------- Keep User Logged In ----------------------------------
function logIn(user, fbcfg){  // User = user info, fbcfg = Firebase configuration
  let keepLoggedIn = document.getElementById('keepLoggedInSwitch').ariaChecked;

  fbcfg.userID = user.uid;  // Add userID to FB configuration so that is passed to Flask

  // Session storage is temporary (only while active session)
  // Info. saved as a string (must convert JS object to string)
  // Session storage will be cleared with a signOut() function in home.js file
  if(!keepLoggedIn){
      sessionStorage.setItem('user', JSON.stringify(user));
      // Send Firebase configuration and unique user ID to app.py using POST method
      fetch('/EMGSensor', {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify(fbcfg),
      }).then(() => {
        window.location="home" // Redirect browser to home.html
      })
  }

  // Local storage is permanent (keep user logged in if browser is closed)
  // Local storage will be cleared with signOut() function
  else{
      localStorage.setItem('keepLoggedIn', 'yes');
      localStorage.setItem('user', JSON.stringify(user));

      // Send Firebase configuration and unique user ID to app.py using POST method
      fetch('/EMGSensor', {
        "method": "POST",
        "headers": {"Content-Type": "application/json"},
        "body": JSON.stringify(fbcfg),
      }).then(() => {
        window.location="home" // Redirect browser to home.html
      })
  }
}