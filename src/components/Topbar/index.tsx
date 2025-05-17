import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/react";

import { logout } from "@/lib/auth";

const Topbar = () => {
  const navigate = useNavigate();

  return (
    <Navbar
      className="fixed bg-transparent py-8"
      isBlurred={false}
      maxWidth="full"
    >
      <NavbarContent justify="start">
        <NavbarBrand className="mr-4">
          <Link to={"/"}>
            <img alt="logo" height={56} src="/logo.svg" width={296} />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        as="div"
        className="items-center bg-white py-2 px-3 rounded-full shadow-lg max-w-80 gap-3"
        justify="end"
      >
        <Input
          classNames={{
            base: "max-w-full  h-10",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper:
              "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
          }}
          placeholder="Search"
          radius="full"
          size="md"
          startContent={<Search size={18} />}
          type="search"
        />
        <Dropdown placement="bottom-end">
          <DropdownTrigger className="flex-none w-10">
            <Avatar
              as="button"
              className="transition-transform"
              name="Jason Hughes"
              size="md"
              src="/avtar.jpg"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">admin@example.com</p>
            </DropdownItem>
            <DropdownItem
              key="settings"
              onPress={() => {
                navigate("/settings");
              }}
            >
              My Settings
            </DropdownItem>

            <DropdownItem
              key="logout"
              color="danger"
              onPress={() => {
                logout();
                navigate("/login");
              }}
            >
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};

export default Topbar;
