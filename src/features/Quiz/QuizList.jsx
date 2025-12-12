import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import quizAPI from '../../services/quizAPI';
import '../../assets/QuizList.css';

const QuizList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [quizzes, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Données en dur (fallback si API non disponible)
  const mockQuizzes = [
    {
      id: 1,
      title: 'Quiz TF8',
      difficulty: 'Moyen',
      questions: 10,
      players: 5
    }
  ];

  // Charger les quiz au montage du composant
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        // Essayer de récupérer depuis l'API
        const data = await quizAPI.getAllQuizzes();
        setQuiz(data || mockQuizzes);
      } catch (err) {
        console.warn('API non disponible, utilisation des données en dur');
        // Fallback sur les données en dur
        setQuiz(mockQuizzes);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, []);

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

  const handleQuizClick = (quizId) => {
    navigate(`/quiz/${quizId}`);
    
  };

  if (loading) {
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
        {quizzes.map((quiz) => (
          <div 
            key={quiz.id} 
            className="quiz-list-item"
            onClick={() => handleQuizClick(quiz.id)}
          >
            <div className="quiz-item-left">
              <h3>{quiz.title}</h3>
              <div className="quiz-item-info">
                <span>❓ {quiz.questions} questions</span>
                <span>👥 {quiz.players} joueurs</span>
              </div>
            </div>
            <div className="quiz-item-right">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(quiz.difficulty) }}
              >
                {quiz.difficulty}
              </span>
              <button className="play-button">Jouer →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizList;
