#!/usr/bin/env sh
# Guards bloomrows/version.json — the Bloom Rows app's store update notice reads it
# (latest / minimum version). Deleting it or breaking it must never reach the site unnoticed:
# a missing or unreadable file keeps every phone on its last answer, and a wrong "minimum"
# stops every player below it.
#
# Modes:
#   index     pre-commit: the staged file — skipped when the commit does not touch it
#   push      pre-push: every commit being pushed (refs on stdin), deletions of refs skipped
#   worktree  CI after checkout
#
# The format accepted here is deliberately stricter than the app's parser (AppUpdateRules.TryParseVersion
# also reads "1.0.0-dev", "1.4.2 (12)" or "2"): the site file uses plain dotted numbers only, 2-4 parts,
# each part within Int32 (System.Version rejects larger ones).
set -eu

mode="${1:-worktree}"
repo_root=$(git rev-parse --show-toplevel)
cd "$repo_root"
path='bloomrows/version.json'

find_python() {
  for candidate in python3 python py; do
    if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import json' >/dev/null 2>&1; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

validate() { # $1 = label, stdin = file content
  py=$(find_python) || { echo "ERROR: python is required to validate $path ($1)." >&2; exit 2; }
  "$py" -c '
import json, re, sys
label = sys.argv[1]
try:
    data = json.loads(sys.stdin.read())
except Exception as e:
    sys.exit("ERROR: bloomrows/version.json (%s) is not valid JSON: %s" % (label, e))
if not isinstance(data, dict) or not isinstance(data.get("android"), dict):
    sys.exit("ERROR: bloomrows/version.json (%s) needs an \"android\" object." % label)
ver = re.compile(r"^\d+(\.\d+){1,3}$")
def parts(v):
    p = [int(x) for x in v.split(".")]
    return p + [0] * (4 - len(p))
for platform, target in data.items():
    if not isinstance(target, dict):
        sys.exit("ERROR: \"%s\" must be an object (%s)." % (platform, label))
    for key in ("latest", "minimum"):
        value = target.get(key)
        if not isinstance(value, str) or not ver.match(value):
            sys.exit("ERROR: %s.%s must be plain numbers like 1.0.0 (got %r) (%s)." % (platform, key, value, label))
        if any(int(x) > 2147483647 for x in value.split(".")):
            sys.exit("ERROR: %s.%s has a part above 2147483647 (%s)." % (platform, key, label))
    if parts(target["minimum"]) > parts(target["latest"]):
        sys.exit("ERROR: %s.minimum (%s) is above latest (%s) (%s)." % (platform, target["minimum"], target["latest"], label))
print("bloomrows/version.json OK (%s): " % label + ", ".join("%s latest %s minimum %s" % (k, v["latest"], v["minimum"]) for k, v in data.items()))
' "$1"
}

case "$mode" in
  index)
    if ! git diff --cached --name-only --no-renames | grep -Fqx "$path"; then
      exit 0 # this commit does not touch the file
    fi
    content=$(git show ":$path" 2>/dev/null) || { echo "ERROR: $path is deleted in this commit. It must always exist." >&2; exit 1; }
    printf '%s' "$content" | validate "staged"
    ;;
  push)
    zero='0000000000000000000000000000000000000000'
    status=0
    while read -r local_ref local_sha remote_ref remote_sha; do
      [ -n "${local_sha:-}" ] || continue
      [ "$local_sha" = "$zero" ] && continue # deleting a remote ref
      if ! content=$(git show "$local_sha:$path" 2>/dev/null); then
        echo "ERROR: $path is missing in $local_ref ($local_sha) being pushed to $remote_ref. It must always exist." >&2
        status=1
        continue
      fi
      printf '%s' "$content" | validate "$local_ref" || status=1
    done
    exit "$status"
    ;;
  worktree)
    [ -f "$path" ] || { echo "ERROR: $path is missing. It must always exist." >&2; exit 1; }
    validate "worktree" < "$path"
    ;;
  *) echo "Unsupported mode: $mode" >&2; exit 2 ;;
esac
