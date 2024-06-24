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
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

const loginDiv = document.getElementById('login');
const chatDiv = document.getElementById('chat');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messagesDiv = document.getElementById('messages');

const usersRef = database.ref('users');
const messagesRef = database.ref('messages');

let currentUser = null; // To store the current logged-in user
const MAX_MESSAGE_LENGTH = 1000; // Character limit for messages

// Function to clear message input and reset focus
const clearMessageInput = () => {
    messageInput.value = '';
    messageInput.focus();
};

// Function to add a message to the database
const addMessage = (text, user) => {
    messagesRef.push({
        text: text,
        timestamp: Date.now(),
        uid: user.uid,
        username: user.username
    });
};

// Function to edit a message in the database
const editMessage = (messageId, newText) => {
    messagesRef.child(messageId).update({
        text: newText
    });
};

// Function to delete a message from the database
const deleteMessage = (messageId) => {
    messagesRef.child(messageId).remove();
};

// Function to display messages
const displayMessages = (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val();
        const messageId = childSnapshot.key;
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        // Display username and message text
        const messageText = document.createElement('span');
        messageText.textContent = `${message.username}: ${message.text}`;
        messageText.style.maxWidth = '100%';
        messageText.style.wordWrap = 'break-word';

        // Edit and delete buttons (only visible to the original sender)
        if (currentUser && message.uid === currentUser.uid) {
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('button');
            editButton.addEventListener('click', () => {
                const newText = prompt('Edit your message:', message.text);
                if (newText !== null && newText.trim() !== '') {
                    editMessage(messageId, newText);
                }
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('button');
            deleteButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this message?')) {
                    deleteMessage(messageId);
                }
            });

            messageElement.appendChild(editButton);
            messageElement.appendChild(deleteButton);
        }

        // Append message elements to the message div
        messageElement.appendChild(messageText);
        messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// Event listeners for buttons
loginButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        alert('Username and password are required.');
        return;
    }

    auth.signInWithEmailAndPassword(`${username}@example.com`, password)
        .then(userCredential => {
            currentUser = userCredential.user;
            currentUser.username = username;
            loginDiv.style.display = 'none';
            chatDiv.style.display = 'block';
            loadMessages();
        })
        .catch(error => alert(error.message));
});

signupButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        alert('Username and password are required.');
        return;
    }

    auth.createUserWithEmailAndPassword(`${username}@example.com`, password)
        .then(userCredential => {
            const user = userCredential.user;
            user.updateProfile({ displayName: username });
            usersRef.child(user.uid).set({ username: username });
        })
        .catch(error => alert(error.message));
});

logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        loginDiv.style.display = 'block';
        chatDiv.style.display = 'none';
        currentUser = null;
        messagesDiv.innerHTML = ''; // Clear messages when logged out
    });
});

sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message === '') {
        return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        alert(`Message should not exceed ${MAX_MESSAGE_LENGTH} characters.`);
        return;
    }

    if (currentUser) {
        addMessage(message, currentUser);
        clearMessageInput();
    } else {
        alert('You must be logged in to send messages.');
    }
});

// Load and display messages
const loadMessages = () => {
    messagesRef.on('value', snapshot => {
        displayMessages(snapshot);
    });
};

// Authentication state change listener
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        usersRef.child(user.uid).once('value').then(snapshot => {
            currentUser.username = snapshot.val().username;
            loginDiv.style.display = 'none';
            chatDiv.style.display = 'block';
            loadMessages();
        });
    } else {
        currentUser = null;
        loginDiv.style.display = 'block';
        chatDiv.style.display = 'none';
    }
});
