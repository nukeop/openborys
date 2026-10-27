import clsx from 'clsx';

/**
 * The hook at the bottom corner of the last bubble in a group. Drawn for the
 * right side and mirrored for the left. Takes its fill from the text color
 * in `className`, which must match the bubble background.
 */
export function BubbleTail({
  side,
  className,
}: {
  side: 'left' | 'right';
  className: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 18"
      className={clsx(
        'absolute bottom-0 h-[18px] w-3 fill-current',
        {
          '-right-[5px]': side === 'right',
          '-left-[5px] -scale-x-100': side === 'left',
        },
        className,
      )}
    >
      <path d="M0 0H5V8C5 13.5 7.5 16.5 12 18C6.5 18.6 2.6 17 0 14Z" />
    </svg>
  );
}
