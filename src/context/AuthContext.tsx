'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '../types';

interface User {
  id: number;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Utente di default (iniziamo come cliente o vuoto)
  /*
  const [user, setUser] = useState<User | null>({
    id: 1,
    name: 'Mario Rossi',
    role: 'cliente',
  });
*/
  const [user, setUser] = useState<User | null>(null);

  // Funzione rapida per simulare il login con un ruolo specifico
  const login = (role: UserRole) => {
    const mockNames: Record<UserRole, string> = {
      cliente: 'Mario Rossi (Cliente)',
      gestore: 'Luigi (Gestore/Cassa)',
      pizzaiolo: 'Giovanni (KDS Cucina)',
      admin: 'Admin Pizzeria',
    };

    setUser({
      id: Math.floor(Math.random() * 100),
      name: mockNames[role],
      role: role,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
};