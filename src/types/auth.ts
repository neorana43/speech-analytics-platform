export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  firstTimeLogin: boolean;
  userId: number;
}

export interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  global_role_ids: number[];
  client_roles: {
    client_id: number;
    role_ids: number[];
  }[];
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordRequest {
  userId: number;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}
