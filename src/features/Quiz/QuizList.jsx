import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import quizAPI from '../../services/quizAPI';
import '../../assets/QuizList.css';

const QuizList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lobbyStatus, setLobbyStatus] = useState({}); // { quizId: lobbyData }
  
  // Données en dur (fallback si API non disponible)
  const mockquiz = [
    {
      id: 1,
      title: 'Quiz TF8',
      difficulty: 'Moyen',
      questions: 10,
      players: 5,
      status: 10 // not started
    }
  ];

  // Charger les quiz au montage du composant
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        // Essayer de récupérer depuis l'API
        const data = await quizAPI.getAllquiz();
        setQuiz(data || mockquiz);
      } catch (err) {
        console.warn('API non disponible, utilisation des données en dur');
        // Fallback sur les données en dur
        setQuiz(mockquiz);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, []);

  // Charger le statut du lobby pour chaque quiz
  useEffect(() => {
    const loadLobbyStatuses = async () => {
      const statuses = {};
      for (const quiz of quizzes) {
        try {
          const lobby = await quizAPI.getLobbyStatus(quiz.id);
          statuses[quiz.id] = lobby;
        } catch (err) {
          // Fallback: si l'API échoue, assumer status 10 (not started) et 0 joueur
          statuses[quiz.id] = { connectedPlayersCount: 0, quizState: { status: 10 } };
        }
      }
      setLobbyStatus(statuses);
    };

    if (quizzes.length > 0) {
      loadLobbyStatuses();
    }
  }, [quizzes]);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Facile':
        return '#4CAF50';
      case 'Moyen':
        return '#FFC107';
      case 'Difficile':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const handleQuizClick = (quizId, status) => {
    // Si le quiz est en cours (status 20), on ne peut pas rejoindre
    if (status === 20) {
      alert('Ce quiz est déjà en cours, vous ne pouvez pas le rejoindre.');
      return;
    }
    // Sinon, rediriger vers la page d'attente
    navigate(`/waiting/${quizId}`);
  };  if (loading) {
    return (
      <div className="quiz-list-container">
        <div style={{textAlign: 'center', paddingTop: '100px', color: 'white'}}>
          Chargement des quiz...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-list-container">
        <div style={{textAlign: 'center', paddingTop: '100px', color: 'white'}}>
          Erreur lors du chargement: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-list-container">
      <div className="quiz-list-header">
        <h1>Quiz Disponibles</h1>
      </div>

      <div className="quizzes-list">
        {quizzes.map((quiz) => {
          const status = lobbyStatus[quiz.id]?.quizState?.status || 10;
          const playersCount = lobbyStatus[quiz.id]?.connectedPlayersCount || 0;
          const isRunning = status === 20;
          
          return (
            <div 
              key={quiz.id} 
              className="quiz-list-item"
              onClick={() => handleQuizClick(quiz.id, status)}
              style={{ opacity: isRunning ? 0.5 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}
            >
              <div className="quiz-item-left">
                <h3>{quiz.title}</h3>
                <div className="quiz-item-info">
                  <span>❓ {quiz.questions} questions</span>
                  <span>👥 {playersCount} joueur(s) en attente</span>
                </div>
              </div>
              <div className="quiz-item-right">
                <span 
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
                >
                  {isRunning ? 'En cours' : quiz.difficulty}
                </span>
                <button className="play-button" disabled={isRunning}>
                  {isRunning ? 'En cours' : 'Jouer →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizList;
