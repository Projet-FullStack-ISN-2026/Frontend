const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v0.0.3';

// Compte en dur pour les tests
const TEST_ACCOUNT = {
  firstName: 'Marius',
  lastName: 'Crenn',
  email: 'marius@gmail.com',
  password: 'marius',
};

const authAPI = {
  register: async (payload) => {
    // Vérifier si c'est le compte de test
    if (
      payload.firstName === TEST_ACCOUNT.firstName &&
      payload.lastName === TEST_ACCOUNT.lastName &&
      payload.email === TEST_ACCOUNT.email &&
      payload.password === TEST_ACCOUNT.password
    ) {
      // Retourner une réponse de test
      return {
        id: 1,
        email: TEST_ACCOUNT.email,
        firstName: TEST_ACCOUNT.firstName,
        lastName: TEST_ACCOUNT.lastName,
        role: 3, // JOUEUR
        token: 'test-token-' + Date.now(),
      };
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Erreur lors de l\'inscription');
    }

    return await response.json();
  },

  login: async ({ email, password }) => {
    // Vérifier si c'est le compte de test
    if (email === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
      // Retourner une réponse de test
      return {
        token: 'test-token-' + Date.now(),
        user: {
          id: 1,
          email: TEST_ACCOUNT.email,
          firstName: TEST_ACCOUNT.firstName,
          lastName: TEST_ACCOUNT.lastName,
          role: 3, // JOUEUR
        },
      };
    }

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Email ou mot de passe incorrect');
    }

    return await response.json(); // { token, user }
  }
};

export default authAPI;
