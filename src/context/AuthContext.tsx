import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the type for our auth context value.
interface AuthContextType {
  authData: { token: string; role: 'owner' | 'security' } | null;
  loading: boolean;
  login: (data: { token: string; role: 'owner' | 'security' }) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context, initially undefined.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authData, setAuthData] = useState<AuthContextType['authData']>(null);
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

  const login = async (data: { token: string; role: 'owner' | 'security' }) => {
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

// Custom hook that guarantees a non-null value.
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
