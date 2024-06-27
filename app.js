const firebaseConfig = {
  apiKey: "AIzaSyBLDbCmryVHE88d4CAwVpsFUlQQljdobtA",
  authDomain: "locc-6c202.firebaseapp.com",
  databaseURL: "https://locc-6c202-default-rtdb.firebaseio.com",
  projectId: "locc-6c202",
  storageBucket: "locc-6c202.appspot.com",
  messagingSenderId: "383538729956",
  appId: "1:383538729956:web:9812862b608aeab72cadf1",
  measurementId: "G-BKBFG279BW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
let currentUser;
let currentChatUserId = null;

function showLogin() {
    document.getElementById('login-page').style.display = 'block';
    document.getElementById('register-page').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'block';
}

function login() {
    const usernameEmail = document.getElementById('username-email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(usernameEmail, password)
        .then(userCredential => {
            currentUser = userCredential.user;
            showChat();
        })
        .catch(error => {
            console.error('Error logging in:', error);
        });
}

function register() {
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!username.trim()) {
        alert('Username must include at least one character.');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            const user = userCredential.user;
            return database.ref('users/' + user.uid).set({
                username: username,
                email: email,
                joined: new Date().toISOString()
            });
        })
        .then(() => {
            showChat();
        })
        .catch(error => {
            console.error('Error registering:', error);
        });
}

function showChat() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('register-page').style.display = 'none';
    document.getElementById('chat-page').style.display = 'flex';
    showPublicChat();
    loadUsers();
}

function showPublicChat() {
    currentChatUserId = null;
    document.getElementById('public-chat-page').style.display = 'flex';
    document.getElementById('private-chat-page').style.display = 'none';
    document.getElementById('public-chat-label').textContent = 'Public Chat';
    loadPublicMessages();
}

function showDMs() {
    currentChatUserId = null;
    document.getElementById('public-chat-page').style.display = 'none';
    document.getElementById('private-chat-page').style.display = 'flex';
    document.getElementById('private-chat-label').textContent = 'Direct Messages';
}

function loadUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';
    
    database.ref('users').on('value', snapshot => {
        snapshot.forEach(childSnapshot => {
            const userData = childSnapshot.val();
            const userElement = document.createElement('div');
            userElement.classList.add('user');
            userElement.innerHTML = `<span onclick="startPrivateChat('${childSnapshot.key}', '${userData.username}')">${userData.username}</span>`;
            userElement.dataset.userid = childSnapshot.key; // Set user ID on the element
            userList.appendChild(userElement);
        });
    });
}

function startPrivateChat(userId, username) {
    currentChatUserId = userId;
    document.getElementById('private-chat-page').style.display = 'flex';
    document.getElementById('private-chat-label').textContent = `Chat with ${username}`;
    document.getElementById('private-messages').innerHTML = '';

    const privateMessagesRef = database.ref('privateMessages').child(currentUser.uid).child(userId);
    privateMessagesRef.on('child_added', snapshot => {
        const message = snapshot.val();
        displayPrivateMessage(username, message.text, message.senderId === currentUser.uid);
    });
}

function sendPrivateMessage() {
    const messageInput = document.getElementById('private-message-input');
    const text = messageInput.value;

    if (text.trim() === '' || currentChatUserId === null) {
        return; // Do not send empty messages or if no user is selected
    }

    const messageData = {
        text: text,
        senderId: currentUser.uid,
        timestamp: Date.now()
    };

    database.ref('privateMessages').child(currentUser.uid).child(currentChatUserId).push(messageData);
    database.ref('privateMessages').child(currentChatUserId).child(currentUser.uid).push(messageData);

    messageInput.value = '';
}

function displayPrivateMessage(username, text, isSender) {
    const messagesDiv = document.getElementById('private-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (isSender) {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
    }
    messageElement.innerHTML = `<span class="username">${username}</span><div class="message-text">${text}</div>`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function loadPublicMessages() {
    const publicMessagesRef = database.ref('publicMessages').orderByChild('timestamp');
    const messagesDiv = document.getElementById('public-messages');
    messagesDiv.innerHTML = '';
    
    publicMessagesRef.on('child_added', snapshot => {
        const message = snapshot.val();
        displayPublicMessage(message.username, message.text);
    });
}

function sendPublicMessage() {
    const messageInput = document.getElementById('public-message-input');
    const text = messageInput.value;
    const user = auth.currentUser;

    if (text.trim() === '') {
        return; // Do not send empty messages
    }

    database.ref('users/' + user.uid).once('value')
        .then(snapshot => {
            const username = snapshot.val().username;
            return database.ref('publicMessages').push({
                username: username,
                text: text,
                timestamp: Date.now()
            });
        })
        .then(() => {
            messageInput.value = '';
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
}

function displayPublicMessage(username, text) {
    const messagesDiv = document.getElementById('public-messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<span class="username">${username}</span><div class="message-text">${text}</div>`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function logout() {
    auth.signOut()
        .then(() => {
            showLogin();
        })
        .catch(error => {
            console.error('Error logging out:', error);
        });
}

auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        showChat();
    } else {
        showLogin();
    }
});
