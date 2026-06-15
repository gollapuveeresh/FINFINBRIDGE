import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// sessionStorage is tab-isolated — each tab keeps its own token independently.
// localStorage is also written on login so the user can open a fresh tab and
// still be "remembered" (they can log in to a different portal in that new tab).
const TOKEN_KEY = 'finbridge_token';
const getToken  = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
const setToken  = (t) => { sessionStorage.setItem(TOKEN_KEY, t); localStorage.setItem(TOKEN_KEY, t); };
const clearToken = () => { sessionStorage.removeItem(TOKEN_KEY); };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasFinancialProfile, setHasFinancialProfile] = useState(false);

  const checkProfile = async (currentUser) => {
    const activeUser = currentUser || user;
    if (!activeUser) { setHasFinancialProfile(false); return false; }
    if (activeUser.role !== 'client') { setHasFinancialProfile(true); return true; }
    try {
      const res = await api.get('/financial-profile');
      const ok = res.data?.status === 'success';
      setHasFinancialProfile(ok);
      return ok;
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        console.error('Error checking financial profile status:', err);
      }
      setHasFinancialProfile(false);
      return false;
    }
  };

  // On mount: verify whatever token is in this tab's sessionStorage.
  // If sessionStorage is empty (new tab) but localStorage has one, it is copied
  // into sessionStorage by getToken() above — this means fresh tabs inherit the
  // last-logged-in session but can independently switch portals afterwards.
  useEffect(() => {
    const verifySession = async () => {
      const token = getToken();
      if (!token) { setLoading(false); return; }
      // Ensure sessionStorage has the token for this tab
      sessionStorage.setItem(TOKEN_KEY, token);
      try {
        const res = await api.get('/auth/me');
        if (res.data?.status === 'success') {
          setUser(res.data.user);
          setIsAuthenticated(true);
          await checkProfile(res.data.user);
        } else {
          clearToken();
        }
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      if (data.status === 'error') throw new Error(data.message || 'Login failed');
      // Store in both so new tabs can pick it up, but this tab's session is isolated
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      await checkProfile(data.user);
      return data.user;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  const register = async (name, email, password, role = 'client', phone = '', companyName = '', department = '') => {
    try {
      const payload = { name, email, password, role, phone, companyName };
      if (department) payload.department = department;
      const res = await api.post('/auth/register', payload);
      const data = res.data;
      if (data.status === 'error') throw new Error(data.message || 'Registration failed');
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  // Logout only clears this tab's session — other tabs are unaffected
  const logout = () => {
    clearToken();
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setHasFinancialProfile(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-body-md text-text-muted mt-4 font-semibold tracking-wide">Securing connection...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, hasFinancialProfile, checkProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
