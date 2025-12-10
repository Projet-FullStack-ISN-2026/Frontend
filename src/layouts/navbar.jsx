import logo from '../assets/logo_tf8.png';
import '../assets/Navbar.css';
import showAlert from '../pop_up';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function Navbar(){
    const { isAuthenticated, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        showAlert("Log out success !")
        logout();
        navigate('/');
    };

    return (
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
    <div className="container-fluid">
        <a className="navbar-brand" href="/">
            <img src={logo} alt="Logo" style={{height: '40px'}} />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
        </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav me-auto">
                        {!isAuthenticated ? (
                            <>
                                <a className="nav-link" href="/connexion">Connexion</a>
                                <a className="nav-link" href="/inscription">Inscription</a>
                            </>
                        ) : (
                            <>
                                <a className="nav-link" href="/quiz">Quiz</a>
                                <a className="nav-link" href="/GenerateQuiz">Générer un Quiz</a>
                            </>
                        )}
                    </div>

                    <div className="nav justify-content-center">
                        {isAuthenticated && (
                            <a
                                className="nav-link btn btn-link"
                                onClick={handleLogout}
                                style={{ textDecoration: 'none', color: 'inherit',display: 'flex', justifyContent :'center',  }}
                            >
                                Déconnexion
                            </a>
                        )}
                    </div>
                </div>
    </div>
    <div id="alert-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex : '9999'}}></div>
    </nav>
    
    )
}

export default Navbar