import '../assets/App.css';
import '../assets/waitingScreen.css';

function WaitingScreen() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="quiz-header">
          <div className="close-icon">✕</div>
        </div>

        <h1 className="quiz-title">Quiz name !</h1>
        <p className="quiz-subtitle">Number of waiting people...</p>

        <div className="button-group">
          <button className="quiz-button primary">Start</button>
        </div>
      </header>
    </div>
  );
}

export default WaitingScreen;