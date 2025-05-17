import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import styles from "./Login.module.scss";

interface LoginResponse {
  token: string;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await axios.post<LoginResponse>("/api/login", data); // Replace with actual backend endpoint
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      navigate("/welcome");
    },
    onError: () => {
      toast.error("Login failed", {
        description: "Invalid email or password. Please try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className={styles.loginContainer}>
      <div className="flex flex-col items-center justify-center gap-7 max-w-[28.875rem] w-full">
        <img src="/logo.svg" alt="logo" height={56} width={296} />

        <Card className="w-full py-8 px-12 gap-0">
          {loginMutation.isPending ? (
            <>
              <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight ">
                <CardTitle className="text-3xl font-medium">
                  Signing In
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 py-20 text-center">
                <img
                  src="loader.gif"
                  height={120}
                  width={120}
                  className="mx-auto"
                />
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight ">
                <CardTitle className="text-3xl font-medium">Sign in</CardTitle>
                <CardDescription className="font-bold text-sm">
                  Use your account to log in to NowSpeech
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 py-20">
                <form
                  onSubmit={handleSubmit}
                  className="gap-14 flex flex-col items-center"
                >
                  <Input
                    type="email"
                    placeholder="Email"
                    className="bg-light rounded-full text-midnight px-3 py-4 font-roboto"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="bg-light rounded-full text-midnight px-3 py-4 font-roboto"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    className="mt-4 rounded-full px-7 py-3 text-sm font-medium font-roboto "
                    type="submit"
                    disabled={loginMutation.isPending}
                  >
                    Sign In
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
