import React from 'react';
import '../../assets/PrintQuestion.css';

const PrintQuestion = () => {
  return (
    <div className="question-page">
      <main className="question-card">
        <h2 className="question-title">Question Title</h2>
        <div className="timer">00:20</div>

        <div className="options">
          <button className="option">Option 1</button>
          <button className="option">Option 2</button>
          <button className="option">Option 3</button>
          <button className="option">Option 4</button>
          <button className="option">Next</button>
        </div>

        <div className="bottom-actions">
          <button className="action-button">Show answer</button>
          <button className="action-button">Show leaderboard</button>
        </div>
      </main>
    </div>
  );
};

export default PrintQuestion;
