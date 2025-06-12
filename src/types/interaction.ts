export interface Interaction {
  id: number;
  interaction_id: string;
  status: string;
  [key: string]: any;
}

export interface Tag {
  id: number;
  name: string;
}
