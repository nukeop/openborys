import { LuImageOff } from 'react-icons/lu';

export function UnavailableImage() {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-800/50 px-4 py-3 text-sm text-zinc-500">
      <LuImageOff className="size-4 shrink-0" aria-hidden="true" />
      Image no longer available
    </div>
  );
}
