import '../../assets/QuizStart.css';

const QuizStart = () => {
  return (
    <div className="quiz-start-container">
      <h1 className="quiz-title">Nom du quiz</h1>
      <div className="button-group">
        <button className="quiz-button primary">Commencer</button>
        <button className="quiz-button secondary">Modifier</button>
      </div>
    </div>
  );
};

export default QuizStart;