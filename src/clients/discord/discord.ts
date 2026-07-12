import { Client, GatewayIntentBits } from 'discord.js';
import { env } from '../../environment';
import { changeCheapModelCommand } from './commands/change-cheap-model';
import { changeCheapProviderCommand } from './commands/change-cheap-provider';
import { changeModelCommand } from './commands/change-model';
import { changeProviderCommand } from './commands/change-provider';
import { loadEvents } from './events';
import { DiscordCommandsService } from './services/discord-commands';

class DiscordClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
      ],
    });
  }

  public async start(token: string): Promise<void> {
    loadEvents(this);
    await this.login(token);
  }
}

const registerCommands = () => {
  DiscordCommandsService.registerCommand(changeModelCommand);
  DiscordCommandsService.registerCommand(changeCheapModelCommand);
  DiscordCommandsService.registerCommand(changeProviderCommand);
  DiscordCommandsService.registerCommand(changeCheapProviderCommand);
};

export const run = async () => {
  registerCommands();
  const client = new DiscordClient();
  await client.start(env().DISCORD_TOKEN);
};
