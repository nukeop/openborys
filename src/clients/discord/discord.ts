import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

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
  dotenv.config();
  const client = new DiscordClient();
  await client.start(process.env.DISCORD_TOKEN!);
};
