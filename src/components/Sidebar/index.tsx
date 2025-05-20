import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Breadcrumbs,
  BreadcrumbItem,
} from "@heroui/react";
import { Menu } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";

interface Client {
  id: number;
  name: string;
}

interface Interaction {
  id: number;
  interaction_id: string;
  status: string;
}

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchParams] = useSearchParams();

  const isTranscriptionRoute = location.pathname.startsWith("/transcription");

  const [clients, setClients] = useState<Client[]>([]);
  const [interactionStatus, setInteractionStatus] = useState<string | null>(
    null,
  );
  const [interactionLabel, setInteractionLabel] = useState<string | null>(null);

  const selectedProjectId = useMemo(() => {
    const match = location.pathname.match(/^\/transcription\/(\d+)/);

    return match ? Number(match[1]) : null;
  }, [location.pathname]);

  const selectedProject = useMemo(() => {
    return clients.find((client) => client.id === selectedProjectId);
  }, [clients, selectedProjectId]);

  const isTrainingPage = location.pathname.includes("/training");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const api = ApiService(token!);
        const data = await api.getClients();

        setClients(data);
      } catch (err) {
        console.error("❌ Failed to fetch clients:", err);
      }
    };

    if (token && isTranscriptionRoute) {
      fetchClients();
    }
  }, [token, isTranscriptionRoute]);

  useEffect(() => {
    const fetchInteractionDetails = async () => {
      if (!token || !isTrainingPage) {
        setInteractionStatus(null);
        setInteractionLabel(null);

        return;
      }

      const idFromQuery = searchParams.get("interaction_id");
      const interactionId = idFromQuery ? parseInt(idFromQuery, 10) : null;

      if (!interactionId || !selectedProjectId) return;

      try {
        const api = ApiService(token);
        const interactions = await api.filterInteractions({
          client_id: selectedProjectId,
        });

        const match = interactions.find(
          (item: Interaction) => item.id === interactionId,
        );

        if (match) {
          setInteractionStatus(match.status);
          setInteractionLabel(`${match.id}`);
        }
      } catch (err) {
        console.error("❌ Failed to fetch interaction status:", err);
      }
    };

    fetchInteractionDetails();
  }, [token, isTrainingPage, searchParams, selectedProjectId]);

  return (
    <div className="flex gap-3 items-end relative">
      <Dropdown
        classNames={{
          base: "min-w-[18.75rem] px-6 py-4 h-[calc(100vh-11.25rem)] overflow-y-auto bg-white shadow-lg rounded-xl animate-slide-in-left will-change-transform",
          content: "bg-transparent shadow-none scale-100",
        }}
        placement="bottom-start"
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            className="p-0 text-midnight rounded"
            variant="light"
          >
            <Menu className="w-12 h-12" />
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Sidebar Menu"
          itemClasses={{
            base: "text-dark data-[hover=true]:text-primary text-sm font-medium data-[hover=true]:bg-transparent",
          }}
        >
          {!isTranscriptionRoute ? (
            <>
              <DropdownItem
                key="heading"
                isReadOnly
                className="cursor-default px-0"
              >
                <h3 className="text-2xl font-bold text-midnight">Main Menu</h3>
              </DropdownItem>
              <DropdownItem
                key="transcription"
                className="px-2"
                onPress={() => navigate("/transcription")}
              >
                Transcription Training
              </DropdownItem>
              <DropdownItem
                key="prompt"
                className="px-2"
                onPress={() => navigate("/prompt-designer")}
              >
                Prompt Designer
              </DropdownItem>
            </>
          ) : (
            <>
              <DropdownItem
                key="heading"
                isReadOnly
                className="cursor-default px-0"
              >
                <h3 className="text-2xl font-bold text-midnight">Projects</h3>
              </DropdownItem>
              {clients.map((client) => (
                <DropdownItem
                  key={client.id}
                  className="px-2"
                  onPress={() => navigate(`/transcription/${client.id}`)}
                >
                  {client.name}
                </DropdownItem>
              ))}
            </>
          )}
        </DropdownMenu>
      </Dropdown>

      {selectedProject && (
        <Breadcrumbs
          itemClasses={{
            item: "text-light-gray data-[current=true]:text-light-gray font-bold",
            separator: "text-light-gray px-1 font-bold",
          }}
          separator="/"
        >
          <BreadcrumbItem href="/transcription">Projects</BreadcrumbItem>
          <BreadcrumbItem href={`/transcription/${selectedProjectId}`}>
            {selectedProject.name}
          </BreadcrumbItem>
          {interactionStatus && (
            <BreadcrumbItem>{interactionStatus}</BreadcrumbItem>
          )}
          {interactionLabel && (
            <BreadcrumbItem>{interactionLabel}</BreadcrumbItem>
          )}
        </Breadcrumbs>
      )}
    </div>
  );
};

export default Sidebar;
