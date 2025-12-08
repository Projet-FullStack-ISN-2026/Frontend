import React from 'react';
import '../../assets/Ranking.css';

const topPlayers = [
  'Player 1',
  'Player 2',
  'Player 3',
  'Player 4',
  'Player 5',
  'Player 6',
  'Player 7',
  'Player 8',
  'Player 9',
  'Player 10',
];

const Ranking = () => {
  return (
    <div className="ranking-page">
      <main className="ranking-card">
        <h2 className="ranking-title">Ranking</h2>
        <h3 className="ranking-subtitle">Top 10</h3>

        <div className="ranking-list">
          {topPlayers.map((player, index) => (
            <div className="ranking-item" key={player}>
              <div className="rank-number">{index + 1}.</div>
              <div className="player-name">{player}</div>
            </div>
          ))}
        </div>

        <div className="next-wrap">
          <button className="next-button">Next</button>
        </div>
      </main>
    </div>
  );
};

export default Ranking;
