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
    loadMessages();
}

let lastMessageKey = '';

function loadMessages() {
    const messagesRef = database.ref('messages').orderByChild('timestamp');
    messagesRef.on('child_added', snapshot => {
        const message = snapshot.val();
        const messageKey = snapshot.key;

        if (messageKey !== lastMessageKey) {
            displayMessage(message.username, message.text);
            lastMessageKey = messageKey;
        }
    });
}

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const text = messageInput.value;
    const user = auth.currentUser;

    if (text.trim() === '') {
        return; // Do not send empty messages
    }

    database.ref('users/' + user.uid).once('value')
        .then(snapshot => {
            const userData = snapshot.val();
            const username = userData.username;
            return database.ref('messages').push({
                username: username,
                text: text,
                timestamp: Date.now(),
                userId: user.uid
            });
        })
        .then(() => {
            messageInput.value = '';
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
}

function displayMessage(username, text) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<span class="username" onclick="showUserInfo('${username}')">${username}</span><div class="message-text">${text}</div>`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showUserInfo(username) {
    database.ref('users').orderByChild('username').equalTo(username).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = Object.values(snapshot.val())[0];
                alert(`Username: ${username}\nUser ID: ${userData.userId}\nJoined: ${userData.joined}`);
            } else {
                alert('User not found');
            }
        })
        .catch(error => {
            console.error('Error fetching user info:', error);
        });
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
        showChat();
    } else {
        showLogin();
    }
});
