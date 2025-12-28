import React, { useEffect, useState, useContext } from 'react';
import '../../assets/Ranking.css';
import { useParams, useNavigate } from 'react-router-dom';
import quizAPI from '../../services/quizAPI';
import { AuthContext } from '../../contexts/AuthContext';

const Ranking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext) || {};
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
          {!loading && players.map((p, index) => (
            <div className="ranking-item" key={p.name + index}>
              <div className="rank-number">{index + 1}.</div>
              <div className="player-name">{p.name}</div>
              <div className="player-score">{p.score}</div>
            </div>
          ))}
        </div>

        <div className="next-wrap">
          <button className="next-button" onClick={() => navigate(`/quiz/${quizId}/play`)}>Back to play</button>
        </div>
      </main>
    </div>
  );
};

export default Ranking;
