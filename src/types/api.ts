export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: string;
  data_extra?: any;
}

export interface User {
  id: number;
  email: string;
  role: string;
  fullName: string;
  theme: string;
  language: string;
  rank?: string;
  totalSpending?: number;
}

export interface Movie {
  id: number;
  title: string;
  description?: string;
  duration_minutes: number;
  release_date: string;
  poster_url: string;
  trailer_url?: string;
  genres?: { id: number; name: string }[];
  rating?: number;
}

export interface ChatMessageResponse {
  id?: string;
  role: string;
  content: string;
  created_at?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
