export interface Role {
  role_id: number;
  role_name: string;
  is_global: boolean;
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  admin_roles: number[];
  clients_roles: {
    client_id: number;
    role_ids: number[];
  }[];
}

export interface Client {
  id: number;
  name: string;
  is_active: boolean;
}

export interface UserFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  adminRoles: number[];
  clientRoles: {
    [clientId: number]: number[];
  };
}

export interface ApiUserPayload {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  admin_roles: number[];
  clients_roles: {
    client_id: number;
    role_ids: number[];
  }[];
}
