import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { toolsQuery } from '../queries/tools';
import { CardSkeleton } from './CardSkeleton';

function ToolPill({
	emoji,
	name,
	alwaysAvailable,
	small,
}: {
	emoji: string;
	name: string;
	alwaysAvailable?: boolean;
	small?: boolean;
}) {
	return (
		<span
			className={clsx(
				'inline-flex items-center gap-1.5 rounded-md border bg-zinc-800/60 text-zinc-300',
				{
					'px-2 py-0.5 text-xs': small,
					'px-2.5 py-1 text-sm': !small,
					'border-teal-700/60': alwaysAvailable,
					'border-zinc-700': !alwaysAvailable,
				},
			)}
		>
			{alwaysAvailable && (
				<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
			)}
			<span>{emoji}</span>
			<span>{name}</span>
		</span>
	);
}

export function ToolsCard() {
	const { data, isPending } = useQuery(toolsQuery);

	if (isPending || !data) {
		return <CardSkeleton />;
	}

	return (
		<div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
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
							name={tool.name}
							alwaysAvailable={tool.isAlwaysAvailable}
						/>
					))}
				</div>
			)}
		</div>
	);
}
