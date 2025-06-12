import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import styles from "./ChangePassword.module.scss";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { token, user, isFirstTimeLogin, logout } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // Validate password on change
  useEffect(() => {
    setHasMinLength(formData.newPassword.length >= 8);
    setHasUpperCase(/[A-Z]/.test(formData.newPassword));
    setHasLowerCase(/[a-z]/.test(formData.newPassword));
    setHasNumber(/[0-9]/.test(formData.newPassword));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword));

    // Update password error message
    if (formData.newPassword && !hasMinLength) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password must be at least 8 characters long",
      }));
    } else if (
      formData.newPassword &&
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
    formData.newPassword,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  ]);

  // Check if passwords match
  useEffect(() => {
    setPasswordsMatch(
      formData.newPassword === formData.confirmPassword &&
        formData.newPassword !== "",
    );

    if (formData.confirmPassword && !passwordsMatch) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  }, [formData.newPassword, formData.confirmPassword, passwordsMatch]);

  // Redirect if not first time login
  useEffect(() => {
    if (!isFirstTimeLogin) {
      navigate("/login");
    }
  }, [isFirstTimeLogin, navigate]);

  // Set username from user context
  useEffect(() => {
    if (user?.username) {
      setFormData((prev) => ({
        ...prev,
        username: user.username,
      }));
    }
  }, [user]);

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!token || !user?.user_id) {
        throw new Error("No token or user ID available");
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
      const response = await api.changePassword(
        user.user_id,
        formData.newPassword,
      );

      if (!response.success) {
        throw new Error("Failed to change password");
      }

      return response;
    },
    onSuccess: () => {
      addToast({
        title: "Success",
        description:
          "Password changed successfully. Please login with your new password.",
        color: "success",
      });
      // Logout the user to clear all auth state
      logout();
      // Navigate to login page
      navigate("/login", { replace: true });
    },
    onError: (error: any) => {
      handleApiError(error, "Failed to change password. Please try again.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !hasMinLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumber ||
      !hasSpecialChar
    ) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password does not meet the requirements.",
      }));

      return;
    }
    if (!passwordsMatch) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match.",
      }));

      return;
    }
    changePasswordMutation.mutate();
  };

  const toggleNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={styles.changePasswordContainer}>
      <div className="flex flex-col items-center justify-center gap-7 max-w-[28.875rem] w-full">
        <img alt="logo" height={56} src="/logo.svg" width={296} />

        <Card className="w-full py-8 px-12 gap-0">
          <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight">
            <h1 className="text-3xl font-medium">Change Password</h1>
            <p className="font-bold text-sm">Please set your new password</p>
          </CardHeader>
          <CardBody className="px-0 py-10">
            <form
              className="gap-8 flex flex-col items-center px-1"
              onSubmit={handleSubmit}
            >
              <Input
                required
                classNames={{
                  inputWrapper: "text-midnight font-roboto bg-light",
                  helperWrapper: "p-1 pl-4",
                }}
                disabled={true}
                label="Username"
                name="username"
                radius="full"
                type="text"
                value={formData.username}
              />
              <div className="w-full relative">
                <Input
                  required
                  classNames={{
                    inputWrapper: "text-midnight font-roboto bg-light",
                    helperWrapper: "p-1 pl-4",
                  }}
                  disabled={changePasswordMutation.isPending}
                  errorMessage={errors.newPassword}
                  isInvalid={!!errors.newPassword}
                  label="New Password"
                  name="newPassword"
                  radius="full"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <Button
                  isIconOnly
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                  disabled={changePasswordMutation.isPending}
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
                  disabled={changePasswordMutation.isPending}
                  errorMessage={errors.confirmPassword}
                  isInvalid={!!errors.confirmPassword}
                  label="Confirm New Password"
                  name="confirmPassword"
                  radius="full"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <Button
                  isIconOnly
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                  disabled={changePasswordMutation.isPending}
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
              <Button
                className="mt-4 px-7 py-3 text-sm font-medium font-roboto"
                color="primary"
                disabled={
                  changePasswordMutation.isPending ||
                  !hasMinLength ||
                  !hasUpperCase ||
                  !hasLowerCase ||
                  !hasNumber ||
                  !hasSpecialChar ||
                  !passwordsMatch
                }
                isLoading={changePasswordMutation.isPending}
                radius="full"
                type="submit"
              >
                Change Password
              </Button>
              <div className="text-center mt-2">
                <a
                  className="text-primary text-sm font-medium font-roboto hover:underline"
                  href="/login"
                >
                  Back to Login
                </a>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ChangePassword;
