import { useState } from 'react';
import { Lightbox } from './Lightbox';
import { UnavailableImage } from './UnavailableImage';

export function BubbleImage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (failed) {
    return <UnavailableImage />;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open image preview"
        onClick={() => setLightboxOpen(true)}
        className="cursor-zoom-in"
      >
        <img
          src={url}
          alt="Message attachment"
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-64 rounded-2xl border border-zinc-800 object-cover transition-opacity hover:opacity-80"
        />
      </button>
      {lightboxOpen && (
        <Lightbox url={url} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
