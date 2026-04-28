import { YAML } from 'bun';
import type { Skill } from './system-prompt';

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export const parseSkill = (markdown: string, sourceUrl: string): Skill => {
  const match = markdown.match(FRONTMATTER_REGEX);
  if (!match) {
    throw new Error('Missing YAML frontmatter');
  }

  const frontmatterRaw = match[1]!;
  const body = match[2]!;
  const frontmatter = YAML.parse(frontmatterRaw) as Record<string, unknown>;

  if (typeof frontmatter.name !== 'string') {
    throw new Error('Missing "name" in frontmatter');
  }

  if (typeof frontmatter.description !== 'string') {
    throw new Error('Missing "description" in frontmatter');
  }

  return {
    name: frontmatter.name,
    description: frontmatter.description,
    body: body.trim(),
    sourceUrl,
  };
};
