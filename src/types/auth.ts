export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LogoutResponse {
  status: boolean;
  message: string;
}

export interface User {
  username: string;
  token: string;
}
