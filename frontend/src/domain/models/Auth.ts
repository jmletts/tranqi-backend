export interface User {
  dni: string;
  name: string;
  phone?: string;
  email?: string;
  age?: number;
  address?: string;
  baseFare?: string;
  roles: string[];
}

export interface AuthSession {
  token: string;
  user?: User; // Depending on if login returns user details or just token
}

export interface RegisterData {
  dni: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  address: string;
  baseFare: string;
  passwordPlainText: string;
}
