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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const database = firebase.database();
let currentUser;

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

    // Check if username contains at least one character
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
    loadUsers();
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
            userList.appendChild(userElement);
        });
    });
}

function startPrivateChat(userId, username) {
    document.getElementById('private-chat-page').style.display = 'block';
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

    if (text.trim() === '') {
        return; // Do not send empty messages
    }

    const receiverId = document.querySelector('.user span.active').dataset.userid;

    const messageData = {
        text: text,
        senderId: currentUser.uid,
        timestamp: Date.now()
    };

    database.ref('privateMessages').child(currentUser.uid).child(receiverId).push(messageData);
    database.ref('privateMessages').child(receiverId).child(currentUser.uid).push(messageData);

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
