const firebase = require("firebase/compat/app");
require("firebase/compat/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCXO4_JqgG77Iyf6q5Op4hq0z_Dos9_7G4",
  authDomain: "chatancrit.firebaseapp.com",
  projectId: "chatancrit",
  storageBucket: "chatancrit.appspot.com",
  messagingSenderId: "720988224239",
  appId: "1:720988224239:web:a44950f70c891416a4791a",
  measurementId: "G-BB4RB1YZF0"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig),
db = firebase.firestore();

module.exports = db;