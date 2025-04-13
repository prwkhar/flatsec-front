import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthData {
  token: string;
  role: 'owner' | 'security' | 'admin';
}

interface AuthContextType {
  authData: AuthData | null;
  loading: boolean;
  login: (data: AuthData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('authData');
        if (storedData) {
          setAuthData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error('Failed to load auth data', error);
      }
      setLoading(false);
    };
    loadAuthData();
  }, []);

  const login = async (data: AuthData) => {
    setAuthData(data);
    await AsyncStorage.setItem('authData', JSON.stringify(data));
  };

  const logout = async () => {
    setAuthData(null);
    await AsyncStorage.removeItem('authData');
  };

  return (
    <AuthContext.Provider value={{ authData, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
