import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import quizAPI from '../../services/quizAPI';
import '../../assets/QuizList.css';

const QuizList = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 100;
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lobbyStatus, setLobbyStatus] = useState({}); // { quizId: lobbyData }
  
  

  // Charger les quiz au montage du composant
  useEffect(() => {
  const loadQuiz = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://10.3.70.14:8080/quiz");

      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const quizList = await response.json();
      setQuiz(quizList); // or quizList.getAllquiz

    } catch (err) {
      console.error(err);
      console.warn("API non disponible, utilisation des données en dur");
    } finally {
      setLoading(false);
    }
  };

  loadQuiz();
}, []);

  const handleGeneratequiz = async () => {
  try {
    const createResponse = await fetch("http://10.3.70.14:8080/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "Nouveau quiz",
        description: ""
      }),
    });

    if (!createResponse.ok) throw new Error("Cannot create empty quiz");

    const emptyQuiz = await createResponse.json();
    console.log("quizID", emptyQuiz.id);
    navigate(`/ModifyQuiz/${emptyQuiz.id}`)
  } catch (err) {
  console.error(err);
  console.warn('API non disponible, utilisation des données en dur');
}

};


  // Charger le statut du lobby pour chaque quiz
  useEffect(() => {
    const loadLobbyStatuses = async () => {
      const statuses = {};
      for (const q of quiz) {
        try {
          const lobby = await quizAPI.getLobbyStatus(q.id);
          statuses[q.id] = lobby;
        } catch (err) {
          // Fallback: si l'API échoue, assumer status 10 (not started) et 0 joueur
          statuses[q.id] = { connectedPlayersCount: 0, quizState: { status: 10 } };
        }
      }
      setLobbyStatus(statuses);
    };

    if (quiz.length > 0) {
      loadLobbyStatuses();
    }
  }, [quiz]);

  const handleStart =()=>{
    try {
      const listQuiz = 1
      
    } catch (error) {
      
    }
  }

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

      <div className="quiz-list">
        {quiz.map((q) => {
            const status = lobbyStatus[q.id]?.quizState?.status || 10;
            const playersCount = lobbyStatus[q.id]?.connectedPlayersCount || 0;
            const isRunning = status === 20;
          
          return (
            <div 
                key={q.id} 
              className="quiz-list-item"
                onClick={() => handleQuizClick(q.id, status)}
                style={{ opacity: isRunning ? 0.5 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}
            >
              <div className="quiz-item-left">
                  <h3>{q.title}</h3>
                <div className="quiz-item-info">
                    <span>❓ {q.questions} questions</span>
                    <span>👥 {playersCount} joueur(s) en attente</span>
                </div>
              </div>
              <div className="quiz-item-right">
                <button className="play-button" disabled={isRunning} onClick={handleStart}>
                    Jouer
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="button-group">
  {isAdmin ? (
    <button
      className="button_waiting"
      onClick={handleGeneratequiz}
      disabled={loading}
    >
      Ajouter un quiz
    </button>
  ) : null}
</div>

      
    </div>
  );
};

export default QuizList;
