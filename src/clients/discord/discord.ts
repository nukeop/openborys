import { Client, GatewayIntentBits } from 'discord.js';
import { env } from '../../environment';
import { loadEvents } from './events';

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

export const run = async () => {
  const client = new DiscordClient();
  await client.start(env().DISCORD_TOKEN);
};
