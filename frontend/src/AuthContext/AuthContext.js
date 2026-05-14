import { createContext, useContext, useEffect, useState } from "react";
import { checkUserAuthStatusAPI } from "../apis/user/usersAPI";
import { useQuery } from "@tanstack/react-query";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { isError, isLoading, data, isSuccess } = useQuery({
    queryFn: checkUserAuthStatusAPI,
    queryKey: ["checkAuth"],
    staleTime: 1000 * 60 * 5, // ✅ cache for 5 mins — avoids hitting backend on every page load
    retry: 0, // ✅ fail fast — don't retry 3 times on auth failure
    refetchOnWindowFocus: false, // ✅ don't refetch when switching browser tabs
  });

  // Update isAuthenticated when query result comes back
  useEffect(() => {
    if (isSuccess) {
      setIsAuthenticated(data);
    }
    // ✅ Explicitly set false on error so user gets redirected to login
    if (isError) {
      setIsAuthenticated(false);
    }
  }, [data, isSuccess, isError]);

  // ✅ Called right after login API succeeds — instantly marks user as authenticated
  // without waiting for checkAuth query to refetch
  const login = () => setIsAuthenticated(true);

  // ✅ Called right after logout — instantly marks user as unauthenticated
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isError, isLoading, isSuccess, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
