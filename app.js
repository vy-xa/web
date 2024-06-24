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

let currentUser = null;

const MAX_MESSAGE_LENGTH = 1000;

const clearMessageInput = () => {
    messageInput.value = '';
    messageInput.focus();
};

const addMessage = (text, user) => {
    messagesRef.push({
        text: text,
        timestamp: Date.now(),
        user: user
    });
};

const editMessage = (messageId, newText) => {
    messagesRef.child(messageId).update({
        text: newText
    });
};

const deleteMessage = (messageId) => {
    messagesRef.child(messageId).remove();
};

const displayMessages = (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach(childSnapshot => {
        const message = childSnapshot.val();
        const messageId = childSnapshot.key;
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        const messageText = document.createElement('span');
        messageText.classList.add('message-text');
        messageText.textContent = `${message.user}: ${message.text}`;

        messageText.style.maxWidth = '100%';
        messageText.style.wordWrap = 'break-word';

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('buttons');

        if (currentUser && message.user === currentUser.displayName) {
            const editButton = document.createElement('button');
            editButton.classList.add('button');
            const editImg = document.createElement('img');
            editImg.src = 'edit.png';
            editButton.appendChild(editImg);
            editButton.addEventListener('click', () => {
                const newText = prompt('Edit your message:', message.text);
                if (newText !== null && newText.trim() !== '') {
                    editMessage(messageId, newText);
                }
            });
            buttonsDiv.appendChild(editButton);
        }

        if (currentUser && message.user === currentUser.displayName) {
            const deleteButton = document.createElement('button');
            deleteButton.classList.add('button');
            const deleteImg = document.createElement('img');
            deleteImg.src = 'remove.png';
            deleteButton.appendChild(deleteImg);
            deleteButton.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this message?')) {
                    deleteMessage(messageId);
                }
            });
            buttonsDiv.appendChild(deleteButton);
        }

        messageElement.appendChild(buttonsDiv);
        messageElement.appendChild(messageText);
        messagesDiv.appendChild(messageElement);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

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
            const user = userCredential.user;
            return user.updateProfile({
                displayName: username
            }).then(() => {
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

    if (message.length > MAX_MESSAGE_LENGTH) {
        alert(`Message should not exceed ${MAX_MESSAGE_LENGTH} characters.`);
        return;
    }

    const now = Date.now();
    if (currentUser && currentUser.lastMessageTime && (now - currentUser.lastMessageTime < 2000)) {
        alert('Please wait a moment before sending another message.');
        return;
    }

    if (currentUser) {
        addMessage(message, currentUser.displayName);
        currentUser.lastMessageTime = now;
        clearMessageInput();
    } else {
        alert('You must be logged in to send messages.');
    }
});

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        loginDiv.style.display = 'none';
        chatDiv.style.display = 'block';

        const welcomeMessage = document.createElement('div');
        welcomeMessage.textContent = `Welcome, ${user.displayName}!`;
        messagesDiv.appendChild(welcomeMessage);

        messagesRef.on('value', snapshot => {
            displayMessages(snapshot);
        });

    } else {
        currentUser = null;
        loginDiv.style.display = 'block';
        chatDiv.style.display = 'none';
        messagesDiv.innerHTML = '';
    }
});
