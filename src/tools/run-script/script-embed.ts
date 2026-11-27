import { getLogger } from '@logtape/logtape';
import { EmbedBuilder, type Message } from 'discord.js';
import { env } from '../../environment';
import type { StoredRun } from '../../services/runs';
import { errorMessage } from '../../utils/error';
import { CallTable } from './call-table';
import type { ScriptToolCall } from './run-script';

const logger = getLogger(['OpenBorys', 'tools', 'run-script']);

export class ScriptEmbed {
  static #colors = { running: 0x71717a, success: 0x14b8a6, error: 0xef4444 };
  static #statusLabels = { success: 'Success', error: 'Error' };

  readonly #message: Message;
  readonly #title: string;
  #edits: Promise<unknown> = Promise.resolve();

  private constructor(message: Message, title: string) {
    this.#message = message;
    this.#title = title;
  }

  static async send(source: Message, tool: { emoji: string; name: string }) {
    if (!source.channel.isSendable()) {
      throw new Error('Cannot send the script embed to this channel');
    }

    const title = `${tool.emoji} ${tool.name}`;
    const embed = ScriptEmbed.#embed(title, [])
      .setColor(ScriptEmbed.#colors.running)
      .setFooter({ text: 'Running' });
    const message = await source.channel.send({ embeds: [embed] });

    return new ScriptEmbed(message, title);
  }

  static #embed(title: string, calls: ScriptToolCall[]) {
    const embed = new EmbedBuilder().setTitle(title);
    if (calls.length > 0) {
      embed.setDescription(new CallTable(calls).toString());
    }

    return embed;
  }

  showCalls(calls: ScriptToolCall[]) {
    const embed = ScriptEmbed.#embed(this.#title, calls)
      .setColor(ScriptEmbed.#colors.running)
      .setFooter({ text: `Running · Tool calls: ${calls.length}` });

    this.#edit(embed);
  }

  finish(run: StoredRun) {
    const { status, calls } = run.result;
    const footer = [
      ScriptEmbed.#statusLabels[status],
      `Tool calls: ${calls.length}`,
      this.#duration(run),
    ];
    const embed = ScriptEmbed.#embed(this.#title, calls)
      .setColor(ScriptEmbed.#colors[status])
      .setFooter({ text: footer.join(' · ') });

    const dashboardUrl = env().DASHBOARD_URL;
    if (dashboardUrl) {
      embed.setURL(`${dashboardUrl}/runs/${run.id}`);
    }

    this.#edit(embed);

    return this.#edits;
  }

  #edit(embed: EmbedBuilder) {
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
