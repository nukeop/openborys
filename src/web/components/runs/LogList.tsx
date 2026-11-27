export function LogList({ logs }: { logs: string[] }) {
  return (
    <ol className="flex flex-col gap-px overflow-hidden rounded-md bg-zinc-800/60 font-mono text-xs leading-5">
      {logs.map((line, index) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: log lines never reorder
          key={index}
          className="whitespace-pre-wrap bg-zinc-950 px-3 py-1.5 text-zinc-300 [overflow-wrap:anywhere]"
        >
          {line}
        </li>
      ))}
    </ol>
  );
}
