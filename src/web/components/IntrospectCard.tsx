import { useQuery } from '@tanstack/react-query';
import { introspectQuery } from '../queries/introspect';
import { CardSkeleton } from './CardSkeleton';
import { Stat } from './Stat';

const bytes = new Intl.NumberFormat('en', {
  style: 'unit',
  unit: 'gigabyte',
  maximumFractionDigits: 1,
});

const duration = new Intl.DurationFormat('en', { style: 'narrow' });

const percent = new Intl.NumberFormat('en', {
  style: 'percent',
  maximumFractionDigits: 0,
});

export function IntrospectCard() {
  const { data, isPending } = useQuery(introspectQuery);

  if (isPending || !data) {
    return <CardSkeleton />;
  }

  const usageRatio = 1 - data.memory.free / data.memory.total;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_6px_var(--color-teal-400)]" />
        <h2 className="font-semibold text-zinc-100">{data.name}</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
          {data.environment}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        <Stat
          label="AI model"
          value={`${data.ai.provider} / ${data.ai.model}`}
        />
        <Stat
          label="Platform"
          value={`${data.runtime.platform} ${data.runtime.arch}`}
        />
        <Stat label="Bun" value={`v${data.runtime.version}`} />
        <Stat
          label="CPU"
          value={`${data.cpu.model} (${data.cpu.cores} cores)`}
        />
        <Stat
          label="Memory"
          value={`${bytes.format(data.memory.free / 1024 ** 3)} free / ${bytes.format(data.memory.total / 1024 ** 3)}`}
        />
        <Stat label="Memory usage" value={percent.format(usageRatio)} />
        <Stat
          label="Uptime"
          value={duration.format({
            hours: Math.floor(data.uptimeSeconds / 3600),
            minutes: Math.floor((data.uptimeSeconds % 3600) / 60),
          })}
        />
      </div>
    </div>
  );
}
