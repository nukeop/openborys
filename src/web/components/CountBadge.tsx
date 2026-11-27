export function CountBadge({ count }: { count: number }) {
  return (
    <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
      {count}
    </span>
  );
}
