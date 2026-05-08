import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IoClose } from 'react-icons/io5';
import { Link } from 'wouter';
import type { Skill } from '../../services/system-prompt';
import { skillsQuery, unloadSkillMutation } from '../queries/skills';
import { CardSkeleton } from './CardSkeleton';
import { LoadSkillForm } from './LoadSkillForm';

function SkillRow({ skill }: { skill: Skill }) {
  const queryClient = useQueryClient();

  const unload = useMutation({
    mutationFn: unloadSkillMutation,
    async onSuccess() {
      await queryClient.invalidateQueries({
        queryKey: skillsQuery.queryKey,
      });
    },
  });

  return (
    <div className="group flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-800/40 px-4 py-3 transition-colors hover:border-teal-400/40 hover:bg-zinc-800/70">
      <Link
        to={`/skills/${encodeURIComponent(skill.name)}`}
        className="flex min-w-0 flex-1 flex-col gap-1"
      >
        <span className="font-semibold text-sm text-zinc-100 group-hover:text-teal-300">
          {skill.name}
        </span>
        <span className="line-clamp-2 text-xs text-zinc-500">
          {skill.description}
        </span>
      </Link>
      <button
        type="button"
        onClick={() => unload.mutate(skill.name)}
        disabled={unload.isPending}
        title="Unload skill"
        className="shrink-0 rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
      >
        <IoClose size={16} />
      </button>
    </div>
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
        <h2 className="shrink-0 font-semibold text-zinc-100">Loaded skills</h2>
        <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
          {data.length}
        </span>
        <LoadSkillForm />
      </div>

      {!data.length && (
        <p className="mt-4 text-sm text-zinc-500">No skills loaded.</p>
      )}
      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.map((skill) => (
            <SkillRow key={skill.name} skill={skill} />
          ))}
        </div>
      )}
    </div>
  );
}
