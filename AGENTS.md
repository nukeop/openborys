# AGENTS.md

Instructions for any AI agent (Claude, Codex, Cursor, etc.) working in this repository.

## Primary, super important rules

These rules override anything else. Do not break them.

1. **NEVER, EVER add yourself as a co-author, or anywhere in the commits. NEVER.**
   - No `Co-authored-by:` trailer.
   - No "Generated with ..." footer.
   - No mention of the agent, the model, or the tool in the commit message, body, or trailers.
   - The commit author and committer must be the human user, untouched.

2. **PLAIN TEXT, PLAIN LANGUAGE COMMITS ONLY.**
   - No Conventional Commits prefixes: no `fix:`, `feat:`, `chore:`, `refactor:`, `docs:`, `test:`, `ci:`, `build:`, `perf:`, `style:`, etc.
   - No scopes, no emojis, no tags.
   - Just a few words describing what you did, in plain English.
   - Examples of acceptable messages:
     - `add login form`
     - `remove unused helper`
     - `update readme`
     - `handle empty input in parser`
   - Examples of forbidden messages:
     - `feat: add login form`
     - `chore(deps): bump lodash`
     - `fix: handle empty input in parser`
