import { Button } from "../ui/button";
import { logout } from "@/lib/auth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const navigate = useNavigate();
  return (
    <header className="flex w-full justify-between items-center">
      <Link to={"/"}>
        <img src="/logo.svg" alt="logo" height={56} width={296} />
      </Link>
      <div>
        <Button
          variant="outline"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
