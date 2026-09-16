import React, { createContext, useContext, useEffect, useState } from 'react';
import { ZapApi } from '../services/api';
import { Address, User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  selectedAddress: Address | null;
  setSelectedAddress: (addr: Address) => void;
  loginWithPhone: (phone: string) => Promise<{ demoOtp: string; isNewUser?: boolean }>;
  signup: (data: { phone: string; name: string; email?: string; referralCode?: string; city?: string; addressLine?: string }) => Promise<{ success: boolean; demoOtp: string; message: string; alreadyExists?: boolean }>;
  checkUser: (phone: string) => Promise<{ exists: boolean; user?: any }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  skipLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default true for instant preview demo
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    // Load initial user
    ZapApi.getUser().then(u => {
      setUser(u);
      if (u.addresses.length > 0) {
        setSelectedAddress(u.addresses[0]);
      }
    });
  }, []);

  const checkUser = async (phone: string) => {
    const res = await ZapApi.checkUser(phone);
    return { exists: res.exists, user: res.user };
  };

  const loginWithPhone = async (phone: string) => {
    const res = await ZapApi.login(phone);
    return { demoOtp: res.demoOtp, isNewUser: res.isNewUser };
  };

  const signup = async (data: { phone: string; name: string; email?: string; referralCode?: string; city?: string; addressLine?: string }) => {
    const res = await ZapApi.signup(data);
    return res;
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const res = await ZapApi.verifyOtp(phone, otp);
      setUser(res.user);
      setIsAuthenticated(true);
      if (res.user.addresses.length > 0) {
        setSelectedAddress(res.user.addresses[0]);
      }
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const skipLogin = () => {
    setIsAuthenticated(true);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await ZapApi.updateUser(data);
    setUser(updated);
  };

  const addAddress = (addr: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress: Address = {
      ...addr,
      id: 'addr_' + Date.now(),
    };
    const updatedUser = {
      ...user,
      addresses: [...user.addresses, newAddress],
    };
    setUser(updatedUser);
    setSelectedAddress(newAddress);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        selectedAddress,
        setSelectedAddress,
        loginWithPhone,
        signup,
        checkUser,
        verifyOtp,
        logout,
        updateProfile,
        addAddress,
        skipLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
