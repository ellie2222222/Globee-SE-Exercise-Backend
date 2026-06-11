import { LoginDTO } from '../../dtos/login.dto.js';

describe('LoginDTO', () => {
  it('should map email and password from input data', () => {
    const dto = new LoginDTO({ email: 'user@example.com', password: 'secret' });

    expect(dto.email).toBe('user@example.com');
    expect(dto.password).toBe('secret');
  });

  it('should throw when email is missing', () => {
    expect(() => new LoginDTO({ password: 'secret' })).toThrow('Email and password are required');
  });

  it('should throw when password is missing', () => {
    expect(() => new LoginDTO({ email: 'user@example.com' })).toThrow('Email and password are required');
  });

  it('should throw on invalid email format', () => {
    expect(() => new LoginDTO({ email: 'not-an-email', password: 'secret' })).toThrow('Invalid email format');
  });

  it('should ignore extra fields from input data', () => {
    const dto = new LoginDTO({
      email: 'user@example.com',
      password: 'secret',
      role: 'admin',
      extraField: 'value',
    });

    expect(dto.email).toBe('user@example.com');
    expect(dto.password).toBe('secret');
    expect(dto.role).toBeUndefined();
    expect(dto.extraField).toBeUndefined();
  });
});
