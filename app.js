
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyBLDbCmryVHE88d4CAwVpsFUlQQljdobtA",
    authDomain: "locc-6c202.firebaseapp.com",
    projectId: "locc-6c202",
    storageBucket: "locc-6c202.appspot.com",
    messagingSenderId: "383538729956",
    appId: "1:383538729956:web:9812862b608aeab72cadf1",
    measurementId: "G-BKBFG279BW"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const messagesRef = ref(database, 'messages');

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messagesDiv = document.getElementById('messages');

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim() !== "") {
        push(messagesRef, {
            text: message,
            timestamp: Date.now()
        });
        messageInput.value = "";
    }
});

onValue(messagesRef, (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val();
        const messageElement = document.createElement('div');
        messageElement.textContent = message.text;
        messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
