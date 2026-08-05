import {
  Context,
  ContextBindingData,
  HttpMethod,
  HttpRequest,
} from '@azure/functions';
import { vi } from 'vitest';

type MockContextOverrides = Omit<Partial<Context>, 'bindingData'> & {
  bindingData?: Partial<ContextBindingData>;
};

export function createMockLogger() {
  const logger = vi.fn() as unknown as Context['log'];
  logger.error = vi.fn();
  logger.warn = vi.fn();
  logger.info = vi.fn();
  logger.verbose = vi.fn();
  return logger;
}

export function createMockContext(
  overrides: MockContextOverrides = {},
): Context {
  return {
    invocationId: 'test-invocation-id',
    executionContext: {
      invocationId: 'test-invocation-id',
      functionName: 'test-function',
      functionDirectory: '.',
      retryContext: null,
    },
    bindings: {},
    traceContext: { traceparent: null, tracestate: null, attributes: null },
    bindingDefinitions: [],
    log: createMockLogger(),
    done: vi.fn(),
    ...overrides,
    bindingData: {
      invocationId: 'test-invocation-id',
      ...overrides.bindingData,
    },
  } as Context;
}

export function createMockRequest(
  overrides: Partial<HttpRequest> = {},
): HttpRequest {
  return {
    method: 'GET' as HttpMethod,
    url: 'http://localhost/api/test',
    headers: {},
    query: {},
    params: {},
    user: null,
    get: vi.fn(),
    parseFormBody: vi.fn(),
    ...overrides,
  } as HttpRequest;
}
