import { AuthRepository } from '@domain/repositories/AuthRepository';
import { AuthSession, RegisterData } from '@domain/models/Auth';
import { HttpClient, extractApiErrorMessage } from '../http/HttpClient';
import { TokenStorage } from '../storage/TokenStorage';

export class AuthApiService implements AuthRepository {
  async login(dni: string, passwordPlainText: string): Promise<AuthSession> {
    try {
      const response = await HttpClient.post('/auth/login', { dni, password: passwordPlainText });
      const { token } = response.data;

      if (token) {
        await TokenStorage.saveToken(token);
      }

      return { token };
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'DNI o contraseña incorrectos'));
    }
  }

  async register(data: RegisterData): Promise<void> {
    try {
      await HttpClient.post('/auth/register', {
        dni: data.dni,
        name: data.name,
        phone: data.phone,
        email: data.email,
        age: data.age ? parseInt(data.age.toString(), 10) : 0,
        address: data.address,
        baseFare: data.baseFare.toUpperCase().includes('UNIVERS')
          ? 'UNIVERSITY'
          : data.baseFare.toUpperCase().includes('ESCOLAR')
          ? 'SCHOOL'
          : 'GENERAL',
        password: data.passwordPlainText,
      });
    } catch (error) {
      throw new Error(extractApiErrorMessage(error, 'No se pudo completar el registro'));
    }
  }
}
