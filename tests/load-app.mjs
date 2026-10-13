import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

export const sourceRoot = fileURLToPath(new URL('../', import.meta.url));
export const files = ['linguistic-data.js', 'linguistic-core.js', 'application-state.js', 'view-model.js', 'presentation.js', 'bootstrap.js'];
export function loadPure() {
  const context = vm.createContext({});
  for (const file of files.slice(0, 4)) vm.runInContext(readFileSync(sourceRoot + file, 'utf8'), context, { filename: file });
  return context;
}
// Bring values back into the test realm; VM objects have different prototypes.
export const plain = value => JSON.parse(JSON.stringify(value));
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
