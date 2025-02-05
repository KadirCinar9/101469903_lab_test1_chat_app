const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testBackend = async () => {
    try {
        // Test user signup
        console.log('Testing user signup...');
        const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
            username: 'testuser',
            firstname: 'Test',
            lastname: 'User',
            password: 'password123'
        });
        console.log('Signup response:', signupResponse.data);

        // Test user login
        console.log('\nTesting user login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            username: 'testuser',
            password: 'password123'
        });
        console.log('Login response:', loginResponse.data);

        // Test group message
        console.log('\nTesting group message...');
        const groupMessageResponse = await axios.post(`${API_URL}/messages/group`, {
            from_user: 'testuser',
            room: 'general',
            message: 'Hello, this is a test message!'
        });
        console.log('Group message response:', groupMessageResponse.data);

        // Test get group messages
        console.log('\nTesting get group messages...');
        const getGroupMessages = await axios.get(`${API_URL}/messages/group/general`);
        console.log('Group messages:', getGroupMessages.data);

    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    }
};

testBackend(); 