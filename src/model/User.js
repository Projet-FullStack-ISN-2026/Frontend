// src/models/User.js
class User {
  constructor({ token = null, user = null } = {}) {
    this.token = token;
    this.user = user;
  }

  /* =====================
     Getters
  ===================== */
  isAuthenticated() {
    return !!this.token;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }

  setAuth({ token, user }) {
    if (token) {
      this.token = token;
      localStorage.setItem('authToken', token);
    }

    if (user) {
      this.user = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  setUser(user) {
    this.user = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  /* =====================
     Storage helpers
  ===================== */
  static fromStorage() {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('currentUser'));

      if (token && user) {
        return new User({ token, user });
      }
    } catch (e) {
      console.error('User.fromStorage error:', e);
    }

    return new User();
  }

  /* =====================
     Clear auth
  ===================== */
  clear() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  }
}

export default User;
