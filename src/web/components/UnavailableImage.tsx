import { LuImageOff } from 'react-icons/lu';

export function UnavailableImage() {
  return (
    <div className="flex items-center gap-2 rounded-[18px] border border-zinc-800 border-dashed px-4 py-3 text-sm text-zinc-500">
      <LuImageOff className="size-4 shrink-0" aria-hidden="true" />
      Image no longer available
    </div>
  );
}
