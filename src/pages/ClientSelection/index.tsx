import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@heroui/react";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";

import styles from "./ClientSelection.module.scss";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";

interface Client {
  id: number;
  name: string;
}

const ClientSelection = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const api = ApiService(token!);
        const data = await api.getClients();

        setClients(data);
      } catch (err) {
        console.error("❌ Failed to fetch clients:", err);
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchClients();
    }
  }, [token]);

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id.toString() === clientId);

    setSelectedClient(client || null);
  };

  const handleContinue = () => {
    if (selectedClient) {
      localStorage.setItem("selectedClient", JSON.stringify(selectedClient));
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event("clientUpdated"));
      navigate("/welcome");
    }
  };

  return (
    <div className={styles.clientSelectionContainer}>
      <div className="flex flex-col pb-16  m-auto max-w-[25rem] text-center gap-8">
        <h1 className="font-roboto text-primary text-4xl font-bold">
          Select Client
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Spinner color="primary" size="lg" />
          </div>
        ) : (
          <Card className="p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-midnight">
                  Choose a client to continue
                </h3>
                <p className="text-sm text-gray-500">
                  Select a client from the list below to access their specific
                  features and settings.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Select
                  className="w-full"
                  label="Select a client"
                  placeholder="Choose a client"
                  radius="full"
                  selectedKeys={
                    selectedClient ? [selectedClient.id.toString()] : []
                  }
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0] as string;

                    handleClientSelect(selectedKey);
                  }}
                >
                  {clients.map((client) => (
                    <SelectItem key={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </Select>

                <Button
                  className="px-7 py-3 text-sm font-medium font-roboto w-full"
                  color="primary"
                  isDisabled={!selectedClient}
                  radius="full"
                  onPress={handleContinue}
                >
                  Continue
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientSelection;
