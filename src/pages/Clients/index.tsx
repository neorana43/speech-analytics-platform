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
  Tooltip,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { Plus, CheckCircle2, XCircle, PenSquare } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";
import { Client } from "@/types/client";

const Clients = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const api = ApiService(token!);
      const clientsData = await api.getClient();

      setClients(clientsData);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch clients. Please try again.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchClients();
    }
  }, [token]);

  const handleStatusChange = async (clientId: number, isActive: boolean) => {
    try {
      const api = ApiService(token!);

      await api.setClientStatus(clientId, isActive);
      addToast({
        title: "Success",
        description: `Client ${isActive ? "activated" : "deactivated"} successfully.`,
        color: "success",
      });
      fetchClients();
    } catch (error) {
      console.error("Failed to update client status:", error);
      addToast({
        title: "Error",
        description: "Failed to update client status. Please try again.",
        color: "danger",
      });
    }
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
        <CardHeader className="flex items-center px-4 gap-4 font-roboto text-midnight justify-between">
          <h1 className="text-3xl font-medium">Clients</h1>
          <Button
            className="px-7 py-3 text-sm font-medium font-roboto"
            color="primary"
            radius="full"
            startContent={<Plus />}
            onPress={() => navigate("/clients/add")}
          >
            Add Client
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table
              aria-label="Clients table"
              classNames={classNames}
              rowHeight={50}
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>
                      <Chip
                        color={client.is_active ? "success" : "danger"}
                        variant="flat"
                      >
                        {client.is_active ? "Active" : "Inactive"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Tooltip
                          content={
                            client.is_active
                              ? "Deactivate Client"
                              : "Activate Client"
                          }
                        >
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              handleStatusChange(client.id, !client.is_active)
                            }
                          >
                            {client.is_active ? (
                              <XCircle className="text-dark" />
                            ) : (
                              <CheckCircle2 className="text-dark" />
                            )}
                          </Button>
                        </Tooltip>
                        <Tooltip content="Edit Client">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={() =>
                              navigate(`/clients/edit/${client.id}`)
                            }
                          >
                            <PenSquare className="text-dark" />
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
    </div>
  );
};

export default Clients;
