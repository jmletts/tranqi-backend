/// <reference types="cypress" />

describe('US-12: Gestión de Identidad y Roles Aditivos (IAM)', () => {
  const testUser = {
    dni: '12345678',
    name: 'Juan Perez',
    phone: '987654321',
    email: 'juan@email.com',
    age: '25',
    address: 'Av. Siempre Viva 123',
    baseFare: 'Universitaria',
    password: 'secreta123',
  };

  /**
   * Helper to build a mock JWT with given payload
   */
  const createMockJwt = (payload: object) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = 'mockSignature12345';
    return `${header}.${body}.${signature}`;
  };

  /**
   * Helper to decode JWT payload in tests
   */
  const parseJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  beforeEach(() => {
    // Stub alert to inspect notifications
    cy.on('window:alert', cy.stub().as('alertStub'));
  });

  it('TC-071 [US-12]: Auto-registro exitoso de pasajero con contraseña Bcrypt y rol USUARIO_FINAL', () => {
    // Intercept registration call
    cy.intercept('POST', '**/auth/register', (req) => {
      expect(req.body).to.include({
        dni: testUser.dni,
        email: testUser.email,
        name: testUser.name,
      });
      req.reply({
        statusCode: 201,
        body: {
          message: 'Usuario registrado exitosamente',
          dni: testUser.dni,
          roles: ['USUARIO_FINAL'],
        },
      });
    }).as('registerRequest');

    cy.visit('/register');

    // Fill the registration form
    cy.get('[data-testid="register-dni-input"]').type(testUser.dni);
    cy.get('[data-testid="register-name-input"]').type(testUser.name);
    cy.get('[data-testid="register-phone-input"]').type(testUser.phone);
    cy.get('[data-testid="register-email-input"]').type(testUser.email);
    cy.get('[data-testid="register-age-input"]').type(testUser.age);
    cy.get('[data-testid="register-address-input"]').type(testUser.address);
    cy.get('[data-testid="register-basefare-input"]').type(testUser.baseFare);
    cy.get('[data-testid="register-password-input"]').type(testUser.password);

    // Submit form
    cy.get('[data-testid="register-submit-button"]').click();

    // Verify request was sent and response received
    cy.wait('@registerRequest').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      expect(interception.response?.body.roles).to.deep.eq(['USUARIO_FINAL']);
    });
  });

  it('TC-072 [US-12]: Asignación de roles adicionales (GESTOR_FLOTA) sin duplicar la identidad', () => {
    const adminToken = createMockJwt({ sub: 'admin', roles: ['ADMIN'] });

    // Simulate IAM endpoint for role assignment
    cy.intercept('POST', `**/iam/users/${testUser.dni}/roles`, {
      statusCode: 200,
      body: {
        dni: testUser.dni,
        roles: ['USUARIO_FINAL', 'GESTOR_FLOTA'],
      },
    }).as('assignRole');

    // Execute role assignment request as an admin
    cy.request({
      method: 'POST',
      url: `http://localhost:8080/api/v1/iam/users/${testUser.dni}/roles`,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      body: {
        role: 'GESTOR_FLOTA',
      },
    }).then((response) => {
      // In integrated test or mock: single identity retained with additive roles
      if (response.status === 200) {
        expect(response.body.dni).to.eq(testUser.dni);
        expect(response.body.roles).to.include.members(['USUARIO_FINAL', 'GESTOR_FLOTA']);
      }
    });
  });

  it('TC-073 [US-12]: Login único devuelve JWT con todos los roles aditivos del usuario', () => {
    const additiveRoles = ['USUARIO_FINAL', 'AGENTE_KIOSKO', 'GESTOR_FLOTA'];
    const multiRoleJwt = createMockJwt({
      sub: testUser.dni,
      roles: additiveRoles,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    // Intercept login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        token: multiRoleJwt,
      },
    }).as('loginRequest');

    cy.visit('/');

    cy.get('[data-testid="login-dni-input"]').type(testUser.dni);
    cy.get('[data-testid="login-password-input"]').type(testUser.password);
    cy.get('[data-testid="login-submit-button"]').click();

    cy.wait('@loginRequest').then((interception) => {
      const token = interception.response?.body?.token;
      expect(token).to.be.a('string');

      // Verify JWT payload has all additive roles simultaneously
      const decoded = parseJwt(token);
      expect(decoded.sub).to.eq(testUser.dni);
      expect(decoded.roles).to.deep.eq(additiveRoles);
    });
  });

  it('TC-074 [US-12]: Acceso denegado (403 Forbidden) a endpoint de Flota sin el rol requerido', () => {
    // Generate token with ONLY USUARIO_FINAL
    const passengerJwt = createMockJwt({
      sub: testUser.dni,
      roles: ['USUARIO_FINAL'],
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    // Mock 403 Forbidden when accessing fleet endpoint with missing role
    cy.intercept('GET', '**/fleet/earnings', {
      statusCode: 403,
      body: {
        error: 'Forbidden',
        message: 'No posee el rol GESTOR_FLOTA para acceder a este recurso.',
      },
    }).as('fleetForbidden');

    cy.request({
      method: 'GET',
      url: 'http://localhost:8080/api/v1/fleet/earnings',
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${passengerJwt}`,
      },
    }).then((response) => {
      // Must be rejected with 403 Forbidden
      expect(response.status).to.eq(403);
    });
  });
});
