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

  it('marks newly added tools with isNew flag', () => {
    const curlTool = getTool('curl-converter');
    expect(curlTool).toBeDefined();
    expect(curlTool?.isNew).toBe(true);

    const yamlToJsonTool = getTool('yaml-to-json');
    expect(yamlToJsonTool).toBeDefined();
    expect(yamlToJsonTool?.isNew).toBe(true);

    const loremTool = getTool('lorem-ipsum');
    expect(loremTool).toBeDefined();
    expect(loremTool?.isNew).toBe(true);

    const chmodTool = getTool('chmod-calculator');
    expect(chmodTool).toBeDefined();
    expect(chmodTool?.isNew).toBe(true);

    const htmlTool = getTool('html-formatter');
    expect(htmlTool).toBeDefined();
    expect(htmlTool?.isNew).toBe(true);

    const jsonTool = getTool('json-formatter');
    expect(jsonTool).toBeDefined();
    expect(jsonTool?.isNew).toBeFalsy();
  });
});