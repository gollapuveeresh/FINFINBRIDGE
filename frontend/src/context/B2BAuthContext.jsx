import { createContext, useContext, useState } from 'react';
import b2bApi from '../services/b2bApi';
import toast from 'react-hot-toast';

const B2BAuthContext = createContext(null);

export function B2BAuthProvider({ children }) {
  const raw = sessionStorage.getItem('b2b_company');
  const [company, setCompany] = useState(raw ? JSON.parse(raw) : null);

  const login = async (email, password) => {
    try {
      const res = await b2bApi.post('/b2b/login', { email, password });
      const data = res.data;
      sessionStorage.setItem('b2b_token', data.token);
      sessionStorage.setItem('b2b_company', JSON.stringify(data));
      setCompany(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (payload) => {
    try {
      const res = await b2bApi.post('/b2b/register', payload);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('b2b_token');
    sessionStorage.removeItem('b2b_company');
    setCompany(null);
  };

  return (
    <B2BAuthContext.Provider value={{ company, login, register, logout }}>
      {children}
    </B2BAuthContext.Provider>
  );
}

export function useB2BAuth() { return useContext(B2BAuthContext); }
