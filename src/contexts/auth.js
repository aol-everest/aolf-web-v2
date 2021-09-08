import React, { createContext, useContext } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children, userInfo }) => {
  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
