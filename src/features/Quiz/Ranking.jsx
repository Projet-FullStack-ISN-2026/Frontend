import React, { useEffect, useState, useContext } from 'react';
import '../../assets/Ranking.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import quizAPI from '../../services/quizAPI';
import { AuthContext } from '../../contexts/AuthContext';

const Ranking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useContext(AuthContext) || {};
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const lb = await quizAPI.getLeaderboard(quizId, token);
      setPlayers(lb || []);
    } catch (err) {
      console.error('Error loading leaderboard', err);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Ranking mounted - location.state:', location.state);
    loadLeaderboard();
  }, [quizId]);

  return (
    <div className="ranking-page">
      <main className="ranking-card">
        <h2 className="ranking-title">Ranking</h2>
        <h3 className="ranking-subtitle">Top Players</h3>

        <div className="ranking-list">
          {loading && <div style={{textAlign:'center'}}>Loading...</div>}
          {!loading && players.length === 0 && (
            <div style={{textAlign:'center'}}>No players yet</div>
          )}
          {!loading && players
            .filter(p => {
              if (!user) return true;
              if (p.id && user.id && String(p.id) === String(user.id)) return false;
              if (p.email && user.email && p.email === user.email) return false;
              if (p.name && (user.firstName || user.email) && p.name === (user.firstName || user.email)) return false;
              return true;
            })
            .map((p, index) => (
              <div className="ranking-item" key={p.name + index}>
                <div className="rank-number">{index + 1}.</div>
                <div className="player-name">{p.name}</div>
                <div className="player-score">{p.score}</div>
              </div>
            ))}
        </div>

        <div className="next-wrap">
          <button className="next-button" onClick={() => {
            const restore = location?.state && location.state.restoreState ? location.state.restoreState : null;
            console.log('Ranking.Back to play - restore to forward:', restore);
            if (restore) navigate(`/quiz/${quizId}/play`, { state: { restoreState: restore } });
            else navigate(`/quiz/${quizId}/play`);
          }}>Back to play</button>
        </div>
      </main>
    </div>
  );
};

export default Ranking;
