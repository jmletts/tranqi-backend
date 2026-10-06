import { AuthRepository } from '../repositories/AuthRepository';
import { RegisterData } from '../models/Auth';

export class AuthUseCases {
  constructor(private authRepository: AuthRepository) {}

  async executeLogin(dni: string, passwordPlainText: string) {
    if (!dni || !passwordPlainText) {
      throw new Error('DNI y contraseña son obligatorios');
    }
    return this.authRepository.login(dni, passwordPlainText);
  }

  async executeRegister(data: RegisterData) {
    if (!data.dni || !data.passwordPlainText || !data.name) {
      throw new Error('Datos obligatorios faltantes');
    }
    return this.authRepository.register(data);
  }
}
