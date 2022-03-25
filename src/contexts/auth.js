import React, { createContext, useContext } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children, userInfo, reloadProfile }) => {
  return (
    <AuthContext.Provider value={[userInfo, reloadProfile]}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
