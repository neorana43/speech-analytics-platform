import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Eye, EyeOff } from "lucide-react";

import styles from "./Login.module.scss";

import { useAuth } from "@/auth/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthRedirect = (event: CustomEvent) => {
      if (event.detail.path === "/login") {
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener(
      "auth:redirect",
      handleAuthRedirect as EventListener,
    );

    return () => {
      window.removeEventListener(
        "auth:redirect",
        handleAuthRedirect as EventListener,
      );
    };
  }, [navigate]);

  const validateForm = () => {
    let isValid = true;

    if (!username.trim()) {
      setUsernameError("Username is required");
      isValid = false;
    } else {
      setUsernameError("");
    }

    if (!password.trim()) {
      setPasswordError("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!validateForm()) {
        throw new Error("Please fill in all required fields");
      }
      await login(username, password);
    },
    onSuccess: () => {
      setUsernameError("");
      setPasswordError("");
      navigate("/client-selection");
    },
    onError: (error: any) => {
      if (error.message === "Please fill in all required fields") {
        return;
      }
      setPasswordError("Invalid password");
      setPassword("");
      setUsernameError("");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginMutation.mutateAsync();
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setUsername(value);
    if (value.trim()) {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setPassword(value);
    if (value.trim()) {
      setPasswordError("");
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginContainer}>
      <div className="flex flex-col items-center justify-center gap-7 max-w-[28.875rem] w-full">
        <img alt="logo" height={56} src="/logo.svg" width={296} />

        <Card className="w-full py-8 px-12 gap-0">
          <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight">
            <h1 className="text-3xl font-medium">Sign in</h1>
            <p className="font-bold text-sm">
              Use your account to log in to NowSpeech
            </p>
          </CardHeader>
          <CardBody className="px-0 py-20">
            <form
              className="gap-8 flex flex-col items-center px-1"
              onSubmit={handleSubmit}
            >
              <Input
                required
                classNames={{
                  inputWrapper: "text-midnight font-roboto bg-light",
                  helperWrapper: "p-1 pl-4",
                }}
                disabled={loginMutation.isPending}
                errorMessage={usernameError}
                isInvalid={!!usernameError}
                label="Username"
                radius="full"
                type="text"
                value={username}
                onChange={handleUsernameChange}
              />
              <div className="w-full relative">
                <Input
                  required
                  classNames={{
                    inputWrapper: "text-midnight font-roboto bg-light",
                    helperWrapper: "p-1 pl-4",
                  }}
                  disabled={loginMutation.isPending}
                  errorMessage={passwordError}
                  isInvalid={!!passwordError}
                  label="Password"
                  radius="full"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                />
                <Button
                  isIconOnly
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 p-1 min-w-0 bg-transparent"
                  disabled={loginMutation.isPending}
                  radius="full"
                  size="sm"
                  onPress={togglePassword}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <Button
                className="mt-4 px-7 py-3 text-sm font-medium font-roboto"
                color="primary"
                isLoading={loginMutation.isPending}
                radius="full"
                type="submit"
              >
                Sign In
              </Button>
              <div className="text-center mt-4">
                <a
                  className="text-primary text-sm font-medium font-roboto hover:underline"
                  href="/forgot-password"
                >
                  Forgot Password?
                </a>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Login;
