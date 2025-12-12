import './assets/App.css';
import Navbar from './layouts/navbar'
import logo from './assets/logo_tf8.png';
import WaitingScreen from './features/waitingScreen';
import GenerateQuiz from './features/GenerationQuestions/GenerateQuiz'
import QuizList from './features/Quiz/QuizList';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Footer from './layouts/footer';
import Connection from './features/connexion/connexion'; 
import Inscription from './features/inscription/inscription';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContext, useEffect, useState } from 'react'; 
import ClientWS from './features/websocket/clientWS'

//const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://10.3.70.14:8080/esigelec-3a2/test/1.0.0/';
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

// Composant pour protéger les routes
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  
  // Attendre que l'authentification soit vérifiée
  if (isLoading) {
    return <div style={{background: 'linear-gradient(180deg, #010005, #28017c, #770056)', minHeight: '100vh'}}></div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/connexion" />;
}

// Composant pour protéger les routes admin
function AdminRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);
  const isAdmin = user?.role === 100;
  
  // Attendre que l'authentification soit vérifiée
  if (isLoading) {
    return <div style={{background: 'linear-gradient(180deg, #010005, #28017c, #770056)', minHeight: '100vh'}}></div>;
  }
  
  return isAuthenticated && isAdmin ? children : <Navigate to="/quiz" />;
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
              path="/quiz" 
              element={
                <ProtectedRoute>
                  <QuizList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/GenerateQuiz" 
              element={
                <AdminRoute>
                  <GenerateQuiz />
                </AdminRoute>
              } 
            />
            <Route 
              path="/waiting/:quizId" 
              element={
                <ProtectedRoute>
                  <WaitingScreen />
                </ProtectedRoute>
              } 
            />
                        <Route 
              path="/waitingScreen" 
              element={
                <ProtectedRoute>
                  <WaitingScreen />
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

export default App ;
