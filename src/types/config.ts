export interface Config {
  config_id: number;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ConfigFormData {
  key: string;
  value: string;
  description: string;
}
