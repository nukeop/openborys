import type { ScriptToolCall } from './run-script';

type Row = {
  marker: string;
  emoji: string;
  tool: string;
  summary: string;
  duration: string;
};

export class CallTable {
  static #visibleRows = 10;
  static #maxToolWidth = 14;
  static #maxSummaryWidth = 16;
  static #seconds = new Intl.NumberFormat('en', {
    style: 'unit',
    unit: 'second',
    unitDisplay: 'narrow',
    maximumFractionDigits: 1,
  });

  readonly #calls: ScriptToolCall[];

  constructor(calls: ScriptToolCall[]) {
    this.#calls = calls;
  }

  toString() {
    const rows = this.#calls
      .slice(-CallTable.#visibleRows)
      .map((call) => CallTable.#row(call));
    const toolWidth = Math.max(...rows.map((row) => row.tool.length));
    const summaryWidth = Math.max(...rows.map((row) => row.summary.length));

    const lines = rows.map((row) => {
      const tool = row.tool.padEnd(toolWidth);
      const summary = row.summary.padEnd(summaryWidth);

      const line = `${row.marker} ${row.emoji} ${tool}  ${summary}  ${row.duration}`;

      return line.trimEnd();
    });

    const hiddenCount = this.#calls.length - CallTable.#visibleRows;
    if (hiddenCount > 0) {
      lines.unshift(`  +${hiddenCount} earlier`);
    }

    return ['```diff', ...lines, '```'].join('\n');
  }

  static #row(call: ScriptToolCall): Row {
    return {
      marker: CallTable.#marker(call),
      emoji: call.emoji,
      tool: CallTable.#cut(call.toolId, CallTable.#maxToolWidth),
      summary: CallTable.#cut(
        CallTable.#clean(call.summary),
        CallTable.#maxSummaryWidth,
      ),
      duration: CallTable.#duration(call),
    };
  }

  static #marker(call: ScriptToolCall) {
    if (call.error) {
      return '-';
    }

    if (!('durationMs' in call)) {
      return ' ';
    }

    return '+';
  }

  static #duration(call: ScriptToolCall) {
    if (!call.durationMs) {
      return '';
    }

    return CallTable.#seconds.format(call.durationMs / 1000);
  }

  static #clean(text: string) {
    return text
      .replace(/\p{Extended_Pictographic}\uFE0F?/gu, '')
      .replaceAll('`', "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  static #cut(text: string, width: number) {
    if (text.length <= width) {
      return text;
    }

    return `${text.slice(0, width - 1)}…`;
  }
}
