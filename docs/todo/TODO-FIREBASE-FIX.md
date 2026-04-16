# TODO: Firebase Config Fix for Vercel Static Deployment

## Completed ✅
- [x] Create standardized src/config.js (single source of truth)
- [x] Fix src/index.html module script
- [x] Update modules/firebase.js (Firebase v9+ factory)
- [x] Update modules/auth.js (remove legacy references)
- [x] Fix modules/monetization.js (use firebase.js imports)
- [x] Simplify scripts/build.sh
- [x] Deprecate scripts/inject-config.js
- [x] Update vercel.json with proper headers and rewrites
- [x] Sync public/ directory with build

## Summary of Changes

### 1. src/config.js
- Uses `import.meta.env.VITE_FIREBASE_*` as primary source
- Falls back to `window.APP_CONFIG.firebase` if env vars missing
- Clean named exports: `firebaseConfig`, `firebaseConfigValid`, `firebaseDemoMode`
- Simple validation: required fields must exist and be non-empty strings

### 2. src/index.html
- Imports config from `./config.js` only
- Initializes Firebase only if `firebaseConfigValid === true`
- Shows appropriate UI for demo mode or missing config
- No `window.APP_CONFIG` direct access

### 3. modules/firebase.js
- Centralized Firebase instance factory
- Uses `window.firebaseApp` from index.html initialization
- Re-exports all needed Firestore and Auth functions

### 4. modules/auth.js
- Imports from `./firebase.js` factory
- No `window.firebase` references
- Clean Firebase v9+ modular imports

### 5. scripts/build.sh
- Simple copy from src/ to public/
- No config injection needed

### 6. vercel.json
- Proper SPA rewrites to /index.html
- Security headers
- Cache headers for assets

## Vercel Deployment Setup
1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add:
   - VITE_FIREBASE_API_KEY
   - VITE_FIREBASE_AUTH_DOMAIN
   - VITE_FIREBASE_PROJECT_ID
   - VITE_FIREBASE_STORAGE_BUCKET
   - VITE_FIREBASE_MESSAGING_SENDER_ID
   - VITE_FIREBASE_APP_ID
3. Redeploy

