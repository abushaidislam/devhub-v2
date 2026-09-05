import { describe, expect, it } from 'vitest';
import { generateLoremIpsum } from '../engines/generators';
import { calculateChmod } from '../engines/text';
import { formatHtml } from '../engines/formatters';

describe('generateLoremIpsum engine', () => {
  it('generates 3 paragraphs by default', () => {
    const res = generateLoremIpsum('3');
    expect(res.output).toBeDefined();
    const paragraphs = res.output.split('\n\n');
    expect(paragraphs.length).toBe(3);
    expect(paragraphs[0]).toContain('Lorem ipsum dolor sit amet');
    expect(res.meta).toBe('Generated 3 paragraphs locally');
  });

  it('generates specified number of sentences', () => {
    const res = generateLoremIpsum('4', { units: 'sentences', count: 4 });
    const sentences = res.output.split('.').filter((s) => s.trim().length > 0);
    expect(sentences.length).toBe(4);
    expect(res.meta).toBe('Generated 4 sentences locally');
  });

  it('generates specified number of words', () => {
    const res = generateLoremIpsum('15', { units: 'words', count: 15 });
    const words = res.output.split(/\s+/);
    expect(words.length).toBe(15);
    expect(words[0].toLowerCase()).toBe('lorem');
    expect(res.meta).toBe('Generated 15 words locally');
  });

  it('allows disabling Cicero start for random generation', () => {
    const res = generateLoremIpsum('20', { units: 'words', count: 20, startWithLorem: false });
    expect(res.output.split(/\s+/).length).toBe(20);
  });
});

describe('calculateChmod engine', () => {
  it('calculates permissions from standard 3-digit octal (755)', () => {
    const res = calculateChmod('755');
    expect(res.output).toContain('Octal: 755 (4-digit: 0755)');
    expect(res.output).toContain('Symbolic: -rwxr-xr-x');
    expect(res.output).toContain('Binary: 111 101 101');
    expect(res.output).toContain('Owner (User):   Read, Write, Execute (7)');
    expect(res.output).toContain('Group:          Read, Execute (5)');
    expect(res.output).toContain('Others (World): Read, Execute (5)');
    expect(res.output).toContain('chmod 755 <file>');
    expect(res.meta).toBe('Chmod 755 (-rwxr-xr-x)');
  });

  it('calculates permissions from 4-digit octal (0644)', () => {
    const res = calculateChmod('0644');
    expect(res.output).toContain('Octal: 644 (4-digit: 0644)');
    expect(res.output).toContain('Symbolic: -rw-r--r--');
    expect(res.output).toContain('Owner (User):   Read, Write (6)');
    expect(res.output).toContain('Group:          Read (4)');
    expect(res.output).toContain('Others (World): Read (4)');
  });

  it('calculates permissions from symbolic notation (rwxr-xr-x)', () => {
    const res = calculateChmod('rwxr-xr-x');
    expect(res.output).toContain('Octal: 755 (4-digit: 0755)');
    expect(res.output).toContain('Symbolic: -rwxr-xr-x');
  });

  it('handles leading file type dash in symbolic notation (-rwxrwxrwx)', () => {
    const res = calculateChmod('-rwxrwxrwx');
    expect(res.output).toContain('Octal: 777 (4-digit: 0777)');
    expect(res.output).toContain('Symbolic: -rwxrwxrwx');
  });

  it('throws on invalid permission inputs', () => {
    expect(() => calculateChmod('')).toThrow();
    expect(() => calculateChmod('888')).toThrow('Invalid permission format');
    expect(() => calculateChmod('not-a-permission')).toThrow('Invalid permission format');
  });
});

describe('formatHtml engine', () => {
  const messyHtml = '<div><h1>Title</h1><p>Hello <span>world</span></p><img src="pic.jpg"><br><hr></div>';

  it('formats and indents HTML markup properly', () => {
    const res = formatHtml(messyHtml, { mode: 'format' });
    expect(res.output).toContain('<div>');
    expect(res.output).toContain('  <h1>');
    expect(res.output).toContain('    Title');
    expect(res.output).toContain('  </h1>');
    expect(res.output).toContain('  <p>');
    expect(res.output).toContain('  <img src="pic.jpg">');
    expect(res.output).toContain('  <br>');
    expect(res.output).toContain('  <hr>');
    expect(res.meta).toContain('Formatted HTML locally');
  });

  it('minifies HTML markup by stripping unnecessary spaces and comments', () => {
    const htmlWithComments = '<!-- sample comment --> <div>  <h1> Title </h1> \n <p> Text </p> </div>';
    const res = formatHtml(htmlWithComments, { mode: 'minify' });
    expect(res.output).not.toContain('sample comment');
    expect(res.output).toBe('<div><h1> Title </h1><p> Text </p></div>');
    expect(res.meta).toContain('Minified HTML');
  });

  it('throws on empty input', () => {
    expect(() => formatHtml('')).toThrow('Enter HTML markup to format.');
  });
});
