import { createProviderCommand } from './change-provider';

export const changeCheapProviderCommand = createProviderCommand(
  'cheap',
  'change-cheap-provider',
  'Change the cheap AI provider (reply decisions, cheap object generation)',
);
