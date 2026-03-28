import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, AgencyType } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole, agencyType?: AgencyType) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    agencyType?: AgencyType,
    phone?: string,
    agencyAddress?: string
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole, agencyType?: AgencyType) => {
    // Mock login - in production, this would call an API.
    // For now we only know the role and (optionally) agency type; agency
    // name/address are captured during signup and kept in memory.
    const mockUser: User = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      role,
      agencyType,
    };
    setUser(mockUser);
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    agencyType?: AgencyType,
    phone?: string,
    agencyAddress?: string
  ) => {
    // Mock signup - in production, this would call an API
    const mockUser: User = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
      agencyType,
      agencyAddress,
      phone,
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
