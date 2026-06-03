import { createContext, useContext, useState, useEffect } from 'react';

// Context = global state that any component can read
// without passing props through every parent.
// Perfect for: who is logged in, their token, their name.

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage so user stays
  // logged in after page refresh.
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  // Called after successful login or register.
  // Saves to both state (for this session)
  // and localStorage (persists across refreshes).
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  // Clears everything on logout.
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // isAuthenticated = simple boolean check
  // any component can use this to know if user is logged in
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — instead of writing useContext(AuthContext)
// in every component, you write useAuth().
// Clean and readable.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};