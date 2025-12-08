import './assets/App.css';
import Navbar from './layouts/navbar'
import logo from './assets/logo_tf8.png';
import WaitingScreen from './features/waitingScreen';
import GenerateQuiz from './features/GenerationQuestions/GenerateQuiz'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Footer from './layouts/footer';
import Connection from './connexion'; 
import Inscription from './inscription';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContext } from 'react'; 

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
          exercitation ullamco laboris nisi ut aliquip ex ea commodo
           consequat. Duis aute irure dolor in reprehenderit in voluptate velit 
          esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident, 
          sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </header>
    </div>
  );
}

// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/connexion" />;
}

function App() {
    return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/connexion" element={<Connection />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route 
              path="/GenerateQuiz" 
              element={
                <ProtectedRoute>
                  <GenerateQuiz />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
