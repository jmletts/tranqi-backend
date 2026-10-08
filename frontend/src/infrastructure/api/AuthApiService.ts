import { AuthRepository } from '@domain/repositories/AuthRepository';
import { AuthSession, RegisterData } from '@domain/models/Auth';
import { HttpClient } from '../http/HttpClient';
import { TokenStorage } from '../storage/TokenStorage';

export class AuthApiService implements AuthRepository {
  async login(dni: string, passwordPlainText: string): Promise<AuthSession> {
    const response = await HttpClient.post('/auth/login', { dni, password: passwordPlainText });
    const { token } = response.data;
    
    // Save token immediately upon successful login
    if (token) {
      await TokenStorage.saveToken(token);
    }

    return { token };
  }

  async register(data: RegisterData): Promise<void> {
    await HttpClient.post('/auth/register', {
      dni: data.dni,
      name: data.name,
      phone: data.phone,
      email: data.email,
      age: data.age ? parseInt(data.age.toString(), 10) : 0,
      address: data.address,
      baseFare: data.baseFare.toUpperCase().includes('UNIVERS') ? 'UNIVERSITY' : 
                data.baseFare.toUpperCase().includes('ESCOLAR') ? 'SCHOOL' : 'GENERAL',
      password: data.passwordPlainText
    });
  }
}
