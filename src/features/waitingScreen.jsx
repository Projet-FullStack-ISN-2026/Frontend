import React, { useEffect, useState, useContext } from 'react';
import '../assets/waitingScreen.css';
import "./waitingScreen.css";
import quizAPI from '../services/quizAPI';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function WaitingScreen() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext) || {};
  const isAdmin = user?.role === 100;
  const [lobby, setLobby] = useState(null);
  const [quizTitle, setQuizTitle] = useState('Quiz');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  const loadLobby = async () => {
    try {
      setLoading(true);
      const data = await quizAPI.getLobbyStatus(quizId, token);
      setLobby(data);
      setLoading(false);
    } catch (err) {
      console.warn('API unavailable for lobby status, using fallback', err);
      //mock !!!!!
      setLobby({ connectedPlayersCount: 0, quizState: { quizId: quizId || 1, status: 10 } });
      setLoading(false);
    }
  };

  useEffect(() => {
    const doJoinAndLoad = async () => {
      try {
        // try to join automatically (mock will create player id)
        await quizAPI.joinQuiz(quizId, (user && (user.firstName || user.email)) || 'Player');
      } catch (e) {
        // ignore
      }
      loadLobby();
    };

    doJoinAndLoad();
    const interval = setInterval(loadLobby, 2500);
    return () => clearInterval(interval);
  }, [quizId, token]);

  const handleStart = async () => {
    try {
      await quizAPI.startQuiz(quizId, token);
      //refresh lobby status after starting
      await loadLobby();
      // navigate to play screen
      navigate(`/quiz/${quizId}/play`);
    } catch (err) {
      console.error('Erreur start quiz:', err);
      setError(err.message || 'Impossible de démarrer le quiz');
    }
  };

  const modifyQuiz = () => {
    navigate(`/modifyQuiz/${quizId}`);
  };
  const confirmDeleteQuiz = () => {
    setShowDeleteModal(false);
    navigate(`/deleteQuiz/${quizId}`);
  };

  const cancelDeleteQuiz = () => {
    setShowDeleteModal(false);
  };

  const resultQuiz = () => {
    navigate(`/resultQuiz/${quizId}`)
  }
  const handleQuit = () => {
    setShowQuitModal(true);
  };

  const confirmQuit = () => {
    setShowQuitModal(false);
    navigate('/quiz');
  };

  const cancelQuit = () => {
    setShowQuitModal(false);
  };

  return (
    <div className="App">
        <div className="quiz-header">
          <div className="close-icon" onClick={handleQuit} title="Quitter">✕</div>
        </div>

        <h1 className="quiz-title">{quizTitle}</h1>
        <p className="quiz-subtitle">
          {`${lobby?.connectedPlayersCount || 0} personne(s) en attente`}
        </p>

        {error && <div className="error-box">{error}</div>}

        <div className="button-group">
          {isAdmin ? (
            <>
              <button
              className='button_waiting'
                onClick={handleStart}
                disabled={loading}
              >
                Démarrer
              </button>

              <button
              className='button_waiting'
                onClick={modifyQuiz}
                disabled={loading}
              >
                Modifier
              </button>
              <button
                className="button_waiting"
                onClick={() => setShowDeleteModal(true)}
              >
                Supprimer
              </button>
              <button
              className='button_waiting'
                onClick={resultQuiz}
                disabled={loading}
              >
                Résultat des quiz précédents
              </button>
            </>
          ) : (
            <p className="waiting-message">En attente du démarrage...</p>
          )}
        </div>

      {/* Quit Confirmation Modal */}
      {showQuitModal && (
        <div className="modal-overlay" onClick={cancelQuit}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Quitter le quiz</h2>
            <p className="modal-message">Êtes-vous sûr de vouloir quitter ? Vous perdrez votre place dans le lobby.</p>
            <div className="modal-buttons">
              <button className="modal-btn cancel-btn" onClick={cancelQuit}>
                Rester
              </button>
              <button className="modal-btn confirm-btn" onClick={confirmQuit}>
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
      <div className="modal-overlay" onClick={cancelDeleteQuiz}>
        <div
          className="modal-card danger"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="modal-title">Supprimer le quiz</h2>

          <p className="modal-message">
            Cette action est <strong>définitive</strong>.<br />
            Le quiz sera supprimé ainsi que toutes les données associées.
          </p>

          <div className="modal-buttons">
            <button
              className="modal-btn cancel-btn"
              onClick={cancelDeleteQuiz}
            >
              Annuler
            </button>

            <button
              className="modal-btn confirm-btn danger"
              onClick={confirmDeleteQuiz}
            >
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    )}

    </div>
  );
}

export default WaitingScreen;