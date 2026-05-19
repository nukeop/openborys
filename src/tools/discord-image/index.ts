import { getLogger } from '@logtape/logtape';
import { tool } from 'ai';
import type { Message } from 'discord.js';
import Replicate from 'replicate';
import { findAttachments } from '../../clients/discord/utils';
import { env } from '../../environment';
import type { ToolWithMeta } from '../../services/tools';
import { modelConfig, modelOptionsDescription } from './config';
import { downloadImage } from './download';
import { buildPayload } from './payload';
import { imageInputSchema } from './schema';
import type { ImageInput } from './types';
import { uploadImage } from './upload';

const logger = getLogger(['OpenBorys', 'tools', 'discord-image']);

const replicate = () =>
  new Replicate({
    auth: env().REPLICATE_API_TOKEN,
    fileEncodingStrategy: 'upload',
  });

export const DISCORD_IMAGE_TOOL_ID = 'discord__image';

const pickOutputUrl = (output: string[] | string): string => {
  return Array.isArray(output) ? (output[0] as string) : output;
};

export const createDiscordImageTool: (
  message: Message,
) => ToolWithMeta<ImageInput, string> = (message) => ({
  id: `${DISCORD_IMAGE_TOOL_ID}_${message.id}`,
  name: 'Image',
  emoji: '🖍️',
  isAlwaysAvailable: true,
  formatArgs: (args) => args.prompt,
  tool: tool({
    description: [
      'Generate or edit images.',
      'Pass attachment IDs in imageIds to edit existing images. Omit imageIds to generate a new image from scratch.',
      'Pass model-specific parameters in the options field. Use the default model unless you have a good reason not to.',
      "If you're generating an image from scratch, declaratively describe what is in it. If you're editing an image, describe imperatively what needs to be changed. You can use pseudo-JSON prompt style if you want to have precise control over editing or generation. Use English for writing prompts.",
      '',
      'Available options per model:',
      modelOptionsDescription,
    ].join('\n'),
    inputSchema: imageInputSchema,
  }),
  execute: async ({ imageIds = [], prompt, model, options }) => {
    logger.info(
      'Using Discord Image tool with model: {model}. Attached image ids: {imageIds}. Options: {options}. Prompt: {prompt}',
      { model, imageIds, options, prompt },
    );

    if (!message.channel.isSendable()) {
      return JSON.stringify({
        error: 'Cannot send images to this channel.',
      });
    }

    const attachmentUrls = await findAttachments(message.channel, imageIds);

    const payload = buildPayload(model, prompt, attachmentUrls, options);
    const output = (await replicate().run(modelConfig[model].replicateId, {
      input: payload,
    })) as string[] | string;

    const imageBuffer = await downloadImage(pickOutputUrl(output));
    await uploadImage(message.channel, imageBuffer, 'image.png');

    return JSON.stringify({ message: 'Image was shown to the users.' });
  },
});
