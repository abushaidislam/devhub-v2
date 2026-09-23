import { describe, it, expect } from 'vitest';
import { formatJson, jsonToCsv, csvToJson, jsonToYaml, jsonToTypescript } from '../json';

describe('json engines', () => {
  describe('jsonToCsv', () => {
    it('should convert a flat array of objects to CSV', () => {
      const input = '[{"name":"Alice","age":30},{"name":"Bob","age":25}]';
      const result = jsonToCsv(input);
      expect(result.output).toBe('name,age\nAlice,30\nBob,25');
      expect(result.meta).toBe('2 rows — 2 columns');
    });

    it('should handle nested objects and arrays by stringifying them', () => {
      const input = '[{"id":1,"details":{"foo":"bar"}},{"id":2,"details":[1,2,3]}]';
      const result = jsonToCsv(input);
      expect(result.output).toBe('id,details\n1,"{""foo"":""bar""}"\n2,"[1,2,3]"');
      expect(result.meta).toBe('2 rows — 2 columns');
    });

    it('should handle values with quotes and commas', () => {
      const input = '[{"name":"Alice, Smith","role":"\\"Manager\\""}]';
      const result = jsonToCsv(input);
      expect(result.output).toBe('name,role\n"Alice, Smith","""Manager"""');
      expect(result.meta).toBe('1 row — 2 columns');
    });

    it('should throw an error for invalid JSON string', () => {
      const input = '{a:1}';
      expect(() => jsonToCsv(input)).toThrow('Enter a valid JSON array of objects.');
    });

    it('should throw an error if the parsed JSON is not an array', () => {
      const input = '{"name":"Alice"}';
      expect(() => jsonToCsv(input)).toThrow('Enter a non-empty JSON array of objects.');
    });

    it('should throw an error for an empty array', () => {
      const input = '[]';
      expect(() => jsonToCsv(input)).toThrow('Enter a non-empty JSON array of objects.');
    });

    it('should throw an error if an array item is not an object', () => {
      const input = '[1, 2, 3]';
      expect(() => jsonToCsv(input)).toThrow('Every array item must be a JSON object.');
    });
  });

  describe('csvToJson', () => {
    it('should convert valid CSV with multiple rows and columns to JSON', () => {
      const input = 'name,age\nAlice,30\nBob,25';
      const result = csvToJson(input);
      expect(JSON.parse(result.output)).toEqual([
        { name: 'Alice', age: '30' },
        { name: 'Bob', age: '25' }
      ]);
      expect(result.meta).toBe('2 records');
    });

    it('should handle values with quotes and commas', () => {
      const input = 'name,role\n"Alice, Smith","Manager"';
      const result = csvToJson(input);
      expect(JSON.parse(result.output)).toEqual([
        { name: 'Alice, Smith', role: 'Manager' }
      ]);
      expect(result.meta).toBe('1 record');
    });

    it('should throw an error for empty input', () => {
      const input = '   ';
      expect(() => csvToJson(input)).toThrow('Enter CSV data with a header row.');
    });

    it('should throw an error for CSV with only a header row', () => {
      const input = 'name,age';
      expect(() => csvToJson(input)).toThrow('CSV needs a header row and at least one data row.');
    });
  });

  describe('jsonToYaml', () => {
    it('should convert a JSON object to YAML', () => {
      const input = '{"a": 1, "b": "hello", "c": true, "d": null}';
      const result = jsonToYaml(input);
      expect(result.output).toBe('a: 1\nb: hello\nc: true\nd: null');
      expect(result.meta).toBe('YAML generated locally');
    });

    it('should convert JSON arrays to YAML', () => {
      const input = '[1, "two", {"a": 3}]';
      const result = jsonToYaml(input);
      expect(result.output).toBe('- 1\n- two\n-\n  a: 3');
    });

    it('should stringify complex strings with special characters', () => {
      const input = '{"url": "https://example.com/api?a=1", "email": "test@example.com"}';
      const result = jsonToYaml(input);
      // Depending on string matching logic, "url" might need quotes.
      // jsonToYaml has a regex: /^[\w./@-]+$/.test(value)
      // "https://example.com/api?a=1" contains ':', '?', '=' which are not in the regex, so it should be quoted.
      expect(result.output).toBe('url: "https://example.com/api?a=1"\nemail: test@example.com');
    });

    it('should handle empty arrays and objects', () => {
      const input = '{"a": [], "b": {}}';
      const result = jsonToYaml(input);
      expect(result.output).toBe('a:\n  []\nb:\n  {}');
    });

    it('should throw an error for invalid JSON', () => {
      const input = '{a:1}';
      expect(() => jsonToYaml(input)).toThrow('Enter valid JSON.');
    });
  });

  describe('jsonToTypescript', () => {
    it('should convert a simple JSON object to a TypeScript interface', () => {
      const input = '{"name": "Alice", "age": 30, "isActive": true}';
      const result = jsonToTypescript(input);
      expect(result.output).toBe('export interface Root {\n  name: string;\n  age: number;\n  isActive: boolean;\n}');
      expect(result.meta).toBe('TypeScript generated locally — 1 type');
    });

    it('should convert JSON arrays to TypeScript arrays', () => {
      const input = '{"tags": ["admin", "user"], "counts": [1, 2, 3]}';
      const result = jsonToTypescript(input);
      expect(result.output).toBe('export interface Root {\n  tags: string[];\n  counts: number[];\n}');
    });

    it('should handle nested objects and create multiple interfaces', () => {
      const input = '{"user": {"id": 1, "name": "Bob"}}';
      const result = jsonToTypescript(input);
      expect(result.output).toContain('export interface Root {\n  user: RootUser;\n}');
      expect(result.output).toContain('export interface RootUser {\n  id: number;\n  name: string;\n}');
      expect(result.meta).toBe('TypeScript generated locally — 2 types');
    });

    it('should handle arrays of objects', () => {
      const input = '{"users": [{"id": 1}]}';
      const result = jsonToTypescript(input);
      expect(result.output).toContain('export interface Root {\n  users: RootUsersItem[];\n}');
      expect(result.output).toContain('export interface RootUsersItem {\n  id: number;\n}');
    });

    it('should handle root-level primitive', () => {
      const input = '"just a string"';
      const result = jsonToTypescript(input);
      expect(result.output).toBe('export type Root = string;');
    });

    it('should throw an error for invalid JSON', () => {
      const input = '{a:1}';
      expect(() => jsonToTypescript(input)).toThrow('Enter valid JSON to generate TypeScript types.');
    });
  });

  describe('formatJson', () => {
    it('should format valid JSON with 2 spaces', () => {
      const input = '{"a":1,"b":2}';
      const result = formatJson(input);
      expect(result.output).toBe('{\n  "a": 1,\n  "b": 2\n}');
      expect(result.meta).toBe('Valid JSON');
    });

    it('should throw an error for invalid JSON', () => {
      const input = '{a:1}';
      expect(() => formatJson(input)).toThrow(SyntaxError);
    });
  });
});
