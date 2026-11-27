import type { JSONValue } from 'ai';

function parseStructure(text: string) {
  try {
    const parsed: JSONValue = JSON.parse(text);
    if (typeof parsed === 'object') {
      return parsed;
    }
  } catch {}

  return null;
}

/** Strings that hold a JSON object or array (most tool outputs) are pretty-printed too. */
export function formatJson(value: JSONValue) {
  if (typeof value !== 'string') {
    return JSON.stringify(value, null, 2);
  }

  const structure = parseStructure(value);
  if (!structure) {
    return value;
  }

  return JSON.stringify(structure, null, 2);
}
