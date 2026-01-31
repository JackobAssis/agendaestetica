#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/deploy-firebase.sh <FIREBASE_PROJECT_ID>
PROJECT_ID=${1:-}
if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <FIREBASE_PROJECT_ID>" >&2
  exit 2
fi

echo "Deploying Firestore rules to project: $PROJECT_ID"
firebase deploy --only firestore:rules --project "$PROJECT_ID"

echo "Installing functions dependencies and deploying Cloud Function..."
pushd functions >/dev/null
npm install --no-audit --no-fund
firebase deploy --only functions:confirmAgendamento --project "$PROJECT_ID"
popd >/dev/null

echo "Deploy complete."
