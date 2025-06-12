import type { User } from "@/types/auth";
import type { Role, Client } from "@/types/user";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { Checkbox } from "@heroui/react";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";

const Settings = () => {
  const { user, token, refreshUser } = useAuth() as {
    user: User | null;
    token: string | null;
    refreshUser: () => Promise<void>;
  };
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
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

  useEffect(() => {
    const fetchRolesAndClients = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const api = ApiService(token);
        const [rolesData, clientsData] = await Promise.all([
          api.getRoles(),
          api.getClients(),
        ]);

        setRoles(rolesData);
        setClients(clientsData);
      } catch (error: any) {
        handleApiError(error, "Failed to fetch roles and clients data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRolesAndClients();
  }, [token]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("No token available");
      const api = ApiService(token);

      await api.updateProfile({
        firstName: firstName,
        lastName: lastName,
        email: email,
      });
    },
    onSuccess: async () => {
      addToast({
        title: "Success!",
        description: "Profile updated successfully.",
        color: "success",
      });
      // Refresh user data to update the topbar
      await refreshUser();
    },
    onError: (error: any) => {
      addToast({
        title: "Error!",
        description:
          error.message || "Failed to update profile. Please try again.",
        color: "danger",
      });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!token || !user?.user_id)
        throw new Error("No token or user ID available");
      if (!currentPassword) {
        throw new Error("Current password is required");
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

      await api.changePassword(user.user_id, newPassword);
    },
    onSuccess: () => {
      addToast({
        title: "Success!",
        description: "Password changed successfully.",
        color: "success",
      });
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      if (error.message === "Current password is required") {
        setErrors((prev) => ({ ...prev, currentPassword: error.message }));
      } else if (error.message === "Password does not meet the requirements.") {
        setErrors((prev) => ({ ...prev, newPassword: error.message }));
      } else if (error.message === "Passwords do not match.") {
        setErrors((prev) => ({ ...prev, confirmPassword: error.message }));
      }
      addToast({
        title: "Error!",
        description:
          error.message || "Failed to change password. Please try again.",
        color: "danger",
      });
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setErrors((prev) => ({
        ...prev,
        currentPassword: "Current password is required",
      }));

      return;
    }
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

  const globalRoles = roles.filter((role) => role.is_global);

  return (
    <div className="flex flex-col gap-4 flex-1 lg:px-6 px-5 lg:pb-6 pb-5 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="page-title text-primary">My Settings</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gap-6 flex flex-col">
          <Card className="p-6 w-full">
            <CardHeader className="flex flex-col gap-1 items-start">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <p className="text-sm text-gray-500">
                Update your personal information
              </p>
            </CardHeader>
            <CardBody>
              <form className="space-y-4" onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    required
                    label="First Name"
                    radius="full"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <Input
                    required
                    label="Last Name"
                    radius="full"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <Input
                  required
                  label="Email"
                  radius="full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  className="px-7 py-3 text-sm font-medium font-roboto"
                  color="primary"
                  isLoading={updateProfileMutation.isPending}
                  radius="full"
                  type="submit"
                >
                  Update Profile
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card className="p-6 w-full">
            <CardHeader className="flex flex-col gap-1 items-start">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <p className="text-sm text-gray-500">Update your password</p>
            </CardHeader>
            <CardBody>
              <form className="space-y-4" onSubmit={handlePasswordChange}>
                <div className="relative">
                  <Input
                    required
                    errorMessage={errors.currentPassword}
                    isInvalid={!!errors.currentPassword}
                    label="Current Password"
                    radius="full"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Button
                    isIconOnly
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                    radius="full"
                    size="sm"
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    required
                    errorMessage={errors.newPassword}
                    isInvalid={!!errors.newPassword}
                    label="New Password"
                    radius="full"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    isIconOnly
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                    radius="full"
                    size="sm"
                    onPress={() => setShowNewPassword(!showNewPassword)}
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
                <div className="relative">
                  <Input
                    required
                    errorMessage={errors.confirmPassword}
                    isInvalid={!!errors.confirmPassword}
                    label="Confirm New Password"
                    radius="full"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <Button
                    isIconOnly
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                    radius="full"
                    size="sm"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <Button
                  className="px-7 py-3 text-sm font-medium font-roboto"
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
              </form>
            </CardBody>
          </Card>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Card className="p-6 w-full">
            <CardHeader className="flex flex-col gap-1 items-start">
              <h2 className="text-xl font-semibold">Your Roles</h2>
              <p className="text-sm text-gray-500">View your assigned roles</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-midnight mb-4">
                    Admin Roles
                  </h3>
                  <div className="flex flex-col gap-4">
                    {globalRoles.map((role) => (
                      <Checkbox
                        key={role.role_id}
                        isDisabled
                        isSelected={user?.global_role_ids?.includes(
                          role.role_id,
                        )}
                      >
                        {role.role_name}
                      </Checkbox>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-midnight mb-4">
                    Client Roles
                  </h3>
                  {clients.map((client) => {
                    const clientRoles =
                      user?.client_roles?.find(
                        (cr) => cr.client_id === client.id,
                      )?.role_ids || [];

                    return (
                      <div key={client.id} className="mb-6">
                        <h4 className="font-medium text-gray-700 mb-2">
                          {client.name}
                        </h4>
                        <div className="flex flex-col gap-4">
                          {clientRoles.map((roleId) => {
                            const role = roles.find(
                              (r) => r.role_id === roleId,
                            );

                            return role ? (
                              <Checkbox
                                key={role.role_id}
                                isDisabled
                                isSelected={true}
                              >
                                {role.role_name}
                              </Checkbox>
                            ) : null;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
