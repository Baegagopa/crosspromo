#!/usr/bin/env sh
set -eu

mode="${1:-tracked}"
repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"

private_patterns='^(CrossPromoTools/|incoming/|tooling/|local/|crosspromo\.json$|.*\.(bat|ps1|psm1|exe|dll|pdb|config\.user|log|tmp|bak|cache)$|(.*/)?(Thumbs\.db|Desktop\.ini)$)'

case "$mode" in
  tracked)
    candidates=$(git ls-files)
    ;;
  *)
    printf '%s
' "Unsupported mode: $mode" >&2
    exit 2
    ;;
esac

if ! command -v grep >/dev/null 2>&1; then
  printf '%s
' 'ERROR: grep is required for private path checks.' >&2
  exit 2
fi

set +e
matches=$(printf '%s
' "$candidates" | grep -Ei "$private_patterns")
grep_status=$?
set -e

if [ "$grep_status" -gt 1 ]; then
  printf '%s
' 'ERROR: private path check failed while scanning tracked files.' >&2
  exit 2
fi

if [ -n "$matches" ]; then
  printf '%s
' 'ERROR: private/local paths are selected for public Git tracking.' >&2
  printf '%s
' 'The public repo must not track CrossPromoTools/, local staging/tooling folders, root automation scripts, temp/log/cache artifacts, or OS noise.' >&2
  printf '%s
' 'Offending paths:' >&2
  printf '%s
' "$matches" >&2
  exit 1
fi