import React from 'react';
import '../../assets/PrintQuestion.css';

const PrintQuestion = () => {
  return (
    <div className="print-question-root">
      <header className="pq-header">
        <div className="pq-logo">TF8 Logo</div>
        <div className="pq-close">⤺</div>
      </header>

      <main className="pq-card">
        <h2 className="pq-title">Question Title</h2>
        <div className="pq-timer">00:20</div>

        <div className="pq-options">
          <button className="pq-option">Option 1</button>
          <button className="pq-option">Option 2</button>
          <button className="pq-option">Option 3</button>
          <button className="pq-option">Option 4</button>
          <button className="pq-option">Next</button>
        </div>

        <div className="pq-actions">
          <button className="pq-action">Show answer</button>
          <button className="pq-action">Show leaderboard</button>
        </div>
      </main>
    </div>
  );
};

export default PrintQuestion;
