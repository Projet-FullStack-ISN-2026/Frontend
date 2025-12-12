import React, { useEffect, useState, useContext } from 'react';
import '../assets/App.css';
import '../assets/waitingScreen.css';
import quizAPI from '../services/quizAPI';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function WaitingScreen() {
  const { quizId } = useParams();
  const { token } = useContext(AuthContext) || {};
  const [lobby, setLobby] = useState(null);
  const [quizTitle, setQuizTitle] = useState('Quiz');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLobby = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getLobbyStatus(quizId, token);
      setLobby(data);
      setLoading(false);
    } catch (err) {
      console.warn('API unavailable for lobby status, using fallback', err);
      //mock
      setLobby({ connectedPlayersCount: 0, quizState: { quizId: quizId || 1, status: 10 } });
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLobby();
    const interval = setInterval(loadLobby, 2500);
    return () => clearInterval(interval);
  }, [quizId, token]);

  const handleStart = async () => {
    try {
      await quizAPI.startQuiz(quizId, token);
      //refresh lobby status after starting
      await loadLobby();
    } catch (err) {
      console.error('Erreur start quiz:', err);
      setError(err.message || 'Impossible de démarrer le quiz');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="quiz-header">
          <div className="close-icon">✕</div>
        </div>

        <h1 className="quiz-title">{quizTitle}</h1>
        <p className="quiz-subtitle">
          {`${lobby?.connectedPlayersCount || 0} personne(s) en attente`}
        </p>

        {error && <div className="error-box">{error}</div>}

        <div className="button-group">
          <button className="quiz-button primary" onClick={handleStart} disabled={loading}>
            Démarrer
          </button>
        </div>
      </header>
    </div>
  );
}

export default WaitingScreen;