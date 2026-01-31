#!/usr/bin/env bash
set -euo pipefail

# Run tests against the Firebase Emulator. Assumes emulators are running.

export FIRESTORE_EMULATOR_HOST=localhost:8080
export FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
export GCLOUD_PROJECT=demo-project

echo "Running emulator tests (mocha)"
npm run emulators:test
