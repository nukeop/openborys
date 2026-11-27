import { Highlight } from 'prism-react-renderer';
import { scriptTheme } from './script-theme';

export function ScriptCode({ code }: { code: string }) {
  return (
    <Highlight code={code} language="typescript" theme={scriptTheme}>
      {({ tokens, getLineProps, getTokenProps }) => (
        <pre className="overflow-x-auto rounded-md bg-zinc-950 py-3 text-xs leading-5">
          <code className="grid min-w-max">
            {tokens.map((line, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: lines of a fixed text
                key={index}
                {...getLineProps({ line, className: 'flex pr-4' })}
              >
                <span className="w-10 shrink-0 select-none pr-4 text-right text-zinc-600 tabular-nums">
                  {index + 1}
                </span>
                <span>
                  {line.map((token, tokenIndex) => (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: tokens of a fixed line
                      key={tokenIndex}
                      {...getTokenProps({ token })}
                    />
                  ))}
                </span>
              </span>
            ))}
          </code>
        </pre>
      )}
    </Highlight>
  );
}
