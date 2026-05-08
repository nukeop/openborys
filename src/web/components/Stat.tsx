export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-zinc-100">{value}</span>
    </div>
  );
}
