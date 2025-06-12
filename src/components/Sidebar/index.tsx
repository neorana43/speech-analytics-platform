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

import { Interaction } from "../../types/interaction";
import { MenuResponse } from "../../types/menu";

import { useAuth } from "@/auth/AuthContext";
import { ApiService } from "@/lib/api";

interface Client {
  id: number;
  name: string;
}

const menuPathMap: Record<string, string> = {
  Users: "/users",
  Clients: "/clients",
  Prompt: "/prompt-designer",
  Transcript: "/transcription",
};

const menuDisplayNames: Record<string, string> = {
  Users: "Users",
  Clients: "Clients",
  Prompt: "Prompt Designer",
  Transcript: "Transcription Training",
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [searchParams] = useSearchParams();

  const isTranscriptionDetailsPage =
    location.pathname.match(/^\/transcription\/\d+$/) !== null;
  const isTrainingPage = location.pathname.includes("/training");

  const [clients, setClients] = useState<Client[]>([]);
  const [menuItems, setMenuItems] = useState<MenuResponse[]>([]);
  const [interactionStatus, setInteractionStatus] = useState<string | null>(
    null,
  );
  const [interactionLabel, setInteractionLabel] = useState<string | null>(null);

  const selectedProjectId = useMemo(() => {
    // First try to get from URL
    const match = location.pathname.match(/^\/transcription\/(\d+)/);

    if (match) return Number(match[1]);

    // If not in URL, try to get from localStorage
    const selectedClientStr = localStorage.getItem("selectedClient");

    if (selectedClientStr) {
      const selectedClient: Client = JSON.parse(selectedClientStr);

      return selectedClient.id;
    }

    return 0; // Default to 0 for no client selected
  }, [location.pathname]);

  const selectedProject = useMemo(() => {
    return clients.find((client) => client.id === selectedProjectId);
  }, [clients, selectedProjectId]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const api = ApiService(token!);
        const data = await api.getMenu(selectedProjectId);

        setMenuItems(data);
      } catch (err) {
        console.error("❌ Failed to fetch menu items:", err);
        setMenuItems([]);
      }
    };

    if (token) {
      fetchMenu();
    }
  }, [token, selectedProjectId]);

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

    if (token) {
      fetchClients();
    }
  }, [token]);

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

  const handleMenuClick = (menuName: string) => {
    const path = menuPathMap[menuName];

    if (path) {
      if (path === "/transcription" && selectedProjectId) {
        navigate(`/transcription/${selectedProjectId}`);
      } else {
        navigate(path);
      }
    }
  };

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
          <DropdownItem
            key="heading-main"
            isReadOnly
            className="cursor-default px-0"
          >
            <h3 className="text-2xl font-bold text-midnight">Main Menu</h3>
          </DropdownItem>

          <>
            {menuItems.map((item) => (
              <DropdownItem
                key={item.menu}
                className="px-2"
                onPress={() => handleMenuClick(item.menu)}
              >
                {menuDisplayNames[item.menu] || item.menu}
              </DropdownItem>
            ))}
          </>
        </DropdownMenu>
      </Dropdown>

      {selectedProject && (isTranscriptionDetailsPage || isTrainingPage) && (
        <Breadcrumbs
          itemClasses={{
            item: "text-light-gray data-[current=true]:text-light-gray font-bold",
            separator: "text-light-gray px-1 font-bold",
          }}
          separator="/"
        >
          <BreadcrumbItem>Projects</BreadcrumbItem>
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
