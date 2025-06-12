import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Button,
  Chip,
  Spinner,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import {
  Plus,
  Mail,
  UserRoundCheck,
  UserRoundMinus,
  UserRoundPen,
  Trash2,
} from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { User } from "@/types/user";

interface Role {
  role_id: number;
  role_name: string;
  is_global: boolean;
}

const Users = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const api = ApiService(token!);
      const [usersData, rolesData] = await Promise.all([
        api.getUsers(),
        api.getRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
    } catch (error: any) {
      handleApiError(error, "Failed to fetch users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    try {
      const api = ApiService(token!);

      await api.setUserActiveStatus(userId, isActive);

      addToast({
        title: "Success",
        description: `User ${isActive ? "activated" : "deactivated"} successfully.`,
        color: "success",
      });
      fetchUsers();
    } catch (error: any) {
      handleApiError(error, "Failed to update user status. Please try again.");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const api = ApiService(token!);

      await api.deleteUser(userId);

      addToast({
        title: "Success",
        description: "User deleted successfully.",
        color: "success",
      });
      fetchUsers();
      onClose();
    } catch (error: any) {
      console.error("Delete user error details:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      handleApiError(error, "Failed to delete user. Please try again.");
    }
  };

  const handleSendWelcomeEmail = async (userId: number) => {
    try {
      const api = ApiService(token!);

      await api.sendWelcomeEmail(userId);

      addToast({
        title: "Success",
        description: "Welcome email sent successfully.",
        color: "success",
      });
    } catch (error: any) {
      handleApiError(error, "Failed to send welcome email. Please try again.");
    }
  };

  const getRoleName = (user: User) => {
    // Get the first global role name
    if (user.admin_roles && user.admin_roles.length > 0) {
      const globalRoleId = user.admin_roles[0];
      const globalRole = roles.find((r) => r.role_id === globalRoleId);

      if (globalRole) {
        return globalRole.role_name;
      }
    }

    // If no global role, get the first client role name
    if (user.clients_roles && user.clients_roles.length > 0) {
      const firstClientRole = user.clients_roles[0];

      if (firstClientRole.role_ids && firstClientRole.role_ids.length > 0) {
        const clientRoleId = firstClientRole.role_ids[0];
        const clientRole = roles.find((r) => r.role_id === clientRoleId);

        if (clientRole) {
          return clientRole.role_name;
        }
      }
    }

    return "Unknown Role";
  };

  const classNames = useMemo(
    () => ({
      base: "flex-1",
      wrapper: ["flex-1"],
      th: [
        "bg-transparent",
        "text-light-gray",
        "uppercase",
        "border-b",
        "border-divider",
      ],
      td: [
        "group-data-[first=true]/tr:first:before:rounded-none",
        "group-data-[first=true]/tr:last:before:rounded-none",
        "group-data-[middle=true]/tr:before:rounded-none",
        "group-data-[last=true]/tr:first:before:rounded-none",
        "group-data-[last=true]/tr:last:before:rounded-none",
      ],
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-4 flex-1 mt-8">
      <Card className="w-full pt-8 px-2 gap-0 flex-1">
        <CardHeader className="flex items-center px-4  gap-4 font-roboto text-midnight justify-between">
          <h1 className="text-3xl font-medium">Users</h1>
          <Button
            className="px-7 py-3 text-sm font-medium font-roboto"
            color="primary"
            radius="full"
            startContent={<Plus />}
            onPress={() => navigate("/users/add")}
          >
            Add User
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table
              aria-label="Users table"
              classNames={classNames}
              rowHeight={50}
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleName(user)}</TableCell>
                    <TableCell>
                      <Chip
                        color={user.is_active ? "success" : "danger"}
                        variant="flat"
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip
                          content={
                            user.is_active ? "Deactivate User" : "Activate User"
                          }
                        >
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              handleStatusChange(user.user_id, !user.is_active)
                            }
                          >
                            {user.is_active ? (
                              <UserRoundMinus className="text-dark" />
                            ) : (
                              <UserRoundCheck className="text-dark" />
                            )}
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit User">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              navigate(`/users/edit/${user.user_id}`)
                            }
                          >
                            <UserRoundPen className="text-dark" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Send Welcome Email">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => handleSendWelcomeEmail(user.user_id)}
                          >
                            <Mail className="text-dark" />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete User">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() => {
                              setSelectedUser(user);
                              onOpen();
                            }}
                          >
                            <Trash2 className="text-red-500" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            Are you sure you want to delete user{" "}
            {selectedUser
              ? `${selectedUser.first_name} ${selectedUser.last_name}`
              : ""}
            ? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              radius="full"
              variant="light"
              onPress={onClose}
            >
              Cancel
            </Button>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="danger"
              radius="full"
              onPress={() =>
                selectedUser && handleDeleteUser(selectedUser.user_id)
              }
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Users;
