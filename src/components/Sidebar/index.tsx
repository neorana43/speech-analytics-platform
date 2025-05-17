import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { Menu } from "lucide-react";
import clsx from "clsx";

const Sidebar = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();
  const isTranscriptionRoute = location.pathname.startsWith("/transcription");

  const [projects] = useState([
    { id: 1, name: "Rubenstein Law" },
    { id: 2, name: "Acme Corp" },
    { id: 3, name: "Call Center Z" },
  ]);

  return (
    <>
      <Button
        isIconOnly
        className="fixed top-28 left-4 z-50 p-0 text-midnight rounded"
        variant="light"
        onPress={onOpen}
      >
        <Menu className="w-12 h-12" />
      </Button>

      <Drawer
        backdrop="transparent"
        classNames={{
          wrapper: "top-40 pt-4",
          base: "shadow-lg rounded-2xl",
        }}
        hideCloseButton={true}
        isOpen={isOpen}
        placement="left"
        size="xs"
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerBody className="px-6 py-4 text-sm font-medium space-y-4">
                {!isTranscriptionRoute ? (
                  <>
                    <div className=" pt-6 pb-4 ">
                      <h3 className="text-2xl font-bold text-midnight ">
                        Main Menu
                      </h3>
                    </div>
                    <NavLink
                      className={({ isActive }) =>
                        clsx("block px-2 text-dark hover:text-primary ", {
                          "text-primary font-semibold": isActive,
                        })
                      }
                      to="/transcription"
                      onClick={onClose}
                    >
                      Transcription Training
                    </NavLink>
                    <NavLink
                      className={({ isActive }) =>
                        clsx("block px-2 text-dark hover:text-primary ", {
                          "text-primary font-semibold": isActive,
                        })
                      }
                      to="/prompt-designer"
                      onClick={onClose}
                    >
                      Prompt Designer
                    </NavLink>
                  </>
                ) : (
                  <>
                    <div className="pt-6 pb-4">
                      <h3 className="text-2xl font-bold text-midnight ">
                        Projects
                      </h3>
                    </div>
                    {projects.map((project) => (
                      <button
                        key={project.id}
                        className="text-left w-full px-2 py-0 text-dark hover:text-primary"
                        onClick={() => {
                          navigate(`/transcription/project/${project.id}`);
                          onClose();
                        }}
                      >
                        {project.name}
                      </button>
                    ))}
                  </>
                )}
              </DrawerBody>

              <DrawerFooter className="px-6 py-4">
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;
