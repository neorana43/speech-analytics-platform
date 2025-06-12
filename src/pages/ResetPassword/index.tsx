import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { Eye, EyeOff, Check, X } from "lucide-react";

import styles from "./ResetPassword.module.scss";

import { ApiService } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isFirstTimeLogin, logout } = useAuth();

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const [errors, setErrors] = useState({
    username: "",
    token: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Validate password on change
  useEffect(() => {
    setHasMinLength(newPassword.length >= 8);
    setHasUpperCase(/[A-Z]/.test(newPassword));
    setHasLowerCase(/[a-z]/.test(newPassword));
    setHasNumber(/[0-9]/.test(newPassword));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(newPassword));

    // Update password error message
    if (newPassword && !hasMinLength) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password must be at least 8 characters long",
      }));
    } else if (
      newPassword &&
      (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar)
    ) {
      setErrors((prev) => ({
        ...prev,
        newPassword:
          "Password must contain uppercase, lowercase, number, and special character",
      }));
    } else {
      setErrors((prev) => ({ ...prev, newPassword: "" }));
    }
  }, [
    newPassword,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  ]);

  // Check if passwords match
  useEffect(() => {
    setPasswordsMatch(newPassword === confirmPassword && newPassword !== "");

    if (confirmPassword && !passwordsMatch) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  }, [newPassword, confirmPassword, passwordsMatch]);

  // Get username from URL query parameters
  useEffect(() => {
    const usernameFromUrl = searchParams.get("username");

    if (usernameFromUrl) {
      setUsername(usernameFromUrl);
    }
  }, [searchParams]);

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!username || !token) {
        throw new Error("Please enter both username and token");
      }
      if (
        !hasMinLength ||
        !hasUpperCase ||
        !hasLowerCase ||
        !hasNumber ||
        !hasSpecialChar
      ) {
        throw new Error("Password does not meet the requirements.");
      }
      if (!passwordsMatch) {
        throw new Error("Passwords do not match.");
      }

      const api = ApiService(token);

      await api.resetPassword({
        username,
        token,
        newPassword,
      });
    },
    onSuccess: () => {
      addToast({
        title: "Success!",
        description: isFirstTimeLogin
          ? "Your password has been set successfully. Please log in with your new password."
          : "Your password has been reset successfully. Please log in with your new password.",
        color: "success",
      });

      // If this was a first-time login, log the user out
      if (isFirstTimeLogin) {
        logout();
      }
      navigate("/login");
    },
    onError: (error: any) => {
      addToast({
        title: "Error!",
        description:
          error.message || "Failed to reset password. Please try again.",
        color: "danger",
      });
    },
  });

  const resendTokenMutation = useMutation({
    mutationFn: async () => {
      if (!username) {
        throw new Error("Username is required to resend token");
      }

      const api = ApiService("");

      await api.forgotPassword({ username });
    },
    onSuccess: () => {
      addToast({
        title: "Success!",
        description: "A new token has been sent to your email.",
        color: "success",
      });
    },
    onError: (error: any) => {
      addToast({
        title: "Error!",
        description:
          error.message || "Failed to resend token. Please try again.",
        color: "danger",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetPasswordMutation.mutate();
  };

  const handleResendToken = () => {
    resendTokenMutation.mutate();
  };

  const toggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setUsername(value);
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, username: "Username is required" }));
    } else {
      setErrors((prev) => ({ ...prev, username: "" }));
    }
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setToken(value);
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, token: "Token is required" }));
    } else {
      setErrors((prev) => ({ ...prev, token: "" }));
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setConfirmPassword(e.target.value);
  };

  return (
    <div className={styles.resetPasswordContainer}>
      <div className="flex flex-col items-center justify-center gap-7 max-w-[28.875rem] w-full">
        <img alt="logo" height={56} src="/logo.svg" width={296} />

        <Card className="w-full py-8 px-12 gap-0">
          {resetPasswordMutation.isPending ? (
            <>
              <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight">
                <h1 className="text-3xl font-medium">Resetting Password</h1>
              </CardHeader>
              <CardBody className="px-0 py-20 text-center">
                <img
                  alt="Loading"
                  className="mx-auto"
                  height={120}
                  src="/loader.gif"
                  width={120}
                />
              </CardBody>
            </>
          ) : (
            <>
              <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight">
                <h1 className="text-3xl font-medium">
                  {isFirstTimeLogin ? "Set Password" : "Reset Password"}
                </h1>
                <p className="font-bold text-sm">
                  {isFirstTimeLogin
                    ? "Please set a password for your account"
                    : "Please enter your token from email and new password"}
                </p>
              </CardHeader>
              <CardBody className="px-0 py-20">
                <form
                  className="gap-8 flex flex-col items-center px-1"
                  onSubmit={handleSubmit}
                >
                  <div className="w-full">
                    <Input
                      required
                      classNames={{
                        inputWrapper: "text-midnight font-roboto bg-light",
                        helperWrapper: "p-1 pl-4",
                      }}
                      disabled={!!searchParams.get("username")}
                      errorMessage={errors.username}
                      isInvalid={!!errors.username}
                      label="Username"
                      radius="full"
                      value={username}
                      onChange={handleUsernameChange}
                    />
                  </div>
                  <div className="w-full">
                    <Input
                      required
                      classNames={{
                        inputWrapper: "text-midnight font-roboto bg-light",
                        helperWrapper: "p-1 pl-4",
                      }}
                      errorMessage={errors.token}
                      isInvalid={!!errors.token}
                      label="Token"
                      radius="full"
                      value={token}
                      onChange={handleTokenChange}
                    />
                  </div>
                  <div className="w-full relative">
                    <Input
                      required
                      classNames={{
                        inputWrapper: "text-midnight font-roboto bg-light",
                        helperWrapper: "p-1 pl-4",
                      }}
                      errorMessage={errors.newPassword}
                      isInvalid={!!errors.newPassword}
                      label="New Password"
                      radius="full"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                    />
                    <Button
                      isIconOnly
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                      radius="full"
                      size="sm"
                      onPress={toggleNewPassword}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                    <div className="mt-2 space-y-1 text-sm">
                      <div
                        className={`flex items-center gap-2 ${hasMinLength ? "text-success" : "text-danger"}`}
                      >
                        {hasMinLength ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>At least 8 characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${hasUpperCase ? "text-success" : "text-danger"}`}
                      >
                        {hasUpperCase ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>At least one uppercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${hasLowerCase ? "text-success" : "text-danger"}`}
                      >
                        {hasLowerCase ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>At least one lowercase letter</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${hasNumber ? "text-success" : "text-danger"}`}
                      >
                        {hasNumber ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>At least one number</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${hasSpecialChar ? "text-success" : "text-danger"}`}
                      >
                        {hasSpecialChar ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>At least one special character</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full relative">
                    <Input
                      required
                      classNames={{
                        inputWrapper: "text-midnight font-roboto bg-light",
                        helperWrapper: "p-1 pl-4",
                      }}
                      errorMessage={errors.confirmPassword}
                      isInvalid={!!errors.confirmPassword}
                      label="Confirm Password"
                      radius="full"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                    />
                    <Button
                      isIconOnly
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                      radius="full"
                      size="sm"
                      onPress={toggleConfirmPassword}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-col items-center gap-4 w-full">
                    <Button
                      className="w-full px-7 py-3 text-sm font-medium font-roboto"
                      color="primary"
                      disabled={
                        resetPasswordMutation.isPending ||
                        resendTokenMutation.isPending
                      }
                      radius="full"
                      type="submit"
                    >
                      {isFirstTimeLogin ? "Set Password" : "Reset Password"}
                    </Button>
                    {!isFirstTimeLogin && (
                      <Button
                        className="w-full px-7 py-3 text-sm font-medium font-roboto"
                        color="secondary"
                        disabled={
                          resetPasswordMutation.isPending ||
                          resendTokenMutation.isPending
                        }
                        radius="full"
                        onPress={handleResendToken}
                      >
                        Resend Token
                      </Button>
                    )}
                  </div>
                </form>
              </CardBody>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
