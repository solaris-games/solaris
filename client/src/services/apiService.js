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
}

export default new ApiService();
