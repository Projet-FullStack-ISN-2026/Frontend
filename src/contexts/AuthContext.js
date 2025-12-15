import React, { createContext, useState, useEffect } from 'react';
import authAPI from '../services/authAPI';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Vérifier si l'utilisateur était connecté au chargement
    useEffect(() => {
        const storedUser = localStorage.getItem('currentUser');
        const storedToken = localStorage.getItem('authToken');
        // restore token and/or user independently; consider session authenticated if token exists
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', error);
                localStorage.removeItem('currentUser');
            }
        }
        setIsLoading(false);
    }, []);

    // login accepts either { token, user } or simple email (backwards compat)
    const login = async (authData) => {
        if (!authData) return;
        if (typeof authData === 'string') {
            // backward compatibility: email string
            const userData = { email: authData, loginTime: new Date().toISOString() };
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return;
        }

        const { token: newToken, user: userObj } = authData;
        const fallbackUserObj = !userObj && (authData.email || authData.role || authData.id)
            ? {
                id: authData.id,
                email: authData.email,
                firstName: authData.firstName,
                lastName: authData.lastName,
                role: authData.role,
              }
            : null;

        if (newToken) {
            setToken(newToken);
            localStorage.setItem('authToken', newToken);
            // mark authenticated even if user object is not provided
            setIsAuthenticated(true);
        }

        let finalUser = userObj || fallbackUserObj || null;
        if (!finalUser && newToken) {
            // try to fetch profile from backend using token (network responsibility in authAPI)
            try {
                const profile = await authAPI.getProfile(newToken);
                if (profile) finalUser = profile;
            } catch (err) {
                // non-fatal: profile fetch failed, keep token so user can navigate
                console.warn('Could not fetch profile after login:', err && err.message ? err.message : err);
            }
        }

        if (finalUser) {
            setUser(finalUser);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(finalUser));
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
