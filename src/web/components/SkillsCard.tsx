import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import type { Skill } from '../../services/system-prompt';
import { skillsQuery } from '../queries/skills';
import { CardSkeleton } from './CardSkeleton';

function SkillRow({ skill }: { skill: Skill }) {
  return (
    <Link
      to={`/skills/${encodeURIComponent(skill.name)}`}
      className="group flex flex-col gap-1 rounded-md border border-zinc-800 bg-zinc-800/40 px-4 py-3 transition-colors hover:border-teal-400/40 hover:bg-zinc-800/70"
    >
      <span className="font-semibold text-sm text-zinc-100 group-hover:text-teal-300">
        {skill.name}
      </span>
      <span className="line-clamp-2 text-xs text-zinc-500">
        {skill.description}
      </span>
    </Link>
  );
}

export function SkillsCard() {
  const { data, isPending } = useQuery(skillsQuery);

  if (isPending || !data) {
    return <CardSkeleton />;
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-semibold text-zinc-100">Loaded skills</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
          {data.length}
        </span>
      </div>

      {!data.length && (
        <p className="text-sm text-zinc-500">No skills loaded.</p>
      )}
      {data.length && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.map((skill) => (
            <SkillRow key={skill.name} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
