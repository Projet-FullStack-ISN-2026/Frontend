import logo from '../assets/logo_tf8.png';
import '../assets/Navbar.css';
import showAlert from '../pop_up';
import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Navbar(){
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const isAdmin = user?.role === 100;

    const handleLogout = () => {
        showAlert("Log out success !")
        logout();
        navigate('/');
    };

    return (
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
    <div className="container-fluid">
        <Link className="navbar-brand" to="/">
            <img src={logo} alt="Logo" style={{height: '40px'}} />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
        </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav me-auto">
                        {!isAuthenticated ? (
                            <>
                                <Link className="nav-link" to="/connexion">Connexion</Link>
                                <Link className="nav-link" to="/inscription">Inscription</Link>
                            </>
                        ) : (
                            <>
                                <Link className="nav-link" to="/quiz">Quiz</Link>
                                {isAdmin && (
                                  <Link className="nav-link" to="/GenerateQuiz">Générer un Quiz</Link>
                                )}
                                <Link className="nav-link" to="/waitingScreen">Waiting Screen</Link>
                            </>
                        )}
                    </div>

                    <div className="nav justify-content-center">
                        {isAuthenticated && (
                            <button
                                className="nav-link btn btn-link"
                                onClick={handleLogout}
                                style={{ textDecoration: 'none', color: 'inherit',display: 'flex', justifyContent :'center',  }}
                            >
                                Déconnexion
                            </button>
                        )}
                    </div>
                </div>
    </div>
    <div id="alert-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex : '9999'}}></div>
    </nav>
    
    )
}

export default Navbar