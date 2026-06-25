import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// Prefer a server field-level validation message over the generic one.
const authErrMsg = (err, fallback) => {
  const errs = err?.response?.data?.errors;
  if (errs && typeof errs === 'object') {
    const first = Object.values(errs)[0];
    if (first) return first;
  }
  return err?.response?.data?.message || err?.message || fallback;
};

// sessionStorage is tab-isolated — each tab keeps its own token independently.
// localStorage is also written on login so the user can open a fresh tab and
// still be "remembered" (they can log in to a different portal in that new tab).
const TOKEN_KEY = 'finbridge_token';
const getToken  = () => sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
const setToken  = (t) => { sessionStorage.setItem(TOKEN_KEY, t); localStorage.setItem(TOKEN_KEY, t); };
const clearToken = () => { 
  sessionStorage.removeItem(TOKEN_KEY); 
  localStorage.removeItem(TOKEN_KEY); 
};

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
      // Spring returns the profile entity directly (legacy Node returned { status: 'success' }).
      // Treat any 2xx body carrying a profile id as "profile exists".
      const ok = !!(res.data && (res.data.status === 'success' || res.data.id || res.data._id));
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
      // Skip auth check entirely on B2B page — it uses its own session
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/b2b')) {
        setLoading(false);
        return;
      }
      const token = getToken();
      if (!token) { setLoading(false); return; }
      // Ensure sessionStorage has the token for this tab
      sessionStorage.setItem(TOKEN_KEY, token);
      try {
        const res = await api.get('/auth/me');
        // Spring Boot returns User object directly, Node.js returned { status, user }
        const userData = res.data?.user || res.data;
        if (userData?.role) {
          if (userData.role === 'client') {
            clearToken();
            setUser(null);
            setIsAuthenticated(false);
          } else {
            setUser(userData);
            setIsAuthenticated(true);
            await checkProfile(userData);
          }
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
      // Clear any stale token before logging in. A leftover/expired token must never
      // be sent on the login request (the backend would reject the whole request).
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      const res = await api.post('/auth/login', { email, password });
      const data = res.data;
      // Spring Boot returns: { token, id, name, email, role, department }
      // Normalize to user object
      const user = data.user || { id: data.id, name: data.name, email: data.email, role: data.role, department: data.department };
      const token = data.token;
      if (!token) throw new Error(data.message || 'Login failed');
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      await checkProfile(user);
      return user;
    } catch (err) {
      throw new Error(authErrMsg(err, 'Login failed'));
    }
  };

  const register = async (name, email, password, role = 'client', phone = '', companyName = '', department = '') => {
    try {
      const payload = { name, email, password, role, phone, companyName };
      if (department) payload.department = department;
      const res = await api.post('/auth/register', payload);
      const data = res.data;
      // Spring Boot returns LoginResponse directly on register too
      if (data.token) {
        return { status: 'success', message: 'Registration successful! Please log in.' };
      }
      if (data.status === 'error') throw new Error(data.message || 'Registration failed');
      return data;
    } catch (err) {
      throw new Error(authErrMsg(err, 'Registration failed'));
    }
  };

  // Logout only clears this tab's session — other tabs are unaffected
  const logout = () => {
    clearToken();
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
