import admin from 'firebase-admin';
import { expect } from 'chai';

describe('Emulator sanity', function(){
  before(function(){
    process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'demo-project';
    process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
    process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
    admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
  });

  it('writes and reads a document in Firestore emulator', async function(){
    const db = admin.firestore();
    const ref = db.collection('test_emulator').doc('sanity');
    await ref.set({ ok: true, ts: admin.firestore.FieldValue.serverTimestamp() });
    const snap = await ref.get();
    const data = snap.data();
    expect(data).to.have.property('ok', true);
  });
});
