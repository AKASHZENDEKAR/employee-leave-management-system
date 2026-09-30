import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const clearAuth = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
  };


  const login = async (username, password) => {
    /*
     * Clear any old token before starting a fresh login.
     */
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    const response = await api.post(
      "/auth/login/",
      {
        username,
        password,
      }
    );

    const accessToken =
      response.data?.access;

    const refreshToken =
      response.data?.refresh;

    if (!accessToken || !refreshToken) {
      throw new Error(
        "Login succeeded but the server did not return JWT tokens."
      );
    }

    /*
     * Store JWT tokens BEFORE calling /me.
     */
    localStorage.setItem(
      "access_token",
      accessToken
    );

    localStorage.setItem(
      "refresh_token",
      refreshToken
    );

    /*
     * Verify the authenticated user.
     */
    const meResponse =
      await api.get("/auth/me/");

    setUser(meResponse.data);

    return meResponse.data;
  };


  const logout = () => {
    clearAuth();
  };


  useEffect(() => {
    const loadCurrentUser = async () => {
      const accessToken =
        localStorage.getItem("access_token");

      const refreshToken =
        localStorage.getItem("refresh_token");

      if (!accessToken && !refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await api.get("/auth/me/");

        setUser(response.data);

      } catch (error) {
        clearAuth();

      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}