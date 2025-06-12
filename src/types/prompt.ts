export interface PromptDetail {
  prompt_id: number;
  client_id: number;
  prompt_title: string;
  prompt: string;
  is_active: boolean;
  questions: Question[];
}

export interface Question {
  question_id: number;
  client_id?: number;
  question: string;
  is_active: boolean;
  prompt_id?: number;
  question_key: string;
  to_delete: number;
  error?: string;
  isKeyError?: boolean;
  isDisabled?: boolean;
}

export interface PreviewResponse {
  id: number;
  interaction_id: string;
  json_result?: Array<{
    question_id: number;
    answer: string;
    question_key?: string;
  }>;
  result?: string;
  transcript: string;
}
