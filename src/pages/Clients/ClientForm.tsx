import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Button, Spinner } from "@heroui/react";
import { addToast } from "@heroui/toast";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";
import { ClientFormData, ApiClientPayload, Client } from "@/types/client";

interface ClientFormProps {
  clientId?: number;
  mode: "add" | "edit";
}

const ClientForm = ({ clientId, mode }: ClientFormProps) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const api = ApiService(token!);

        if (mode === "edit" && clientId) {
          const clientsData = await api.getClient();
          const clientData = clientsData.find((c: Client) => c.id === clientId);

          if (clientData) {
            setFormData({
              name: clientData.name,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch required data. Please try again.",
          color: "danger",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, clientId, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const api = ApiService(token!);

      const payload: ApiClientPayload = {
        id: clientId || 0,
        name: formData.name,
        is_active: true,
      };

      await api.saveClient(payload);

      addToast({
        title: "Success",
        description: `Client ${mode === "add" ? "created" : "updated"} successfully.`,
        color: "success",
      });
      navigate("/clients");
    } catch (error) {
      console.error("Failed to save client:", error);
      addToast({
        title: "Error",
        description: `Failed to ${mode} client. Please try again.`,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 flex-1 lg:px-6 px-5 lg:pb-6 pb-5 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <h2 className="page-title text-primary">
          {mode === "add" ? "Add New Client" : "Edit Client"}
        </h2>
      </div>

      <Card className="lg:col-span-2 p-6 gap-6 flex flex-col">
        <h2 className="text-xl font-semibold text-midnight">
          Client Information
        </h2>
        <div className="flex gap-4 text-sm text-gray-600 border-b border-gray-200">
          <div className="pb-2 border-b-2 border-primary text-primary font-semibold">
            Basic Info
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                isRequired
                classNames={{
                  inputWrapper: "text-midnight font-roboto bg-light",
                }}
                label="Client Name"
                radius="full"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex gap-4 justify-between">
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="primary"
              isLoading={isSubmitting}
              radius="full"
              type="submit"
            >
              {mode === "add" ? "Create Client" : "Update Client"}
            </Button>
            <Button
              className="px-7 py-3 text-sm font-medium font-roboto"
              color="default"
              radius="full"
              onPress={() => navigate("/clients")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ClientForm;
