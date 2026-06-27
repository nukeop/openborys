import { Client, GatewayIntentBits } from 'discord.js';
import { env } from '../../environment';
import { changeModelCommand } from './commands/change-model';
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
};

export const run = async () => {
  registerCommands();
  const client = new DiscordClient();
  await client.start(env().DISCORD_TOKEN);
};
