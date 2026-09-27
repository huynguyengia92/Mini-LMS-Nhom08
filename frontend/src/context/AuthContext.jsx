import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    setUser(res.data.user);
  }
  async function loginWithGoogle(credential) {
        const res = await api.post('/auth/google', {
            credential,
        });

        setUser(res.data.user);
    }
  async function register(payload) {
    const res = await api.post('/auth/register', payload);
    setUser(res.data.user);
  }

  async function logout() {
    await api.post('/auth/logout');
    setUser(null);
  }

  return (
      <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
