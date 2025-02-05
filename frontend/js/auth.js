const API_URL = 'http://localhost:5000/api';

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user && window.location.href.includes('login.html') || 
        user && window.location.href.includes('signup.html')) {
        window.location.href = 'chat.html';
    } else if (!user && window.location.href.includes('chat.html')) {
        window.location.href = 'login.html';
    }
}

// Handle signup
if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('username').value,
            firstname: document.getElementById('firstname').value,
            lastname: document.getElementById('lastname').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Signup successful! Please login.');
                window.location.href = 'login.html';
            } else {
                alert(data.msg || 'Signup failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Signup failed');
        }
    });
}

// Handle login
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(data));
                window.location.href = 'chat.html';
            } else {
                alert(data.msg || 'Login failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Login failed');
        }
    });
}

// Check authentication status when page loads
checkAuth(); 