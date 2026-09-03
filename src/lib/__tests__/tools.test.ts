import { describe, expect, it } from 'vitest';
import { getTool } from '@/lib/tools';

describe('getTool', () => {
  it('returns the tool for a valid slug', () => {
    const tool = getTool('json-formatter');
    expect(tool).toBeDefined();
    expect(tool?.slug).toBe('json-formatter');
    expect(tool?.name).toBe('JSON Formatter');
  });

  it('returns undefined for an invalid slug', () => {
    const tool = getTool('invalid-tool-slug-12345');
    expect(tool).toBeUndefined();
  });

  it('returns undefined for an empty string', () => {
    const tool = getTool('');
    expect(tool).toBeUndefined();
  });
});