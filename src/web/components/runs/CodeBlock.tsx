export function CodeBlock({
  label,
  text,
  tone = 'default',
}: {
  label?: string;
  text: string;
  tone?: 'default' | 'error';
}) {
  let textColor = 'text-zinc-300';
  if (tone === 'error') {
    textColor = 'text-red-300';
  }

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && <span className="text-xs text-zinc-500">{label}</span>}
      <pre
        className={`max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-zinc-950 p-3 text-xs leading-5 [overflow-wrap:anywhere] ${textColor}`}
      >
        {text}
      </pre>
    </div>
  );
}
