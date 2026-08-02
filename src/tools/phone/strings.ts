import { StringsService } from '../../services/strings';

export type PhoneStrings = {
  toolName: string;
  toolDescription: string;
  systemPrompt: string;
  callFailed: string;
};

export function getPhoneStrings(): PhoneStrings {
  return StringsService.get('phone') as PhoneStrings;
}

export function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(
    /\{(\w+)\}/g,
    (match, key: string) => vars[key] ?? match,
  );
}
