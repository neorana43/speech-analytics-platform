import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

import styles from "./Login.module.scss";

import { useAuth } from "@/auth/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async () => {
      await login(username, password); // ✅ pass username
    },
    onSuccess: () => {
      navigate("/welcome");
    },
    onError: () => {
      addToast({
        title: "Login failed!",
        description: "Invalid username or password. Please try again.",
        color: "danger",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className={styles.loginContainer}>
      <div className="flex flex-col items-center justify-center gap-7 max-w-[28.875rem] w-full">
        <img alt="logo" height={56} src="/logo.svg" width={296} />

        <Card className="w-full py-8 px-12 gap-0">
          {loginMutation.isPending ? (
            <>
              <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight">
                <h1 className="text-3xl font-medium">Signing In</h1>
              </CardHeader>
              <CardBody className="px-0 py-20 text-center">
                <img
                  alt="Loading"
                  className="mx-auto"
                  height={120}
                  src="/loader.gif"
                  width={120}
                />
              </CardBody>
            </>
          ) : (
            <>
              <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight">
                <h1 className="text-3xl font-medium">Sign in</h1>
                <p className="font-bold text-sm">
                  Use your account to log in to NowSpeech
                </p>
              </CardHeader>
              <CardBody className="px-0 py-20">
                <form
                  className="gap-14 flex flex-col items-center px-1"
                  onSubmit={handleSubmit}
                >
                  <Input
                    required
                    classNames={{
                      inputWrapper: "text-midnight font-roboto bg-light",
                    }}
                    label="Username"
                    radius="full"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    required
                    classNames={{
                      inputWrapper: "text-midnight font-roboto bg-light",
                    }}
                    label="Password"
                    radius="full"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    className="mt-4 px-7 py-3 text-sm font-medium font-roboto"
                    color="primary"
                    disabled={loginMutation.isPending}
                    radius="full"
                    type="submit"
                  >
                    Sign In
                  </Button>
                </form>
              </CardBody>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
