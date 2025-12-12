import React, { createContext, useState, useEffect } from 'react';

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
        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', error);
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
            }
        }
        setIsLoading(false);
    }, []);

    // login accepts either { token, user } or simple email (backwards compat)
    const login = (authData) => {
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
        if (newToken) {
            setToken(newToken);
            localStorage.setItem('authToken', newToken);
        }

        if (userObj) {
            setUser(userObj);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(userObj));
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
