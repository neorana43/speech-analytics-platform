import { addToast } from "@heroui/toast";

interface ErrorResponse {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

export const handleApiError = (
  error: ErrorResponse,
  defaultMessage: string,
) => {
  console.error("API Error:", error);

  // Get error message from response or use default
  const errorMessage =
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    defaultMessage;

  // Handle specific error cases
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    // These are handled by the API interceptor
    return;
  }

  // Show error toast
  addToast({
    title: "Error",
    description: errorMessage,
    color: "danger",
  });
};
