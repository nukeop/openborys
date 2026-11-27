import { getLogger } from '@logtape/logtape';
import { EmbedBuilder, type Message } from 'discord.js';
import { env } from '../../environment';
import type { StoredRun } from '../../services/runs';
import { errorMessage } from '../../utils/error';

const logger = getLogger(['OpenBorys', 'tools', 'run-script']);

export class ScriptEmbed {
  readonly #message: Message;
  readonly #heading: string;
  readonly #emojis: string[] = [];
  #edits: Promise<unknown> = Promise.resolve();

  private constructor(message: Message, heading: string) {
    this.#message = message;
    this.#heading = heading;
  }

  static async send(source: Message, tool: { emoji: string; name: string }) {
    if (!source.channel.isSendable()) {
      throw new Error('Cannot send the script embed to this channel');
    }

    const heading = `${tool.emoji} **${tool.name}**`;
    const embed = ScriptEmbed.#embed(heading, '⏳');
    const message = await source.channel.send({ embeds: [embed] });

    return new ScriptEmbed(message, heading);
  }

  static #embed(heading: string, status: string) {
    return new EmbedBuilder().setDescription(`${heading}\n${status}`);
  }

  addCall(emoji: string) {
    this.#emojis.push(emoji);
    this.#edit([...this.#emojis, '⏳']);
  }

  finish(run: StoredRun) {
    const statusEmoji = { success: '✅', error: '❌' }[run.result.status];
    const parts = [...this.#emojis, statusEmoji, this.#duration(run)];

    const dashboardUrl = env().DASHBOARD_URL;
    if (dashboardUrl) {
      parts.push(`[Details](${dashboardUrl}/runs/${run.id})`);
    }

    this.#edit(parts);

    return this.#edits;
  }

  #edit(parts: string[]) {
    const embed = ScriptEmbed.#embed(this.#heading, parts.join(' '));

    this.#edits = this.#edits
      .then(() => this.#message.edit({ embeds: [embed] }))
      .catch((error) => {
        logger.warn('Failed to edit the script embed: {error}', {
          error: errorMessage(error),
        });
      });
  }

  #duration(run: StoredRun) {
    const seconds = Math.round((run.endedAt - run.startedAt) / 1000);
    const format = new Intl.DurationFormat('en', {
      style: 'narrow',
      secondsDisplay: 'always',
    });

    return format.format({
      minutes: Math.floor(seconds / 60),
      seconds: seconds % 60,
    });
  }
}
