import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import authAPI from '../../services/authAPI';
import '../../assets/connexion.css';
import showAlert from '../../pop_up';

const Connection = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
                const data = await authAPI.login({ email, password });
                // Prefer server-side session: attempt to fetch the profile using credentials (cookies)
                let profile = null;
                try {
                    profile = await authAPI.getProfile();
                } catch (err) {
                    console.warn('Could not fetch profile after login via /auth/me:', err);
                }

                if (profile) {
                    try { localStorage.setItem('currentUser', JSON.stringify(profile)); } catch (e) { console.warn('Could not write currentUser', e); }
                    // Let AuthContext know about the profile (pass as { user: profile })
                    await login({ user: profile });
                } else {
                    // Fallback: use token/user returned in login response if API doesn't provide /auth/me
                    const token = data?.token || data?.accessToken || data?.authToken || (data.data && (data.data.token || data.data.accessToken)) || null;
                    const userObj = data?.user || data?.profile || (data.data && data.data.user) || null;
                    if (token) {
                        try { localStorage.setItem('authToken', token); } catch (e) { console.warn('Could not write authToken', e); }
                    }
                    if (userObj) {
                        try { localStorage.setItem('currentUser', JSON.stringify(userObj)); } catch (e) { console.warn('Could not write currentUser', e); }
                    }
                    await login(data);
                }

                showAlert("Successful connection");
                navigate('/quiz');
        } catch (err) {
            console.error('Erreur login:', err);
            setError(err.message || 'Email or password wrong');
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
                    <label className="connexion-label" htmlFor="email">E-MAIL</label>
                    <input
                        type="email"
                        id="email"
                        placeholder="Our adresse mail"
                        className="connexion-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="connexion-field-group">
                    <label className="connexion-label" htmlFor="password">Password</label>
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
                    Log in
                </button>

                <Link to="/inscription" className="connexion-signup-link">
                    no account yet ? : <strong>sign up here</strong>
                </Link>
            </form>
            <div id="alert-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex : '9999'}}></div>
        </div>
    );
};

export default Connection;