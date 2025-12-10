// Service API pour les quiz
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://10.3.70.14:8080/api/v0.0.3';

const getStoredToken = () => {
  return localStorage.getItem('authToken') || null;
};

export const quizAPI = {
  // Récupérer tous les quiz
  getAllQuiz: async (token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API getAllQuizzes:', error);
      throw error;
    }
  },

  // Récupérer les détails d'un quiz
  getQuizDetails: async (quizId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API getQuizDetails:', error);
      throw error;
    }
  },

  // Créer un nouveau quiz (Admin/Animateur)
  createQuiz: async (title, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ title })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API createQuiz:', error);
      throw error;
    }
  },

  // Lancer un quiz
  startQuiz: async (quizId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/control/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du démarrage du quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API startQuiz:', error);
      throw error;
    }
  },

  // Rejoindre un quiz
  joinQuiz: async (quizId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la connexion au quiz');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API joinQuiz:', error);
      throw error;
    }
  },

  // Récupérer la question actuelle
  getCurrentQuestion: async (quizId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/play/current-question`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la question');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API getCurrentQuestion:', error);
      throw error;
    }
  },

  // Soumettre une réponse
  submitAnswer: async (quizId, optionId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/play/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        body: JSON.stringify({ optionId })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission de la réponse');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API submitAnswer:', error);
      throw error;
    }
  },

  // Récupérer le classement
  getLeaderboard: async (quizId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/play/leaderboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du classement');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API getLeaderboard:', error);
      throw error;
    }
  },

  // Récupérer les stats (Admin/Animateur)
  getStats: async (quizId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API getStats:', error);
      throw error;
    }
  },

  // Récupérer la réponse (Admin/Animateur)
  getAnswer: async (quizId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/admin/answer`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la réponse');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API getAnswer:', error);
      throw error;
    }
  }
};

export default quizAPI;
