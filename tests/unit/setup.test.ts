/**
 * Test to verify Vitest setup is working correctly.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';

describe('Vitest Setup', () => {
  it('should run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should have @testing-library/react available', () => {
    expect(render).toBeDefined();
    expect(screen).toBeDefined();
  });

  it('should have fast-check available', () => {
    expect(fc).toBeDefined();
    expect(fc.property).toBeDefined();
  });

  it('should support property-based testing', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        return n + 0 === n;
      })
    );
  });
});
