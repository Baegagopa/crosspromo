#!/usr/bin/env sh
# Guards bloomrows/version.json — the Bloom Rows app's store update notice reads it
# (latest / minimum version). Deleting it or breaking it must never reach the site unnoticed:
# a missing or unreadable file keeps every phone on its last answer, and a wrong "minimum"
# stops every player below it. Modes: index (pre-commit: the staged file), head (pre-push),
# worktree (CI after checkout).
set -eu

mode="${1:-worktree}"
repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"
path='bloomrows/version.json'

case "$mode" in
  index)    content=$(git show ":$path" 2>/dev/null) || { echo "ERROR: $path is missing from the commit (staged deletion?). It must always exist." >&2; exit 1; } ;;
  head)     content=$(git show "HEAD:$path" 2>/dev/null) || { echo "ERROR: $path is missing from HEAD. It must always exist." >&2; exit 1; } ;;
  worktree) [ -f "$path" ] || { echo "ERROR: $path is missing. It must always exist." >&2; exit 1; }; content=$(cat "$path") ;;
  *) echo "Unsupported mode: $mode" >&2; exit 2 ;;
esac

py=$(command -v python3 || command -v python || true)
if [ -z "$py" ]; then
  echo "ERROR: python is required to validate $path." >&2
  exit 2
fi

printf '%s' "$content" | "$py" -c '
import json, re, sys
try:
    data = json.loads(sys.stdin.read())
except Exception as e:
    sys.exit("ERROR: bloomrows/version.json is not valid JSON: %s" % e)
if not isinstance(data, dict) or not isinstance(data.get("android"), dict):
    sys.exit("ERROR: bloomrows/version.json needs an \"android\" object.")
ver = re.compile(r"^\d+(\.\d+){1,3}$")
def parts(v):
    p = [int(x) for x in v.split(".")]
    return p + [0] * (4 - len(p))
for platform, target in data.items():
    if not isinstance(target, dict):
        sys.exit("ERROR: \"%s\" must be an object." % platform)
    for key in ("latest", "minimum"):
        value = target.get(key)
        if not isinstance(value, str) or not ver.match(value):
            sys.exit("ERROR: %s.%s must be a version like 1.0.0 (got %r)." % (platform, key, value))
    if parts(target["minimum"]) > parts(target["latest"]):
        sys.exit("ERROR: %s.minimum (%s) is above latest (%s)." % (platform, target["minimum"], target["latest"]))
print("bloomrows/version.json OK: " + ", ".join("%s latest %s minimum %s" % (k, v["latest"], v["minimum"]) for k, v in data.items()))
'
