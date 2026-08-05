import { describe, expect, it } from 'vitest';
import { createErrorResult, createSuccessResult } from './core';
import { createMockContext } from './test-utils/mockContext';

describe('createSuccessResult', () => {
  it('returns the given status code, data as body, and JSON content-type header', () => {
    const context = createMockContext({ invocationId: 'abc-123' });

    const result = createSuccessResult(200, { foo: 'bar' }, context);

    expect(result.status).toBe(200);
    expect(result.body).toEqual({ foo: 'bar' });
    expect(result.headers).toEqual({
      'Content-Type': 'application/json',
      'X-Invocation-ID': 'abc-123',
    });
  });

  it('passes through null data unchanged', () => {
    const context = createMockContext();

    const result = createSuccessResult(202, null, context);

    expect(result.status).toBe(202);
    expect(result.body).toBeNull();
  });
});

describe('createErrorResult', () => {
  it('wraps the message and status code in an error envelope with the request id', () => {
    const context = createMockContext({ invocationId: 'req-456' });

    const result = createErrorResult(404, 'Not found', context);

    expect(result.status).toBe(404);
    expect(result.body).toEqual({
      error: {
        code: 404,
        message: 'Not found',
        requestId: 'req-456',
      },
    });
  });

  it('allows a null message', () => {
    const context = createMockContext();

    const result = createErrorResult(500, null, context);

    expect(result.body.error.message).toBeNull();
  });
});
