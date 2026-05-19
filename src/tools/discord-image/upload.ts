import { AttachmentBuilder, type SendableChannels } from 'discord.js';

export const uploadImage = async (
  channel: SendableChannels,
  imageBuffer: Buffer,
  fileName: string,
): Promise<void> => {
  const attachment = new AttachmentBuilder(imageBuffer, { name: fileName });
  await channel.send({ files: [attachment] });
};
