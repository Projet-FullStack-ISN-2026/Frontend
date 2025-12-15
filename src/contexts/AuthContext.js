import React, { createContext, useState, useEffect } from 'react';
import authAPI from '../services/authAPI';

export const AuthContext = createContext();

// simple cookie helpers (client-side only, not HttpOnly)
const setCookie = (name, value, days) => {
  const expires = days ? `; Max-Age=${days * 24 * 60 * 60}` : '';
  // secure flag when on https, path=/ so cookie is sent for all paths
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/${secure}`;
};
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
};
const deleteCookie = (name) => { document.cookie = `${name}=; Max-Age=0; path=/`; };

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Vérifier si l'utilisateur était connecté au chargement
    useEffect(() => {
        // prefer cookie for token (acts like a cookie); fallback to localStorage
        const init = async () => {
            try {
                console.log('AuthContext.init - starting restore');
                const cookieToken = getCookie('authToken');
                console.log('AuthContext.init - cookieToken:', cookieToken);
                const storedToken = cookieToken || localStorage.getItem('authToken');
                console.log('AuthContext.init - storedToken:', storedToken);
                const storedUserRaw = localStorage.getItem('currentUser');
                console.log('AuthContext.init - storedUserRaw:', storedUserRaw);
                let storedUser = null;
                if (storedUserRaw) {
                    try { storedUser = JSON.parse(storedUserRaw); } catch (err) { console.warn('Invalid stored user JSON', err); localStorage.removeItem('currentUser'); }
                }

                if (storedToken) {
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    // if we don't have a stored user, try to fetch it from the API
                    if (!storedUser) {
                        try {
                            console.log('AuthContext.init - fetching profile with token');
                            const profile = await authAPI.getProfile(storedToken);
                            console.log('AuthContext.init - profile fetched:', profile);
                            if (profile) {
                                setUser(profile);
                                try { localStorage.setItem('currentUser', JSON.stringify(profile)); } catch(e){}
                            }
                        } catch (err) {
                            console.warn('AuthContext.init - profile fetch failed:', err);
                            console.warn('Could not restore profile from token on init:', err);
                        }
                    } else {
                        setUser(storedUser);
                    }
                } else if (storedUser) {
                    // token missing but user info exists: restore user (may be unauthenticated for API calls)
                    setUser(storedUser);
                } else {
                    // No token and no stored user: attempt to restore session via server-set HttpOnly cookie
                    try {
                        console.log('AuthContext.init - attempting server cookie restore via /auth/me');
                        const profile = await authAPI.getProfile(); // authAPI.getProfile uses credentials: 'include'
                        console.log('AuthContext.init - server cookie profile:', profile);
                        if (profile) {
                            setUser(profile);
                            setIsAuthenticated(true);
                            try { localStorage.setItem('currentUser', JSON.stringify(profile)); } catch(e){}
                        }
                    } catch (err) {
                        console.warn('AuthContext.init - server cookie restore failed:', err);
                        // no server session
                    }
                }
            } catch (err) {
                console.error('AuthContext initialization error', err);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // login accepts either { token, user } or simple email (backwards compat)
    const login = async (authData) => {
        console.log('AuthContext.login - authData:', authData);
        if (!authData) return;
        if (typeof authData === 'string') {
            // backward compatibility: email string
            const userData = { email: authData, loginTime: new Date().toISOString() };
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(userData));
            return;
        }

        // accept multiple token/user shapes from backend
        const newToken = authData.token || authData.accessToken || authData.authToken || (authData.data && (authData.data.token || authData.data.accessToken)) || null;
        const userObj = authData.user || authData.profile || (authData.data && authData.data.user) || null;
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
            // store token in cookie (acts like "cookie") and also persist in localStorage for compatibility
            try {
                setCookie('authToken', newToken, 7); // 7 days
            } catch (e) {
                console.warn('Unable to set cookie, falling back to localStorage', e);
            }
            try { localStorage.setItem('authToken', newToken); } catch(e) { console.warn('Unable to write authToken to localStorage', e); }
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

        console.log('AuthContext.login - token stored, finalUser computed:', finalUser);

        if (finalUser) {
            setUser(finalUser);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(finalUser));
        }
    };

    const logout = () => {
        console.log('AuthContext.logout - clearing auth data');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        try { deleteCookie('authToken'); } catch(e){}
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
