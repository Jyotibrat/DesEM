import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                localStorage.setItem('token', session.access_token);
                fetchUser();
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                localStorage.setItem('token', session.access_token);
                fetchUser();
            } else {
                setUser(null);
                localStorage.removeItem('token');
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUser = async () => {
        try {
            const { data } = await authAPI.getMe();
            setUser(data.data.user);
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    const register = async (email, password, name) => {
        try {
            const { data } = await authAPI.register({ email, password, name });

            // Auto login after registration
            const { data: loginData, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            setSession(loginData.session);
            localStorage.setItem('token', loginData.session.access_token);
            await fetchUser();

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            setSession(data.session);
            localStorage.setItem('token', data.session.access_token);
            await fetchUser();

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            localStorage.removeItem('token');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        user,
        session,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
