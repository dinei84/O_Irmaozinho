import { describe, it, expect } from 'vitest';
import { hasRole, isAdmin, isUser, getUserRole, canAccessAdmin, ROLES } from '../roles';

describe('Roles', () => {
  describe('hasRole', () => {
    it('deve retornar false se o usuário não existir', () => {
      expect(hasRole(null, ROLES.ADMIN)).toBe(false);
      expect(hasRole(undefined, ROLES.ADMIN)).toBe(false);
    });

    it('deve verificar role através de custom claims', () => {
      const adminUser = {
        customClaims: { role: 'admin' },
      };

      const userUser = {
        customClaims: { role: 'user' },
      };

      expect(hasRole(adminUser, ROLES.ADMIN)).toBe(true);
      expect(hasRole(userUser, ROLES.USER)).toBe(true);
      expect(hasRole(adminUser, ROLES.USER)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('deve retornar true para usuário admin', () => {
      const adminUser = {
        customClaims: { role: 'admin' },
      };

      expect(isAdmin(adminUser)).toBe(true);
    });

    it('deve retornar false para usuário comum', () => {
      const userUser = {
        customClaims: { role: 'user' },
      };

      expect(isAdmin(userUser)).toBe(false);
    });

    it('deve retornar false se o usuário não existir', () => {
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isUser', () => {
    it('deve retornar true para usuário comum', () => {
      const userUser = {
        customClaims: { role: 'user' },
      };

      expect(isUser(userUser)).toBe(true);
    });

    it('deve retornar true para usuário sem role definida (padrão)', () => {
      const userWithoutRole = {
        customClaims: {},
      };

      expect(isUser(userWithoutRole)).toBe(true);
    });

    it('deve retornar false para usuário admin', () => {
      const adminUser = {
        customClaims: { role: 'admin' },
      };

      expect(isUser(adminUser)).toBe(false);
    });
  });

  describe('getUserRole', () => {
    it('deve retornar o role do usuário', () => {
      const adminUser = {
        customClaims: { role: 'admin' },
      };

      const userUser = {
        customClaims: { role: 'user' },
      };

      expect(getUserRole(adminUser)).toBe('admin');
      expect(getUserRole(userUser)).toBe('user');
    });

    it('deve retornar "user" como padrão se não houver role', () => {
      const userWithoutRole = {
        customClaims: {},
      };

      expect(getUserRole(userWithoutRole)).toBe('user');
    });

    it('deve retornar null se o usuário não existir', () => {
      expect(getUserRole(null)).toBe(null);
    });
  });

  describe('canAccessAdmin', () => {
    it('deve permitir acesso para admin', () => {
      const adminUser = {
        customClaims: { role: 'admin' },
      };

      expect(canAccessAdmin(adminUser)).toBe(true);
    });

    it('deve negar acesso para usuário comum', () => {
      const userUser = {
        customClaims: { role: 'user' },
      };

      expect(canAccessAdmin(userUser)).toBe(false);
    });

    it('deve negar acesso se o usuário não existir', () => {
      expect(canAccessAdmin(null)).toBe(false);
    });
  });
});

