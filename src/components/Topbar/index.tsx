import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Avatar, Button } from "@heroui/react";
import { useEffect, useState } from "react";

import { useAuth } from "@/auth/AuthContext";

interface Client {
  id: number;
  name: string;
}

const Topbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const updateSelectedClient = () => {
    const storedClient = localStorage.getItem("selectedClient");

    if (storedClient) {
      setSelectedClient(JSON.parse(storedClient));
    } else {
      setSelectedClient(null);
    }
  };

  useEffect(() => {
    updateSelectedClient();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "selectedClient") {
        updateSelectedClient();
      }
    };

    // Listen for custom event for same-window updates
    const handleClientUpdate = () => {
      updateSelectedClient();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("clientUpdated", handleClientUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("clientUpdated", handleClientUpdate);
    };
  }, []);

  const userName = user ? `${user.first_name} ${user.last_name}` : "";
  const userEmail = user?.email || "";

  return (
    <Navbar
      className="bg-transparent pt-6 pb-4"
      isBlurred={false}
      maxWidth="full"
      position="static"
    >
      <NavbarContent justify="start">
        <NavbarBrand className="mr-8">
          <Link to={"/"}>
            <img alt="logo" height={48} src="/logo.svg" width={260} />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        as="div"
        className="items-center bg-white py-2.5 px-4 rounded-full shadow-sm border border-gray-100 max-w-fit gap-4 "
        justify="end"
      >
        {location.pathname !== "/client-selection" && (
          <>
            {selectedClient && (
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Current Client</span>
                  <span className="font-medium text-sm">
                    {selectedClient.name}
                  </span>
                </div>
                <Button
                  color="secondary"
                  radius="full"
                  size="sm"
                  onPress={() => navigate("/client-selection")}
                >
                  Change
                </Button>
              </div>
            )}
            {!selectedClient && (
              <Button
                color="secondary"
                radius="full"
                size="sm"
                onPress={() => navigate("/client-selection")}
              >
                Select Client
              </Button>
            )}
            <div className="h-6 w-px bg-gray-200" />
          </>
        )}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Welcome,</span>
          <span className="font-medium text-sm">{userName}</span>
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <Dropdown placement="bottom-end">
          <DropdownTrigger className="flex-none">
            <Avatar
              as="button"
              className="transition-transform hover:scale-105"
              name={userName}
              size="sm"
              src="/avtar.jpg"
            />
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profile Actions"
            className="p-2"
            variant="flat"
          >
            <DropdownItem key="profile" className="h-14 gap-2">
              <div className="flex flex-col">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="font-medium text-sm truncate">{userEmail}</p>
              </div>
            </DropdownItem>
            <DropdownItem
              key="settings"
              className="gap-2"
              onPress={() => navigate("/settings")}
            >
              <span className="text-sm">My Settings</span>
            </DropdownItem>
            <DropdownItem
              key="logout"
              className="gap-2"
              color="danger"
              onPress={logout}
            >
              <span className="text-sm">Log Out</span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};

export default Topbar;
