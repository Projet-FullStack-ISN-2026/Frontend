// Service API pour les quiz
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://10.3.70.14:8080';

const getStoredToken = () => {
  return localStorage.getItem('authToken') || null;
};

// Mock mode: when REACT_APP_USE_MOCK is 'true' we simulate quiz lifecycle in-memory (localStorage)
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true' || true;

function readMock() {
  try {
    return JSON.parse(localStorage.getItem('mock_quizzes') || '[]');
  } catch (e) {
    return [];
  }
}

function writeMock(data) {
  localStorage.setItem('mock_quizzes', JSON.stringify(data));
}

function ensureMock() {
  const q = readMock();
  if (q.length === 0) {
    // create a default quiz for simulation
    const defaultQuiz = {
      id: 1,
      title: 'Mock Quiz',
      difficulty: 'Medium',
      questions: [],
      players: [],
      state: { status: 'waiting', currentQuestion: -1 },
    };
    // create 5 sample questions
    for (let i = 1; i <= 5; i++) {
      defaultQuiz.questions.push({
        id: i,
        text: `Sample question ${i}?`,
        options: [
          { id: 1, text: 'Choice A', correct: i % 4 === 1 },
          { id: 2, text: 'Choice B', correct: i % 4 === 2 },
          { id: 3, text: 'Choice C', correct: i % 4 === 3 },
          { id: 4, text: 'Choice D', correct: i % 4 === 0 },
        ],
        timeLimit: 30,
      });
    }
    writeMock([defaultQuiz]);
    return [defaultQuiz];
  }
  return q;
}

const mockAPI = {
  getAllQuizzes: async () => {
    const quizzes = ensureMock();
    return quizzes.map(q => ({ id: q.id, title: q.title, difficulty: q.difficulty, questions: q.questions.length, players: q.players.length }));
  },
  getQuizDetails: async (quizId) => {
    const quizzes = ensureMock();
    return quizzes.find(q => q.id === Number(quizId));
  },
  createQuiz: async (title, count = 5) => {
    const quizzes = readMock();
    const id = quizzes.length ? Math.max(...quizzes.map(x => x.id)) + 1 : 1;
    const quiz = { id, title: title || `Quiz ${id}`, difficulty: 'Medium', questions: [], players: [], state: { status: 'waiting', currentQuestion: -1 } };
    for (let i = 1; i <= (count || 5); i++) {
      quiz.questions.push({ id: i, text: `Question ${i} for ${quiz.title}`, options: [
        { id: 1, text: 'A', correct: i % 4 === 1 },
        { id: 2, text: 'B', correct: i % 4 === 2 },
        { id: 3, text: 'C', correct: i % 4 === 3 },
        { id: 4, text: 'D', correct: i % 4 === 0 },
      ], timeLimit: 30 });
    }
    quizzes.push(quiz);
    writeMock(quizzes);
    return quiz;
  },
  getLobbyStatus: async (quizId) => {
    const quizzes = ensureMock();
    const q = quizzes.find(x => x.id === Number(quizId)) || quizzes[0];
    return { connectedPlayersCount: q.players.length, quizState: { quizId: q.id, status: q.state.status } };
  },
  startQuiz: async (quizId) => {
    const quizzes = ensureMock();
    const q = quizzes.find(x => x.id === Number(quizId)) || quizzes[0];
    q.state.status = 'started';
    q.state.currentQuestion = 0;
    writeMock(quizzes);
    return q;
  },
  joinQuiz: async (quizId, playerName) => {
    const quizzes = ensureMock();
    const q = quizzes.find(x => x.id === Number(quizId)) || quizzes[0];
    const playerId = localStorage.getItem('mock_player_id') || `p_${Date.now()}`;
    localStorage.setItem('mock_player_id', playerId);
    if (!q.players.find(p => p.id === playerId)) {
      q.players.push({ id: playerId, name: playerName || `Player ${q.players.length + 1}`, score: 0, answers: [] });
    }
    writeMock(quizzes);
    return { playerId };
  },
  getCurrentQuestion: async (quizId) => {
    const quizzes = ensureMock();
    const q = quizzes.find(x => x.id === Number(quizId)) || quizzes[0];
    const idx = q.state.currentQuestion;
    if (idx === -1) return null;
    const question = q.questions[idx];
    return { questionId: question.id, text: question.text, options: question.options.map(o => ({ id: o.id, text: o.text })), timeLimit: question.timeLimit };
  },
  submitAnswer: async (quizId, optionId) => {
    const quizzes = ensureMock();
    const q = quizzes.find(x => x.id === Number(quizId)) || quizzes[0];
    const playerId = localStorage.getItem('mock_player_id');
    let player = q.players.find(p => p.id === playerId);
    if (!player) {
      player = { id: playerId || `p_${Date.now()}`, name: 'You', score: 0, answers: [] };
    }
    const current = q.state.currentQuestion;
    const question = q.questions[current];
    const selected = question.options.find(o => o.id === Number(optionId));
    const correct = !!selected && !!selected.correct;
    const correctOption = question.options.find(o => o.correct) || null;
    const correctOptionId = correctOption ? correctOption.id : null;
    player.answers.push({ questionId: question.id, selected: Number(optionId), correct });
    if (correct) player.score += 1;
    // update player in array
    const pi = q.players.findIndex(p => p.id === player.id);
    if (pi >= 0) q.players[pi] = player; else q.players.push(player);
    // advance to next question (simple behaviour)
    if (q.state.currentQuestion < q.questions.length - 1) q.state.currentQuestion += 1; else q.state.status = 'finished';
    writeMock(quizzes);
    return { correct, correctOptionId };
  },
  getLeaderboard: async (quizId) => {
    const quizzes = ensureMock();
    const q = quizzes.find(x => x.id === Number(quizId)) || quizzes[0];
    const ranks = q.players.map(p => ({ name: p.name, score: p.score })).sort((a,b) => b.score - a.score);
    return ranks;
  },
  getStats: async () => ({ message: 'mock stats' }),
  getAnswer: async () => ({ message: 'mock answer' }),
};

export const quizAPI = USE_MOCK ? mockAPI : {
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
  getLobbyStatus: async (quizId, token) => {
    try {
      const authToken = token || getStoredToken();
      const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/admin/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du statut du lobby');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API getLobbyStatus:', error);
      throw error;
    }
  },
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
