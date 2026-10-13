import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('.', import.meta.url));

// Explicit data-inline markers are the packaging manifest. The source page is
// already runnable; packaging only embeds bytes, preserving order and formatting.
export async function packageHtml(sourceDir = defaultRoot) {
  const root = resolve(sourceDir);
  const html = await readFile(resolve(root, 'index.html'), 'utf8');
  async function asset(name, closingTag) {
    if (!/^[a-zA-Z0-9_./-]+$/.test(name)) throw new Error('Expected a local asset path: ' + name);
    const path = resolve(root, name);
    const rel = relative(root, path);
    if (isAbsolute(rel) || rel === '..' || rel.startsWith('../')) throw new Error('Asset leaves the source directory');
    const contents = await readFile(path, 'utf8');
    if (new RegExp('</' + closingTag + '\\b', 'i').test(contents)) throw new Error('Asset contains an unsafe HTML closing tag: ' + name);
    return contents;
  }
  const tags = [...html.matchAll(/<link\b[^>]*\bdata-inline\b[^>]*>|<script\b[^>]*\bdata-inline\b[^>]*>\s*<\/script>/g)];
  let result = '', offset = 0;
  for (const match of tags) {
    const tag = match[0];
    const script = tag.startsWith('<script');
    const name = tag.match(script ? /\bsrc="([^"]+)"/ : /\bhref="([^"]+)"/)?.[1];
    if (!name) throw new Error('Marked asset has no path');
    const contents = await asset(name, script ? 'script' : 'style');
    result += html.slice(offset, match.index);
    result += script ? '<script data-source="' + name + '">\n' + contents + '</script>' : '<style data-source="' + name + '">\n' + contents + '</style>';
    offset = match.index + tag.length;
  }
  result += html.slice(offset);
  return result;
}

export async function writePackage(outputPath = resolve(defaultRoot, 'dist/russian-motion-verbs.html')) {
  const html = await packageHtml();
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
  return outputPath;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(await writePackage(process.argv[2] ? resolve(process.argv[2]) : undefined));
}
