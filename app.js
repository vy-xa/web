// Firebase configuration
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
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const analytics = firebase.analytics();

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

const messagesRef = database.ref('messages');

loginButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
});

signupButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
        .catch(error => alert(error.message));
});

logoutButton.addEventListener('click', () => {
    auth.signOut();
});

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== "") {
        messagesRef.push({
            text: message,
            timestamp: Date.now(),
            user: auth.currentUser.email
        });
        messageInput.value = "";
    }
});

auth.onAuthStateChanged(user => {
    if (user) {
        loginDiv.style.display = 'none';
        chatDiv.style.display = 'block';
    } else {
        loginDiv.style.display = 'block';
        chatDiv.style.display = 'none';
    }
});

messagesRef.on('value', snapshot => {
    messagesDiv.innerHTML = '';
    snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val();
        const messageElement = document.createElement('div');
        messageElement.textContent = `${message.user}: ${message.text}`;
        messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
