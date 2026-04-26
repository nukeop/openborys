import { beforeAll, beforeEach, describe, expect, it, spyOn } from 'bun:test';
import { S3Client, type S3File } from 'bun';
import { loadEnvironment } from '../environment';
import { loadPrompts } from './index';

const listSpy = spyOn(S3Client.prototype, 'list');
const fileSpy = spyOn(S3Client.prototype, 'file');

describe('loadPrompts', () => {
  beforeAll(() => {
    loadEnvironment();
  });

  beforeEach(() => {
    listSpy.mockReset();
    fileSpy.mockReset();
  });

  it('returns an empty string when the bucket has no objects', async () => {
    listSpy.mockResolvedValue({ contents: [] });

    const result = await loadPrompts();

    expect(result).toBe('');
  });

  it('wraps each object in XML tags and joins them with newlines', async () => {
    listSpy.mockResolvedValue({
      contents: [{ key: 'prompts/system' }, { key: 'prompts/persona' }],
    });
    fileSpy.mockImplementation(
      (key: string) =>
        ({
          text: async () =>
            key === 'prompts/system' ? 'you are a bot' : 'be nice',
        }) as unknown as S3File,
    );

    const result = await loadPrompts();

    expect(result).toBe(
      '<prompts/system>you are a bot</prompts/system>\n<prompts/persona>be nice</prompts/persona>',
    );
  });
});
