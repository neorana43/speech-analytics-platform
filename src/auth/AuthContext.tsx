import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

import { privateApi } from "@/lib/privateAxios";
import { ApiService } from "@/lib/api";

type User = {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  global_role_ids: number[];
  client_roles: {
    client_id: number;
    role_ids: number[];
  }[];
};

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  isFirstTimeLogin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (formData: FormData) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState<User | null>(null);
  const [isFirstTimeLogin, setIsFirstTimeLogin] = useState(false);

  const login = async (username: string, password: string) => {
    try {
      const response = await privateApi.post("/Auth/login", {
        username,
        password,
      });

      console.log("Raw Login Response:", response.data);

      const { token, refresh_token, first_time_login } = response.data;

      // Validate required fields
      if (!token) {
        throw new Error("No access token received from server");
      }

      // For first-time login, don't store token and set isAuthenticated to false
      if (first_time_login) {
        setToken(null);
        setIsAuthenticated(false);
        setIsFirstTimeLogin(true);
        // Don't store in localStorage or cookies
        console.log("First time login - token not stored");
      } else {
        // Regular login - store everything
        localStorage.setItem("token", token);
        setToken(token);
        setIsAuthenticated(true);
        setIsFirstTimeLogin(false);

        if (refresh_token) {
          Cookies.set("refresh_token", refresh_token, {
            secure: true,
            sameSite: "strict",
          });
          console.log("Refresh token set in cookie");
        }

        // Fetch user details for regular login
        const apiService = ApiService(token);
        const userData = await apiService.getMe();

        console.log("User data from /Auth/me:", userData);
        setUser(userData);
      }

      console.log("Auth State Updated:", {
        isAuthenticated: !first_time_login, // Set to false for first-time login
        isFirstTimeLogin: first_time_login,
        hasToken: !first_time_login && !!token,
        hasRefreshToken: !first_time_login && !!refresh_token,
        tokenLength: token?.length,
        refreshTokenLength: refresh_token?.length,
      });

      // Clear any previously selected client
      localStorage.removeItem("selectedClient");

      // Force redirect to reset password for first time login
      if (first_time_login === true) {
        console.log(
          "First time login detected, forcing redirect to change password",
        );
        // Use replace to prevent back navigation
        navigate("/change-password", { replace: true });

        return; // Exit early to prevent further navigation
      }

      console.log("Regular login, redirecting to client selection");
      navigate("/client-selection");
    } catch (error: any) {
      console.error("Login Error:", {
        error,
        message: error?.message,
        response: error?.response?.data,
      });
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      setIsFirstTimeLogin(false);
      localStorage.removeItem("token");
      Cookies.remove("refresh_token");
      throw error;
    }
  };

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem("token");
    localStorage.removeItem("selectedClient");
    Cookies.remove("refresh_token");

    // Reset all state
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setIsFirstTimeLogin(false);

    // Navigate to login page
    navigate("/login", { replace: true });
  };

  const updateUser = async (formData: FormData) => {
    try {
      const response = await privateApi.put("/Auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(response.data);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);

      return;
    }

    try {
      const apiService = ApiService(storedToken);
      const userData = await apiService.getMe();

      setUser(userData);
    } catch (error) {
      console.error("Error refreshing user data:", error);
      throw error;
    }
  };

  // Check token validity on mount and when token changes
  useEffect(() => {
    const checkTokenValidity = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);

        return;
      }

      setToken(storedToken);
      setIsAuthenticated(true);

      // Fetch user details if token exists but user object is not populated
      if (!user) {
        try {
          const apiService = ApiService(storedToken);
          const userData = await apiService.getMe();

          console.log("User data from /Auth/me (useEffect):", userData);
          setUser(userData);
          // Check if it's a first-time login after fetching user data
          // This is a fallback in case the first_time_login flag is not returned by login directly
          // or if the page is refreshed on the /change-password route
          if (userData.first_time_login) {
            setIsFirstTimeLogin(true);
          }
        } catch (error) {
          console.error("Error fetching user details on mount:", error);
          // If fetching user details fails, consider as unauthenticated
          setIsAuthenticated(false);
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          Cookies.remove("refresh_token");
        }
      }
    };

    checkTokenValidity();
  }, [token, user]); // Add user to dependency array to re-run if user is null

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        isFirstTimeLogin,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error("useAuth must be used within AuthProvider");

  return context;
};
