# TODO - Fix Vercel 404 and Firebase v9 SDK Issues

## Issues Being Fixed:
1. Vercel 404 errors due to `cleanUrls: true` conflict
2. Missing favicon.ico
3. Firebase v9 modular SDK incompatibility in auth.js

## Tasks:

### Task 1: Fix vercel.json
- [ ] Remove `cleanUrls: true` to fix SPA routing
- [ ] Keep rewrites for client-side routing

### Task 2: Create favicon
- [ ] Create `public/favicon.ico` placeholder file

### Task 3: Fix Firebase v9 Modular SDK in auth.js (src/)
- [ ] Import Firebase functions directly from CDN
- [ ] Use `getAuth()` to get auth instance
- [ ] Use `createUserWithEmailAndPassword(auth, email, password)`
- [ ] Fix all other auth functions to use v9 syntax

### Task 4: Fix Firebase v9 Modular SDK in auth.js (public/)
- [ ] Apply same fixes to public/modules/auth.js

### Task 5: Rebuild project
- [ ] Run `./scripts/build.sh` to regenerate public folder

### Task 6: Deploy to Vercel
- [ ] Push changes to trigger redeploy

## Files to Modify:
- `vercel.json`
- `public/favicon.ico` (new)
- `src/modules/auth.js`
- `public/modules/auth.js`

