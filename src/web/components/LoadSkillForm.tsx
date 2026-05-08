import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type SubmitEventHandler, useState } from 'react';
import { loadSkillMutation, skillsQuery } from '../queries/skills';

export function LoadSkillForm() {
  const [url, setUrl] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: loadSkillMutation,
    async onSuccess() {
      setUrl('');
      await queryClient.invalidateQueries({ queryKey: skillsQuery.queryKey });
    },
  });

  const handleSubmit: SubmitEventHandler = (e) => {
    e.preventDefault();
    if (url.trim()) {
      mutation.mutate(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 gap-2">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/SKILL.md"
        className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-teal-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={mutation.isPending || !url.trim()}
        className="rounded-md bg-teal-600 px-4 py-1.5 font-medium text-sm text-white transition-colors hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600"
      >
        {mutation.isPending ? 'Loading...' : 'Load'}
      </button>
    </form>
  );
}
