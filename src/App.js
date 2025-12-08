import './assets/App.css';
import Navbar from './layouts/navbar'
import logo from './assets/logo_tf8.png';
import WaitingScreen from './waitingScreen';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Footer from './layouts/footer';
import QuizStart from './features/Quiz/QuizStart';
import PrintQuestion from './features/Quiz/PrintQuestion';

function Home() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bienvenue sur le grand Quiz de TF8 !</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
          sed do eiusmod tempor incididunt ut labore et dolore magna 
          aliqua. Ut enim ad minim veniam, quis nostrud
          exercitationn ullamco laboris nisi ut aliquip ex ea commodo
           consequat. Duis aute irure dolor in reprehenderit in voluptate velit 
          esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident, 
          sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </header>
    </div>
  );
}

function App() {
    return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features/Quiz/PrintQuestion" element={<PrintQuestion />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
