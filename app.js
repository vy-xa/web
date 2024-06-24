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
        user: user
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
    messagesDiv.innerHTML = ''; // Clear previous messages

    snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val();
        const messageId = childSnapshot.key;
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        // Display username and message text
        const messageText = document.createElement('span');
        messageText.classList.add('message-text');
        messageText.textContent = `${message.user}: ${message.text}`;

        // Ensure message text does not exceed maximum length
        messageText.style.maxWidth = '100%';
        messageText.style.wordWrap = 'break-word';

        // Append message text to message element
        messageElement.appendChild(messageText);

        // Buttons container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');

        // Edit button (only visible to the original sender)
        if (currentUser && message.user === currentUser.displayName) {
            const editButton = document.createElement('button');
            editButton.classList.add('button', 'edit-button');
            editButton.innerHTML = '<img src="edit.png" alt="Edit">';
            editButton.addEventListener('click', () => {
                const newText = prompt('Edit your message:', message.text);
                if (newText !== null && newText.trim() !== '') {
                    editMessage(messageId, newText);
                }
            });
            buttonsDiv.appendChild(editButton);
        }

        // Delete button (only visible to the original sender)
        if (currentUser && message.user === currentUser.displayName) {
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('button', 'delete-button');
            deleteButton.innerHTML = '<img src="remove.png" alt="Delete">';
            deleteButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this message?')) {
                    deleteMessage(messageId);
                }
            });
            buttonsDiv.appendChild(deleteButton);
        }

        // Append buttons to message element
        messageElement.appendChild(buttonsDiv);

        // Append message element to messagesDiv
        messagesDiv.appendChild(messageElement);
    });

    // Scroll to the bottom of messagesDiv
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};


// Event listeners for buttons
loginButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(`${username}@chatapp.com`, password)
        .catch(error => alert(error.message));
});

signupButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!(/[a-zA-Z0-9]/.test(username))) {
        alert('Username must contain at least one letter or number.');
        return;
    }

    auth.createUserWithEmailAndPassword(`${username}@chatapp.com`, password)
        .then(userCredential => {
            // Save the username in the Firebase user profile
            const user = userCredential.user;
            return user.updateProfile({
                displayName: username
            }).then(() => {
                // Save the username in the database
                usersRef.child(user.uid).set({
                    username: username,
                    email: `${username}@chatapp.com`
                });
            });
        })
        .catch(error => alert(error.message));
});

logoutButton.addEventListener('click', () => {
    auth.signOut();
});

sendButton.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message === '') {
        return;
    }

    // Check message length
    if (message.length > MAX_MESSAGE_LENGTH) {
        alert(`Message should not exceed ${MAX_MESSAGE_LENGTH} characters.`);
        return;
    }

    // Prevent message flooding (e.g., limit to one message every 2 seconds)
    const now = Date.now();
    if (currentUser && currentUser.lastMessageTime && (now - currentUser.lastMessageTime < 2000)) {
        alert('Please wait a moment before sending another message.');
        return;
    }

    if (currentUser) {
        addMessage(message, currentUser.displayName);
        currentUser.lastMessageTime = now; // Update last message time
        clearMessageInput();
    } else {
        alert('You must be logged in to send messages.');
    }
});

// Authentication state change listener
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loginDiv.style.display = 'none';
        chatDiv.style.display = 'block';

        // Display welcome message
        const welcomeMessage = document.createElement('div');
        welcomeMessage.textContent = `Welcome, ${user.displayName}!`;
        messagesDiv.appendChild(welcomeMessage);

        // Load and display messages
        messagesRef.on('value', snapshot => {
            displayMessages(snapshot);
        });

    } else {
        currentUser = null;
        loginDiv.style.display = 'block';
        chatDiv.style.display = 'none';
        messagesDiv.innerHTML = ''; // Clear messages when logged out
    }
});
