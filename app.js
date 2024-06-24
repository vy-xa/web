import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, push } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyBLDbCmryVHE88d4CAwVpsFUlQQljdobtA",
    authDomain: "locc-6c202.firebaseapp.com",
    projectId: "locc-6c202",
    storageBucket: "locc-6c202.appspot.com",
    messagingSenderId: "383538729956",
    appId: "1:383538729956:web:9812862b608aeab72cadf1",
    measurementId: "G-BKBFG279BW",
    databaseURL: "https://locc-6c202-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const analytics = getAnalytics(app);

const loginDiv = document.getElementById('login');
const chatDiv = document.getElementById('chat');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messagesDiv = document.getElementById('messages');

const messagesRef = ref(database, 'messages');

loginButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    signInWithEmailAndPassword(auth, email, password)
        .catch(error => alert(error.message));
});

signupButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    createUserWithEmailAndPassword(auth, email, password)
        .catch(error => alert(error.message));
});

logoutButton.addEventListener('click', () => {
    signOut(auth);
});

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== "") {
        push(messagesRef, {
            text: message,
            timestamp: Date.now(),
            user: auth.currentUser.email
        });
        messageInput.value = "";
    }
});

onAuthStateChanged(auth, user => {
    if (user) {
        loginDiv.style.display = 'none';
        chatDiv.style.display = 'block';
    } else {
        loginDiv.style.display = 'block';
        chatDiv.style.display = 'none';
    }
});

onValue(messagesRef, snapshot => {
    messagesDiv.innerHTML = '';
    snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val();
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.user}: ${message.text}`;
        messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
