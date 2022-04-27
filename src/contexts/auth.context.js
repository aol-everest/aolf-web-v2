import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({
  children,
  userInfo,
  setUserInfo,
  reloadProfile,
  authenticated,
}) => {
  return (
    <AuthContext.Provider
      value={{
        user: userInfo,
        setUser: setUserInfo,
        reloadProfile,
        authenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
