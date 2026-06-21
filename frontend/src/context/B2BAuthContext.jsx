import { createContext, useContext, useState } from 'react';
import b2bApi from '../services/b2bApi';
import toast from 'react-hot-toast';

const B2BAuthContext = createContext(null);

export function B2BAuthProvider({ children }) {
  const raw = sessionStorage.getItem('b2b_company');
  const [company, setCompany] = useState(raw ? JSON.parse(raw) : null);

  // Prefer a server field-level validation message over the generic one.
  const errMsg = (err, fallback) => {
    const errs = err.response?.data?.errors;
    if (errs && typeof errs === 'object') {
      const first = Object.values(errs)[0];
      if (first) return first;
    }
    return err.response?.data?.message || err.response?.data?.error || err.message || fallback;
  };

  const login = async (email, password) => {
    try {
      const res = await b2bApi.post('/b2b/login', { email, password });
      const data = res.data;
      sessionStorage.setItem('b2b_token', data.token);
      sessionStorage.setItem('b2b_company', JSON.stringify(data));
      setCompany(data);
      return data;
    } catch (err) {
      throw new Error(errMsg(err, 'Login failed'));
    }
  };

  const register = async (payload) => {
    try {
      const res = await b2bApi.post('/b2b/register', payload);
      return res.data;
    } catch (err) {
      throw new Error(errMsg(err, 'Registration failed'));
    }
  };

  const refreshProfile = async () => {
    if (!company?.organizationId) return;
    try {
      const res = await b2bApi.get(`/b2b/organizations/${company.organizationId}`);
      const updated = { ...company, ...res.data };
      sessionStorage.setItem('b2b_company', JSON.stringify(updated));
      setCompany(updated);
      return updated;
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('b2b_token');
    sessionStorage.removeItem('b2b_company');
    setCompany(null);
  };

  return (
    <B2BAuthContext.Provider value={{ company, login, register, logout, refreshProfile }}>
      {children}
    </B2BAuthContext.Provider>
  );
}

export function useB2BAuth() { return useContext(B2BAuthContext); }
