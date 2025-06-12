export interface ApiClientPayload {
  id: number;
  name: string;
  is_active: boolean;
}

export interface ResetPasswordPayload {
  username: string;
  token: string;
  newPassword: string;
}

export interface ForgotPasswordPayload {
  username: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}
