import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Spinner,
  Checkbox,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { Eye, EyeOff, Check, X } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { UserFormData, Role, Client } from "@/types/user";

interface UserFormProps {
  userId?: number;
  mode: "add" | "edit";
}

const UserForm = ({ userId, mode }: UserFormProps) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    isActive: true,
    adminRoles: [],
    clientRoles: {},
  });

  // Password change modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Password validation states
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasUpperCase, setHasUpperCase] = useState(false);
  const [hasLowerCase, setHasLowerCase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [errors, setErrors] = useState({
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
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const api = ApiService(token!);

        // Fetch roles and clients in parallel
        const [rolesData, clientsData] = await Promise.all([
          api.getRoles(),
          api.getClients(),
        ]);

        setRoles(rolesData);
        setClients(clientsData);

        if (mode === "edit" && userId) {
          const userData = await api.getUser(userId);

          if (userData) {
            const adminRoles = Array.isArray(userData.global_role_ids)
              ? userData.global_role_ids
              : [];

            setFormData({
              username: userData.username,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              isActive: userData.is_active,
              adminRoles: adminRoles,
              clientRoles: (userData.client_roles || []).reduce(
                (
                  acc: { [key: number]: number[] },
                  curr: { client_id: number; role_ids: number[] },
                ) => {
                  acc[curr.client_id] = curr.role_ids;

                  return acc;
                },
                {},
              ),
            });
          }
        }
      } catch (error: any) {
        handleApiError(
          error,
          "Failed to fetch required data. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, userId, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const api = ApiService(token!);

      const payload = {
        user_id: userId || 0,
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        is_active: formData.isActive,
        global_role_ids: formData.adminRoles,
        client_roles: Object.entries(formData.clientRoles).map(
          ([clientId, roleIds]) => ({
            client_id: parseInt(clientId),
            role_ids: roleIds,
          }),
        ),
      };

      await api.saveUser(payload);

      addToast({
        title: "Success",
        description: `User ${mode === "add" ? "created" : "updated"} successfully.`,
        color: "success",
      });
      navigate("/users");
    } catch (error: any) {
      handleApiError(error, `Failed to ${mode} user. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminRoleChange = (roleId: number, checked: boolean) => {
    setFormData((prev) => {
      const newAdminRoles = checked
        ? [...prev.adminRoles, roleId]
        : prev.adminRoles.filter((id) => id !== roleId);

      return {
        ...prev,
        adminRoles: newAdminRoles,
      };
    });
  };

  const handleClientRoleChange = (roleId: number, checked: boolean) => {
    if (!selectedClient) return;

    setFormData((prev) => ({
      ...prev,
      clientRoles: {
        ...prev.clientRoles,
        [selectedClient]: checked
          ? [...(prev.clientRoles[selectedClient] || []), roleId]
          : (prev.clientRoles[selectedClient] || []).filter(
              (id) => id !== roleId,
            ),
      },
    }));
  };

  const handleChangePassword = async () => {
    if (!userId || !token) return;

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

    setIsChangingPassword(true);
    try {
      const api = ApiService(token);

      await api.changePassword(userId, newPassword);

      addToast({
        title: "Success",
        description: "Password changed successfully",
        color: "success",
      });

      // Reset form and close modal
      setNewPassword("");
      setConfirmPassword("");
      setIsModalOpen(false);
    } catch (error: any) {
      handleApiError(error, "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const globalRoles = roles.filter((role) => role.is_global);
  const clientRoles = roles.filter((role) => !role.is_global);

  return (
    <div className="flex flex-col gap-4 flex-1 lg:px-6 px-5 lg:pb-6 pb-5 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4">
        <h2 className="page-title text-primary">
          {mode === "add" ? "Add New User" : "Edit User"}
        </h2>
        {mode === "edit" && (
          <Button
            className="px-7 py-3 text-sm font-medium font-roboto"
            color="primary"
            radius="full"
            onPress={() => setIsModalOpen(true)}
          >
            Change Password
          </Button>
        )}
      </div>

      <Card className="p-6 gap-6 flex flex-col">
        <h2 className="text-xl font-semibold text-midnight">
          User Information
        </h2>
        <div className="flex gap-4 text-sm text-gray-600 border-b border-gray-200">
          <div className="pb-2 border-b-2 border-primary text-primary font-semibold">
            Basic Info
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              isRequired
              classNames={{
                inputWrapper: "text-midnight font-roboto bg-light",
              }}
              label="Username"
              radius="full"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <Input
              isRequired
              classNames={{
                inputWrapper: "text-midnight font-roboto bg-light",
              }}
              label="Email"
              radius="full"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              isRequired
              classNames={{
                inputWrapper: "text-midnight font-roboto bg-light",
              }}
              label="First Name"
              radius="full"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
            />
            <Input
              isRequired
              classNames={{
                inputWrapper: "text-midnight font-roboto bg-light",
              }}
              label="Last Name"
              radius="full"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-midnight">Admin Roles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {globalRoles.map((role) => {
                const isSelected = formData.adminRoles.includes(role.role_id);

                return (
                  <Checkbox
                    key={role.role_id}
                    isSelected={isSelected}
                    onValueChange={(checked) =>
                      handleAdminRoleChange(role.role_id, checked)
                    }
                  >
                    {role.role_name}
                  </Checkbox>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-midnight">
              Client Roles
            </h3>
            <Select
              label="Select Client"
              placeholder="Choose a client"
              radius="full"
              selectedKeys={selectedClient ? [selectedClient.toString()] : []}
              onChange={(e) => setSelectedClient(Number(e.target.value))}
            >
              {clients.map((client) => (
                <SelectItem key={client.id}>{client.name}</SelectItem>
              ))}
            </Select>

            {selectedClient && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientRoles.map((role) => (
                  <Checkbox
                    key={role.role_id}
                    isSelected={formData.clientRoles[selectedClient]?.includes(
                      role.role_id,
                    )}
                    onValueChange={(checked) =>
                      handleClientRoleChange(role.role_id, checked)
                    }
                  >
                    {role.role_name}
                  </Checkbox>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-between">
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="primary"
              isLoading={isSubmitting}
              radius="full"
              type="submit"
            >
              {mode === "add" ? "Create User" : "Update User"}
            </Button>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="default"
              radius="full"
              onPress={() => navigate("/users")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>

      {/* Password Change Modal */}
      <Modal
        isOpen={isModalOpen}
        placement="center"
        onClose={() => setIsModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>Change User Password</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  classNames={{
                    inputWrapper: "text-midnight font-roboto bg-light",
                  }}
                  errorMessage={errors.newPassword}
                  isInvalid={!!errors.newPassword}
                  label="New Password"
                  radius="full"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  isIconOnly
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                  radius="full"
                  size="sm"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
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
                  classNames={{
                    inputWrapper: "text-midnight font-roboto bg-light",
                  }}
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
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="default"
              radius="full"
              onPress={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="primary"
              disabled={
                isChangingPassword ||
                !hasMinLength ||
                !hasUpperCase ||
                !hasLowerCase ||
                !hasNumber ||
                !hasSpecialChar ||
                !passwordsMatch
              }
              isLoading={isChangingPassword}
              radius="full"
              onPress={handleChangePassword}
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default UserForm;
