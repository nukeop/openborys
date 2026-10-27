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
        className="block max-w-full cursor-zoom-in rounded-[18px] focus-visible:outline-2 focus-visible:outline-teal-400 focus-visible:outline-offset-2"
      >
        <img
          src={url}
          alt="Message attachment"
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-64 max-w-full rounded-[18px] object-cover transition-opacity hover:opacity-80"
        />
      </button>
      {lightboxOpen && (
        <Lightbox url={url} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
