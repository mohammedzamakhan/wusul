import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Wusul } from '../../src/client';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('Wusul Client Integration Tests', () => {
  const testAccountId = 'test-account-123';
  const testSharedSecret = 'test-shared-secret-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Client Initialization', () => {
    it('should create client with required credentials', () => {
      mockedAxios.create.mockReturnValue({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      const client = new Wusul(testAccountId, testSharedSecret);

      expect(client).toBeInstanceOf(Wusul);
      expect(client.accessPasses).toBeDefined();
      expect(client.console).toBeDefined();
    });

    it('should create client with custom config', () => {
      mockedAxios.create.mockReturnValue({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      const client = new Wusul(testAccountId, testSharedSecret, {
        baseUrl: 'https://custom-api.wusul.io',
        timeout: 60000,
      });

      expect(client).toBeInstanceOf(Wusul);
    });

    it('should throw error when accountId is missing', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        new Wusul('', testSharedSecret);
      }).toThrow('accountId and sharedSecret are required');
    });

    it('should throw error when sharedSecret is missing', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        new Wusul(testAccountId, '');
      }).toThrow('accountId and sharedSecret are required');
    });

    it('should throw error when both credentials are missing', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        new Wusul('', '');
      }).toThrow('accountId and sharedSecret are required');
    });
  });

  describe('Default Configuration', () => {
    it('should use default baseUrl when not provided', () => {
      mockedAxios.create.mockReturnValue({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      new Wusul(testAccountId, testSharedSecret);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.wusul.io',
        })
      );
    });

    it('should use default timeout when not provided', () => {
      mockedAxios.create.mockReturnValue({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      new Wusul(testAccountId, testSharedSecret);

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 30000,
        })
      );
    });
  });

  describe('Custom Configuration', () => {
    it('should override baseUrl when provided', () => {
      const customBaseUrl = 'https://custom.wusul.io';
      mockedAxios.create.mockReturnValue({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      new Wusul(testAccountId, testSharedSecret, { baseUrl: customBaseUrl });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: customBaseUrl,
        })
      );
    });

    it('should override timeout when provided', () => {
      const customTimeout = 60000;
      mockedAxios.create.mockReturnValue({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      new Wusul(testAccountId, testSharedSecret, { timeout: customTimeout });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: customTimeout,
        })
      );
    });

    it('should handle partial config override', () => {
      mockedAxios.create.mockReturnValue({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      new Wusul(testAccountId, testSharedSecret, {
        timeout: 45000,
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.wusul.io', // default
          timeout: 45000, // custom
        })
      );
    });
  });

  describe('Resource Initialization', () => {
    it('should initialize accessPasses resource', () => {
      const client = new Wusul(testAccountId, testSharedSecret);

      expect(client.accessPasses).toBeDefined();
      expect(typeof client.accessPasses.issue).toBe('function');
      expect(typeof client.accessPasses.list).toBe('function');
      expect(typeof client.accessPasses.update).toBe('function');
      expect(typeof client.accessPasses.suspend).toBe('function');
      expect(typeof client.accessPasses.resume).toBe('function');
      expect(typeof client.accessPasses.unlink).toBe('function');
      expect(typeof client.accessPasses.delete).toBe('function');
    });

    it('should initialize console resource', () => {
      const client = new Wusul(testAccountId, testSharedSecret);

      expect(client.console).toBeDefined();
      expect(typeof client.console.createTemplate).toBe('function');
      expect(typeof client.console.readTemplate).toBe('function');
      expect(typeof client.console.updateTemplate).toBe('function');
      expect(typeof client.console.publishTemplate).toBe('function');
      expect(typeof client.console.eventLog).toBe('function');
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      const mockHealthResponse = {
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'wusul-api',
          version: '1.0.0',
        },
      };

      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: mockHealthResponse }),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

      const client = new Wusul(testAccountId, testSharedSecret);
      const health = await client.health();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/health',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-ACCT-ID': testAccountId,
            'X-PAYLOAD-SIG': expect.any(String),
          }),
        })
      );

      expect(health).toEqual(mockHealthResponse.data);
    });

    it('should include authentication headers in health check', async () => {
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: { data: { status: 'healthy' } } }),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

      const client = new Wusul(testAccountId, testSharedSecret);
      await client.health();

      const callArgs = mockAxiosInstance.get.mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers).toHaveProperty('X-ACCT-ID');
      expect(headers).toHaveProperty('X-PAYLOAD-SIG');
      expect(headers['X-ACCT-ID']).toBe(testAccountId);
      expect(headers['X-PAYLOAD-SIG']).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('Environment Variables Integration', () => {
    it('should work with environment variables pattern', () => {
      // Simulating common pattern from docs
      const accountId = process.env.WUSUL_ACCOUNT_ID || 'test-account';
      const sharedSecret = process.env.WUSUL_SHARED_SECRET || 'test-secret';

      const client = new Wusul(accountId, sharedSecret);

      expect(client).toBeInstanceOf(Wusul);
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should enforce correct types for credentials', () => {
      // These should compile without errors
      const client1 = new Wusul('string-account', 'string-secret');
      const client2 = new Wusul(testAccountId, testSharedSecret, {});
      const client3 = new Wusul(testAccountId, testSharedSecret, {
        baseUrl: 'https://test.com',
      });

      expect(client1).toBeInstanceOf(Wusul);
      expect(client2).toBeInstanceOf(Wusul);
      expect(client3).toBeInstanceOf(Wusul);
    });
  });

  describe('Client Instance Isolation', () => {
    it('should create independent client instances', () => {
      const client1 = new Wusul('account-1', 'secret-1');
      const client2 = new Wusul('account-2', 'secret-2');

      expect(client1).not.toBe(client2);
      expect(client1.accessPasses).not.toBe(client2.accessPasses);
      expect(client1.console).not.toBe(client2.console);
    });

    it('should maintain separate configurations', () => {
      mockedAxios.create.mockReturnValue({
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      } as any);

      const client1 = new Wusul('account-1', 'secret-1', {
        baseUrl: 'https://api1.wusul.io',
        timeout: 10000,
      });

      const client2 = new Wusul('account-2', 'secret-2', {
        baseUrl: 'https://api2.wusul.io',
        timeout: 20000,
      });

      expect(client1).not.toBe(client2);
      expect(mockedAxios.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Cases', () => {
    it('should handle null credentials', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        new Wusul(null, testSharedSecret);
      }).toThrow();

      expect(() => {
        // @ts-expect-error Testing invalid input
        new Wusul(testAccountId, null);
      }).toThrow();
    });

    it('should handle undefined credentials', () => {
      expect(() => {
        // @ts-expect-error Testing invalid input
        new Wusul(undefined, testSharedSecret);
      }).toThrow();

      expect(() => {
        // @ts-expect-error Testing invalid input
        new Wusul(testAccountId, undefined);
      }).toThrow();
    });
  });
});
