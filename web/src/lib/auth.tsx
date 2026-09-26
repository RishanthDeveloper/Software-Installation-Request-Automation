import React, { createContext, useContext, useState, } from 'react';
import type { User } from './mockUsers';
import { MOCK_USERS } from './mockUsers';

interface AuthContextType {
  user: User | null;
  login: (email: string) => boolean;
  loginAs: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('demo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string) => {
    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('demo_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const loginAs = (u: User) => {
    setUser(u);
    localStorage.setItem('demo_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demo_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
