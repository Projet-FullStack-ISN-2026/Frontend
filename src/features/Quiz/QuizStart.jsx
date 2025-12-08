import React from 'react';
import '../../assets/QuizStart.css';

const QuizStart = () => {
  return (
    <div className="quiz-start-container">
      <h1 className="quiz-title">Quiz Name</h1>
      
      <div className="button-group">
        <button className="quiz-button primary">Start</button>
        <button className="quiz-button secondary">Modify</button>
      </div>

    </div>
  );
};

export default QuizStart;