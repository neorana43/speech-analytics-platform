import { useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
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

import mockData from "@/data/projects.json";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isTranscriptionRoute = location.pathname.startsWith("/transcription");
  const projects = mockData.projects;

  const selectedProjectId = useMemo(() => {
    const match = location.pathname.match(/^\/transcription\/(\d+)/);

    return match ? Number(match[1]) : null;
  }, [location.pathname]);

  const selectedProject = useMemo(() => {
    return projects.find((project) => project.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  return (
    <div className="flex gap-3 items-end relative">
      <Dropdown
        classNames={{
          base: "min-w-[18.75rem] px-6 py-4 h-[calc(100vh-11.25rem)] overflow-y-auto bg-white shadow-lg rounded-xl animate-slide-in-left will-change-transform", // change arrow background
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
                <h3 className="text-2xl font-bold text-midnight ">Main Menu</h3>
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
                <h3 className="text-2xl font-bold text-midnight ">Projects</h3>
              </DropdownItem>

              {projects.map((project) => (
                <DropdownItem
                  key={project.id}
                  className="px-2"
                  onPress={() => navigate(`/transcription/${project.id}`)}
                >
                  {project.name}
                </DropdownItem>
              ))}
            </>
          )}
        </DropdownMenu>
      </Dropdown>

      {location.pathname.match(/^\/transcription\/\d+$/) && selectedProject && (
        <Breadcrumbs
          itemClasses={{
            item: "text-light-gray data-[current=true]:text-light-gray font-bold",
            separator: "text-light-gray px-1 font-bold",
          }}
          separator="/"
        >
          <BreadcrumbItem href="/transcription">Projects</BreadcrumbItem>
          <BreadcrumbItem>{selectedProject.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}
    </div>
  );
};

export default Sidebar;
