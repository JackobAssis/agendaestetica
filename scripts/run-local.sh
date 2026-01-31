#!/usr/bin/env bash
set -euo pipefail

# Simple local server to serve `src/` for manual testing
# Usage: ./scripts/run-local.sh [port]
PORT=${1:-8080}
ROOT_DIR="src"

echo "Serving ${ROOT_DIR} at http://localhost:${PORT}"
if command -v python3 >/dev/null 2>&1; then
  (cd "$ROOT_DIR" && python3 -m http.server "$PORT")
elif command -v python >/dev/null 2>&1; then
  (cd "$ROOT_DIR" && python -m SimpleHTTPServer "$PORT")
else
  echo "Python is required to run this script" >&2
  exit 1
fi
