import { AuthSession, RegisterData } from '../models/Auth';

export interface AuthRepository {
  login(dni: string, passwordPlainText: string): Promise<AuthSession>;
  register(data: RegisterData): Promise<void>;
}
