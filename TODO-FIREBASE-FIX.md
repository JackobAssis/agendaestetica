# Firebase Vercel Bug Fix Plan

## Summary
Fix Firebase initialization and auth issues for production deployment on Vercel.

## Issues Identified
1. Config validation mismatch between config.js and index.html
2. No single shared validation logic
3. Auth module using incorrect v9+ modular patterns
4. Potential window.firebase usage instead of factory functions

## Files to Modify

### 1. config.js - Single Source of Truth
- [x] Export config object
- [x] Export isDemoMode flag
- [x] Export isConfigValid function
- [x] Check only required fields (apiKey, authDomain, projectId, appId)
- [x] Demo mode activates only when config missing/invalid

### 2. index.html - Firebase Initialization
- [x] Import validation from config.js
- [x] Use config.isConfigValid() for validation
- [x] Initialize Firebase only when config is valid
- [x] Use getAuth(getApp()) and getFirestore(getApp())
- [x] Set window.firebaseApp for auth module

### 3. auth.js - Proper v9+ Modular SDK
- [x] Import getAuth, getFirestore from firebase
- [x] Use factory functions to get instances
- [x] Remove window.firebase usage
- [x] Remove duplicate code

## Implementation Order
1. Fix config.js (foundation)
2. Fix index.html (uses config.js)
3. Fix auth.js (uses window.firebaseApp)

## Validation
- No syntax errors in module scripts
- Firebase initializes only with valid config
- Demo mode works when config missing
- Auth functions work correctly

