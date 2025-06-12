export interface Client {
  id: number;
  name: string;
  is_active: boolean;
  insert_date_time: string;
  update_date_time: string;
  audio_files: any[];
  interactions: any[];
  user_client_roles: any[];
  user: any[];
}

export interface ClientFormData {
  name: string;
}

export interface ApiClientPayload {
  id: number;
  name: string;
  is_active: boolean;
}
