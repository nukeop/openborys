import type { PrismTheme } from 'prism-react-renderer';

// Tailwind palette values: zinc-300 text, zinc-500 comments, teal-300 keywords,
// amber-200 strings, sky-300 functions, orange-300 numbers, zinc-400 punctuation.
export const scriptTheme: PrismTheme = {
  plain: { color: 'oklch(87.1% 0.006 286.286)' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'oklch(55.2% 0.016 285.938)', fontStyle: 'italic' },
    },
    {
      types: ['keyword', 'builtin', 'class-name', 'boolean'],
      style: { color: 'oklch(85.5% 0.138 181.071)' },
    },
    {
      types: ['string', 'template-string', 'char', 'regex'],
      style: { color: 'oklch(92.4% 0.12 95.746)' },
    },
    {
      types: ['function', 'method'],
      style: { color: 'oklch(82.8% 0.111 230.318)' },
    },
    {
      types: ['number'],
      style: { color: 'oklch(83.7% 0.128 66.29)' },
    },
    {
      types: ['punctuation', 'operator'],
      style: { color: 'oklch(70.5% 0.015 286.067)' },
    },
  ],
};
