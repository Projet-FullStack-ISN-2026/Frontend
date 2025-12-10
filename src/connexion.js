import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import authAPI from './services/authAPI';
import './assets/connexion.css';

const Connection = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/quiz');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const data = await authAPI.login({ email, password });
            login(data);
            navigate('/quiz');
        } catch (err) {
            console.error('Erreur login:', err);
            setError(err.message || 'Email ou mot de passe incorrect');
        }
    };

    return (
        <div className="connexion-page">
            <form className="connexion-form" onSubmit={handleSubmit}>
                <div className="connexion-icons">
                    <span style={{ cursor: 'pointer', fontSize: '20px' }}>👤</span>
                </div>

                <h2 className="connexion-header">Connexion</h2>

                <div className="connexion-field-group">
                    <label className="connexion-label" htmlFor="email">MAIL</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Votre adresse e-mail"
                        className="connexion-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="connexion-field-group">
                    <label className="connexion-label" htmlFor="password">MOT DE PASSE</label>
                    <input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        className="connexion-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <div className="connexion-error">{error}</div>
                )}

                <button type="submit" className="connexion-button">
                    Se connecter
                </button>

                <Link to="/inscription" className="connexion-signup-link">
                    Pas encore de compte : <strong>Inscrivez vous ici</strong>
                </Link>
            </form>
        </div>
    );
};

export default Connection;