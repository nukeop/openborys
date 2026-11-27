import { getLogger } from '@logtape/logtape';
import { EmbedBuilder, type Message } from 'discord.js';
import { env } from '../../environment';
import type { StoredRun } from '../../services/runs';
import { errorMessage } from '../../utils/error';
import type { ScriptToolCall } from './run-script';

const logger = getLogger(['OpenBorys', 'tools', 'run-script']);

export class ScriptEmbed {
  static #visibleCalls = 10;
  static #summaryLength = 80;

  readonly #message: Message;
  readonly #heading: string;
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
    const embed = ScriptEmbed.#embed([heading, '⏳']);
    const message = await source.channel.send({ embeds: [embed] });

    return new ScriptEmbed(message, heading);
  }

  static #embed(lines: string[]) {
    return new EmbedBuilder().setDescription(lines.join('\n'));
  }

  showCalls(calls: ScriptToolCall[]) {
    this.#edit(calls, '⏳');
  }

  finish(run: StoredRun) {
    const statusEmoji = { success: '✅', error: '❌' }[run.result.status];
    const parts = [statusEmoji, this.#duration(run)];

    const dashboardUrl = env().DASHBOARD_URL;
    if (dashboardUrl) {
      parts.push(`[Details](${dashboardUrl}/runs/${run.id})`);
    }

    this.#edit(run.result.calls, parts.join(' '));

    return this.#edits;
  }

  #edit(calls: ScriptToolCall[], footer: string) {
    const lines = [this.#heading, ...this.#callLines(calls), footer];
    const embed = ScriptEmbed.#embed(lines);

    this.#edits = this.#edits
      .then(() => this.#message.edit({ embeds: [embed] }))
      .catch((error) => {
        logger.warn('Failed to edit the script embed: {error}', {
          error: errorMessage(error),
        });
      });
  }

  #callLines(calls: ScriptToolCall[]) {
    const lines = calls
      .slice(-ScriptEmbed.#visibleCalls)
      .map((call) => this.#callLine(call));

    const hiddenCount = calls.length - ScriptEmbed.#visibleCalls;
    if (hiddenCount > 0) {
      lines.unshift(`+${hiddenCount} earlier`);
    }

    return lines;
  }

  #callLine(call: ScriptToolCall) {
    const summary = call.summary
      .replace(/\s+/g, ' ')
      .slice(0, ScriptEmbed.#summaryLength);

    return `${call.emoji} **${call.name}** ${summary} ${this.#callStatus(call)}`;
  }

  #callStatus(call: ScriptToolCall) {
    if (call.error) {
      return '❌';
    }

    if (!('durationMs' in call)) {
      return '⏳';
    }

    return '✅';
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
