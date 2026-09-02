import type { FilePart, ImagePart, TextPart } from 'ai';
import type { Attachment, Message as DiscordMessage } from 'discord.js';

const imageAttachmentToParts = (attachment: Attachment) => [
  { type: 'text' as const, text: `Image: ${attachment.id}` },
  { type: 'image' as const, image: attachment.url },
];

const videoAttachmentToParts = (attachment: Attachment) => [
  { type: 'text' as const, text: `Video: ${attachment.id}` },
  {
    type: 'file' as const,
    mediaType: attachment.contentType!,
    data: attachment.url,
  },
];

const audioAttachmentToParts = async (attachment: Attachment) => [
  { type: 'text' as const, text: `Audio: ${attachment.id}` },
  {
    type: 'file' as const,
    mediaType: attachment.contentType!,
    data: await fetch(attachment.url).then((response) => response.bytes()),
  },
];

const toAttachmentParts = async (
  attachment: Attachment,
): Promise<(TextPart | ImagePart | FilePart)[]> => {
  const modality = attachment.contentType?.split('/')[0];

  switch (modality) {
    case 'image':
      return imageAttachmentToParts(attachment);
    case 'video':
      return videoAttachmentToParts(attachment);
    case 'audio': {
      const parts = await audioAttachmentToParts(attachment);
      return parts;
    }
    default:
      return [];
  }
};

export const getUsableAttachmentParts = async (
  message: DiscordMessage,
  inputModalities: string[],
) => {
  const readableAttachments = message.attachments.filter((attachment) =>
    inputModalities.some((modality) =>
      attachment.contentType?.startsWith(`${modality}/`),
    ),
  );

  return (await Promise.all(readableAttachments.map(toAttachmentParts))).flat();
};
