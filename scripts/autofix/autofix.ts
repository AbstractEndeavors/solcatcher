#!/usr/bin/env bash
set -euo pipefail

CLEAN_ROOT="/mnt/24T/ABSTRACT_ENDEAVORS/scripts/RABBIT/aggregator_clean"
SOURCE_ROOT="/mnt/24T/ABSTRACT_ENDEAVORS/scripts/RABBIT/aggregator"
CMD=("npx" "tsx" "clients/main-cli.ts")

cd "$CLEAN_ROOT"

echo "▶ starting autofix runner in $CLEAN_ROOT"
echo

while true; do
  OUTPUT="$(mktemp)"

  if "${CMD[@]}" >"$OUTPUT" 2>&1; then
    echo "✅ program exited cleanly"
    rm -f "$OUTPUT"
    exit 0
  fi

  if ! grep -q "ERR_MODULE_NOT_FOUND" "$OUTPUT"; then
    cat "$OUTPUT"
    echo "❌ failed for non-module reason"
    exit 1
  fi

  MISSING="$(grep -oE "Cannot find module '([^']+)'" "$OUTPUT" | sed "s/.*'//;s/'//")"

  if [[ -z "$MISSING" ]]; then
    cat "$OUTPUT"
    echo "❌ could not extract missing module path"
    exit 1
  fi

  REL_PATH="${MISSING#$CLEAN_ROOT/}"
  SRC_FILE="$SOURCE_ROOT/$REL_PATH"
  DEST_FILE="$CLEAN_ROOT/$REL_PATH"

  echo "⚠️  missing: $REL_PATH"

  if [[ ! -f "$SRC_FILE" ]]; then
    echo "❌ source file not found either:"
    echo "   $SRC_FILE"
    exit 1
  fi

  mkdir -p "$(dirname "$DEST_FILE")"
  cp "$SRC_FILE" "$DEST_FILE"

  echo "✅ copied from source:"
  echo "   $SRC_FILE"
  echo "→  $DEST_FILE"
  echo
  rm -f "$OUTPUT"
done
