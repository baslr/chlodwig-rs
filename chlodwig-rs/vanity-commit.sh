#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./vanity-commit.sh                     # vanity-hash current HEAD
#   ./vanity-commit.sh <hex-prefix>        # vanity-hash with custom prefix
#   ./vanity-commit.sh -m "msg"            # commit first, then vanity-hash
#   ./vanity-commit.sh -m "msg" <prefix>   # commit first, then vanity-hash with custom prefix
#
# If no -m is given, the current HEAD commit is used as-is.

PREFIX="133731173"
MESSAGE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -m)
            MESSAGE="$2"
            shift 2
            ;;
        *)
            PREFIX="$1"
            shift
            ;;
    esac
done

if [[ -n "$MESSAGE" ]]; then
    echo "📝 Committing..."
    git commit -m "$MESSAGE"
    echo ""
fi

# Verify there's a HEAD commit to work with
if ! git rev-parse HEAD &>/dev/null; then
    echo "❌ No HEAD commit found. Commit first or use -m."
    exit 1
fi

echo "📋 Current HEAD: $(git log --oneline -1)"
echo ""
echo "🔨 Computing vanity hash (prefix: $PREFIX)..."
cargo run --release --bin git-vanity -- "$PREFIX"
