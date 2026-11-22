// Loads long-form tool content from content/tools/<slug>.md. Used to seed new
// databases and to fill in existing ones (see applyContentDetails in db.ts).
// No npm imports: scripts/scan.ts loads this through db.ts with plain Node.
//
// File format:
//   ---
//   license: MIT
//   language: Rust
//   ---
//   ## Features
//   - Title: what it does
//   ## Strengths
//   - one per line
//   ## Watch out for
//   - one per line
//   ## Alternatives
//   - Name: how it compares
//   ## In depth
//   Markdown (### subheadings, lists, code fences, `code`, **bold**, [links](https://…))
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

type Details = { features: string; body: string; strengths: string; limitations: string; alternatives: string; license: string; language: string };

const SECTIONS: Record<string, keyof Details> = {
  features: 'features', strengths: 'strengths', 'watch out for': 'limitations', alternatives: 'alternatives', 'in depth': 'body',
};

export function parseDetails(text: string): Details {
  const out: Details = { features: '', body: '', strengths: '', limitations: '', alternatives: '', license: '', language: '' };
  let lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines[0]?.trim() === '---') {
    const end = lines.indexOf('---', 1);
    for (const line of lines.slice(1, end)) {
      const m = line.match(/^(\w+):\s*(.*)$/);
      if (m && (m[1] === 'license' || m[1] === 'language')) out[m[1]] = m[2].trim();
    }
    lines = lines.slice(end + 1);
  }
  let current: keyof Details | null = null;
  const buf: Partial<Record<keyof Details, string[]>> = {};
  for (const line of lines) {
    const h = line.match(/^## (.+?)\s*$/);
    if (h && SECTIONS[h[1].toLowerCase()] && current !== 'body') {
      current = SECTIONS[h[1].toLowerCase()];
      buf[current] = [];
      continue;
    }
    if (current) buf[current]!.push(line);
  }
  for (const [key, value] of Object.entries(buf) as [keyof Details, string[]][]) {
    out[key] = key === 'body'
      ? value.join('\n').trim()
      : value.filter((l) => /^\s*[-*] /.test(l)).map((l) => l.replace(/^\s*[-*] /, '').trim()).join('\n');
  }
  return out;
}

export function loadDetails(): Map<string, Details> {
  const dir = resolve(process.env.CONTENT_DIR || 'content/tools');
  const map = new Map<string, Details>();
  if (!existsSync(dir)) return map;
  for (const file of readdirSync(dir)) {
    if (file.endsWith('.md')) map.set(file.slice(0, -3), parseDetails(readFileSync(join(dir, file), 'utf8')));
  }
  return map;
}
