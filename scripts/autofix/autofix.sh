#!/usr/bin/env bash
# autofix-runner.sh
# Boots the clean project, and on each ERR_MODULE_NOT_FOUND copies the
# missing file from the parallel source project. Exits when:
#   - program starts cleanly        (exit 0)
#   - failure is not a missing file (exit 1)
#   - no source file found to copy  (exit 1)

set -uo pipefail   # no -e: we need to catch non-zero from the CMD ourselves

CLEAN_ROOT="/mnt/24T/ABSTRACT_ENDEAVORS/scripts/RABBIT/aggregator_clean"
SOURCE_ROOT="/mnt/24T/ABSTRACT_ENDEAVORS/scripts/RABBIT/aggregator"

# ── Entry point lives in the CLEAN project ──────────────────────────────────
CMD=("npx" "tsx" "$CLEAN_ROOT/clients/main-cli.ts")

cd "$CLEAN_ROOT"
echo "▶ autofix runner  clean=$CLEAN_ROOT"
echo "▶ source mirror   src=$SOURCE_ROOT"
echo

while true; do
  OUT="$(mktemp)"

  if "${CMD[@]}" >"$OUT" 2>&1; then
    echo "✅ program started successfully"
    rm -f "$OUT"
    exit 0
  fi

  # ── Not a missing-module error → bail ─────────────────────────────────────
  if ! grep -q "ERR_MODULE_NOT_FOUND" "$OUT"; then
    cat "$OUT"
    echo
    echo "❌ failed for non-module reason — stopping"
    rm -f "$OUT"
    exit 1
  fi

  # ── Collect ALL missing module paths from this run ────────────────────────
  # Node prints:  Cannot find module '/abs/path/to/file.js'
  # We grab the absolute path inside the quotes.
  mapfile -t MISSING_PATHS < <(
    grep -oE "Cannot find module '[^']+'" "$OUT" \
    | sed "s/Cannot find module '//;s/'//" \
    | sort -u
  )

  rm -f "$OUT"

  if [[ ${#MISSING_PATHS[@]} -eq 0 ]]; then
    echo "❌ ERR_MODULE_NOT_FOUND but could not extract any module path"
    exit 1
  fi

  # ── Copy each missing file ─────────────────────────────────────────────────
  for MISSING in "${MISSING_PATHS[@]}"; do

    # Strip clean root prefix to get the relative path
    REL="${MISSING#$CLEAN_ROOT/}"

    DEST="$CLEAN_ROOT/$REL"
    SRC="$SOURCE_ROOT/$REL"

    echo "⚠️  missing: $REL"
    mkdir -p "$(dirname "$DEST")"

    # 1. Exact match
    if [[ -f "$SRC" ]]; then
      cp "$SRC" "$DEST"
      echo "   ✅ copied: $REL"
      continue
    fi

    # 2. .js requested → .ts exists upstream (tsx resolves .js→.ts at runtime)
    #    Write the file as .ts — never coerce the extension to .js
    if [[ "$SRC" == *.js ]]; then
      TS_SRC="${SRC%.js}.ts"
      TS_DEST="${DEST%.js}.ts"
      if [[ -f "$TS_SRC" ]]; then
        cp "$TS_SRC" "$TS_DEST"
        echo "   🧩 copied as .ts: ${TS_SRC#$SOURCE_ROOT/} → ${TS_DEST#$CLEAN_ROOT/}"
        continue
      fi
    fi

    # 3. Same filename, same directory, any extension
    BASENAME="$(basename "${SRC%.js}")"
    SRC_DIR="$(dirname "$SRC")"
    mapfile -t FOUND < <(find "$SRC_DIR" -maxdepth 1 -type f \( -name "${BASENAME}.ts" -o -name "${BASENAME}.js" -o -name "${BASENAME}.tsx" \) 2>/dev/null)

    if [[ ${#FOUND[@]} -eq 1 ]]; then
      EXT="${FOUND[0]##*.}"
      FOUND_DEST="${DEST%.*}.${EXT}"
      mkdir -p "$(dirname "$FOUND_DEST")"
      cp "${FOUND[0]}" "$FOUND_DEST"
      echo "   🔍 found by name: ${FOUND[0]#$SOURCE_ROOT/} → ${FOUND_DEST#$CLEAN_ROOT/}"
      continue
    elif [[ ${#FOUND[@]} -gt 1 ]]; then
      echo "   ⚠️  multiple matches for '$BASENAME' — cannot auto-resolve:"
      for F in "${FOUND[@]}"; do echo "      $F"; done
      exit 1
    fi

    # 4. Truly not found → unrecoverable
    echo "   ❌ no source file found"
    echo "      wanted:     $SRC"
    echo "      also tried: ${SRC%.js}.ts"
    exit 1

  done

  echo
done
