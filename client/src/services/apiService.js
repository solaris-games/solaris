import axios from 'axios';

class ApiService {

    login(username, password) {
        return axios.post('http://localhost:3000/api/auth/login', {
            username: username,
            password: password
            },
            {
                withCredentials: true
            });
    }
    
    logout() {
        return axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
    }

    getUserInfo() {
        return axios.get('http://localhost:3000/api/user/me', { withCredentials: true });
    }

    createUser(username, email, password) {
        return axios.post('http://localhost:3000/api/user', {
            username: username,
            email: email,
            password: password
        });
    }

    toggleEmailNotifications(enabled) {
        return axios.post('http://localhost:3000/api/user/changeEmailPreference', {
            enabled
        },
        { withCredentials: true });
    }

    updateEmailAddress(email) {
        return axios.post('http://localhost:3000/api/user/changeEmailAddress', {
            email
        },
        { withCredentials: true });
    }

    updatePassword(currentPassword, newPassword) {
        return axios.post('http://localhost:3000/api/user/changePassword', {
            currentPassword, newPassword
        },
        { withCredentials: true });
    }
}

export default new ApiService();
