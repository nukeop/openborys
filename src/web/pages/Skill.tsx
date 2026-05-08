import { useQuery } from '@tanstack/react-query';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link, useParams } from 'wouter';
import { skillQuery } from '../queries/skill';

export function Skill() {
  const params = useParams<{ name: string }>();
  const decodedName = decodeURIComponent(params.name ?? '');
  const { data, isPending } = useQuery(skillQuery(decodedName));

  if (isPending || !data) {
    return <div className="p-8 text-zinc-500">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      <title>{data.name}</title>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-teal-400"
      >
        &larr; Back
      </Link>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="font-bold text-xl text-zinc-100">{data.name}</h1>
        </div>
        <p className="mb-6 text-sm text-zinc-500">{data.description}</p>

        <div className="prose prose-invert prose-sm max-w-none prose-code:rounded prose-pre:border prose-pre:border-zinc-800 prose-code:bg-zinc-800 prose-pre:bg-zinc-950 prose-code:px-1.5 prose-code:py-0.5 prose-a:text-teal-400 prose-code:text-teal-300 prose-headings:text-zinc-100 prose-li:text-zinc-300 prose-p:text-zinc-300 prose-strong:text-zinc-200">
          <Markdown remarkPlugins={[remarkGfm]}>{data.body}</Markdown>
        </div>
      </div>
    </div>
  );
}
