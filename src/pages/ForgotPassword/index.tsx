import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";

import styles from "./ForgotPassword.module.scss";

import { ApiService } from "@/lib/api";

const ForgotPassword = () => {
  const [identifier, setIdentifier] = useState("");
  const navigate = useNavigate();

  const forgotPasswordMutation = useMutation({
    mutationFn: async () => {
      const api = ApiService("");

      await api.forgotPassword({ username: identifier });
    },
    onSuccess: () => {
      addToast({
        title: "Success!",
        description:
          "Password reset instructions have been sent to your email.",
        color: "success",
      });
      navigate(`/reset-password?username=${encodeURIComponent(identifier)}`);
    },
    onError: (error: any) => {
      addToast({
        title: "Error!",
        description:
          error.message || "Failed to process request. Please try again.",
        color: "danger",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate();
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className="flex flex-col items-center justify-center gap-7 max-w-[28.875rem] w-full">
        <img alt="logo" height={56} src="/logo.svg" width={296} />

        <Card className="w-full py-8 px-12 gap-0">
          {forgotPasswordMutation.isPending ? (
            <>
              <CardHeader className="text-center flex flex-col items-center gap-4 font-roboto text-midnight">
                <h1 className="text-3xl font-medium">Processing Request</h1>
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
                <h1 className="text-3xl font-medium">Forgot Password</h1>
                <p className="font-bold text-sm">
                  Enter your username or email address to reset your password
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
                      helperWrapper: "p-1 pl-4",
                    }}
                    label="Username or Email"
                    placeholder="Enter your username or email address"
                    radius="full"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  <Button
                    className="mt-4 px-7 py-3 text-sm font-medium font-roboto"
                    color="primary"
                    disabled={forgotPasswordMutation.isPending}
                    radius="full"
                    type="submit"
                  >
                    Reset Password
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

export default ForgotPassword;
