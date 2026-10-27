import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';

// How close to the bottom still counts as "at the bottom", in pixels.
const BOTTOM_THRESHOLD_PX = 24;

/**
 * Keeps a scroll container pinned to its newest content. It starts at the
 * bottom and stays there when `content` changes or the content element grows
 * (for example when images load), unless the reader has scrolled up.
 */
export function useStickToBottom(
  scrollRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  content: unknown,
) {
  const isPinned = useRef(true);
  // Where our own last scroll landed, to tell it apart from the reader's.
  const programmaticTop = useRef<number | undefined>(undefined);

  const pin = useRef(() => {
    const scroller = scrollRef.current;
    if (!scroller || !isPinned.current) {
      return;
    }
    scroller.scrollTop = scroller.scrollHeight;
    programmaticTop.current = scroller.scrollTop;
  }).current;

  // Pin before paint, so new messages never flash at the wrong position.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-pin whenever the content changes
  useLayoutEffect(pin, [content]);

  useEffect(() => {
    const scroller = scrollRef.current;
    const contentElement = contentRef.current;
    if (!scroller || !contentElement) {
      return;
    }

    const handleScroll = () => {
      // The event for our own scroll can arrive after more content has
      // loaded, so its distance from the bottom says nothing about the reader.
      if (scroller.scrollTop === programmaticTop.current) {
        return;
      }
      programmaticTop.current = undefined;
      const distanceFromBottom =
        scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      isPinned.current = distanceFromBottom <= BOTTOM_THRESHOLD_PX;
    };

    const resizeObserver = new ResizeObserver(pin);
    scroller.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver.observe(contentElement);

    return () => {
      scroller.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [scrollRef, contentRef, pin]);
}
