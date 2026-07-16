#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <bot>" >&2
  exit 1
fi

bot="$1"
bot_env=".env.$bot"

for f in .env.shared "$bot_env"; do
  if [[ ! -f "$f" ]]; then
    echo "missing $f" >&2
    exit 1
  fi
done

grep -hvE '^\s*(#|$)' .env.shared "$bot_env" | fly secrets import -a "openborys-$bot"
