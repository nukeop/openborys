import { Client, GatewayIntentBits } from "discord.js";

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
    await this.login(token);
  }
}

export const run = async () => {
  const client = new DiscordClient();
  await client.start(process.env.DISCORD_TOKEN!);
};
