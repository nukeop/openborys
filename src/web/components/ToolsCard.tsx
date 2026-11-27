import { useQuery } from '@tanstack/react-query';
import { toolsQuery } from '../queries/tools';
import { CardSkeleton } from './CardSkeleton';
import { ToolPill } from './ToolPill';

export function ToolsCard() {
  const { data, isPending } = useQuery(toolsQuery);

  if (isPending || !data) {
    return <CardSkeleton />;
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-semibold text-zinc-100">Tools</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
          {data.length}
        </span>
      </div>

      {data.length === 0 ? (
        <p className="text-sm text-zinc-500">No tools registered.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.map((tool) => (
            <ToolPill
              key={tool.id}
              emoji={tool.emoji}
              label={tool.name}
              alwaysAvailable={tool.isAlwaysAvailable}
            />
          ))}
        </div>
      )}
    </div>
  );
}
