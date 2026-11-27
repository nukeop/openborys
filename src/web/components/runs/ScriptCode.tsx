import type { CSSProperties } from 'react';

/** Line numbers come from a CSS counter, so copying the code does not copy them. */
export function ScriptCode({ code }: { code: string }) {
  const lines = code.split('\n');
  const gutter = { '--gutter': `${String(lines.length).length}ch` };

  return (
    <pre
      style={gutter as CSSProperties}
      className="overflow-x-auto rounded-md bg-zinc-950 py-3 text-xs text-zinc-300 leading-5 [counter-reset:line]"
    >
      <code>
        {lines.map((line, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: lines of a fixed text
            key={index}
            className="block pr-4 [counter-increment:line] before:mr-4 before:inline-block before:w-[calc(var(--gutter)+1rem)] before:select-none before:text-right before:text-zinc-600 before:content-[counter(line)]"
          >
            {line}
          </span>
        ))}
      </code>
    </pre>
  );
}
