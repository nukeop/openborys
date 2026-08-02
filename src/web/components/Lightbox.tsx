import { useEffect } from 'react';

export function Lightbox({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
      <button
        type="button"
        aria-label="Close image preview"
        onClick={onClose}
        className="absolute inset-0 cursor-zoom-out bg-black/80 backdrop-blur-sm"
      />
      <img
        src={url}
        alt="Full-size attachment"
        className="relative max-h-full max-w-full rounded-lg object-contain shadow-2xl"
      />
    </div>
  );
}
