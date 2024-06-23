document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const sendMessageForm = document.getElementById('sendMessageForm');
    const messageList = document.getElementById('messageList');

    // Register Form Submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerForm.username.value;
        const password = registerForm.password.value;
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const result = await response.text();
            alert(result);
        } catch (error) {
            console.error('Error:', error);
            alert('Error registering user');
        }
    });

    // Login Form Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                alert('Login successful');
                // Optionally: Redirect to another page or show logged-in UI
            } else {
                alert('Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error logging in');
        }
    });

    // Send Message Form Submit
    sendMessageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const receiver = sendMessageForm.receiver.value;
        const content = sendMessageForm.content.value;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token
                },
                body: JSON.stringify({ receiverId: receiver, content })
            });
            const result = await response.text();
            alert(result);
            // Optionally: Clear form fields or update UI
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending message');
        }
    });

    // Function to fetch and display messages
    async function fetchMessages() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/messages', {
                headers: {
                    'Authorization': token
                }
            });
            const messages = await response.json();
            messageList.innerHTML = ''; // Clear previous messages
            messages.forEach(message => {
                const li = document.createElement('li');
                li.textContent = `From: ${message.sender}, Message: ${message.content}`;
                messageList.appendChild(li);
            });
        } catch (error) {
            console.error('Error:', error);
            alert('Error fetching messages');
        }
    }

    // Initial fetch of messages (if user is logged in)
    const token = localStorage.getItem('token');
    if (token) {
        fetchMessages();
    }
});
