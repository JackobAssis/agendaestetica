#!/usr/bin/env bash
set -euo pipefail

# Starts the Firebase Emulator Suite (Firestore, Auth, Functions).
# Usage: ./scripts/start-emulators.sh

echo "Starting Firebase Emulators (Firestore:8080, Auth:9099, Functions:5001)"
firebase emulators:start --only firestore,auth,functions --project demo-project
