const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://10.3.70.14:8080';

const authAPI = {
  register: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur lors de l\'inscription');
    }

    return await response.json();
  },

  login: async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({})); 
      throw new Error(err.message || 'Email ou mot de passe incorrect');
    }

    return await response.json(); // { token, user }
  }
  ,
  // Récupérer le profil de l'utilisateur courant via token
  getProfile: async (token) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Impossible de récupérer le profil');
      }

      return await response.json(); // { id, email, firstName, lastName, role }
    } catch (err) {
      console.error('authAPI.getProfile error', err);
      throw err;
    }
  }
};

export default authAPI;
