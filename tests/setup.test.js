import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Test Setup Verification', () => {
  it('should run basic unit tests', () => {
    expect(true).toBe(true);
  });

  it('should run property-based tests with fast-check', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      }),
      { numRuns: 100 }
    );
  });

  it('should have WebGL mocks available', () => {
    expect(global.WebGLRenderingContext).toBeDefined();
    expect(global.WebGL2RenderingContext).toBeDefined();
  });
});
