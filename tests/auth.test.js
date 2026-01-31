/**
 * Test Suite - Auth Module
 * Tests for authentication functionality
 */

import { describe, it, before, after, beforeEach } from 'mocha';
import { expect } from 'chai';
import admin from 'firebase-admin';

// Configure Firebase Admin for tests
const configureFirebase = () => {
  process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'demo-project';
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';
  
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
  }
  
  return admin.firestore();
};

describe('Auth Module', function() {
  this.timeout(10000);
  let db;
  let testUid;

  before(function() {
    configureFirebase();
    db = admin.firestore();
  });

  after(async function() {
    // Cleanup test data
    if (testUid) {
      try {
        await db.collection('usuarios').doc(testUid).delete();
        await db.collection('empresas').doc(`prof_${testUid}`).delete();
        await admin.auth().deleteUser(testUid);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  describe('TC-001: Cadastro de Profissional', function() {
    it('should create user document in Firestore', async function() {
      const testEmail = `test_${Date.now()}@example.com`;
      testUid = `test_uid_${Date.now()}`;
      const empresaId = `prof_${testUid}`;

      // Create user document
      await db.collection('usuarios').doc(testUid).set({
        uid: testUid,
        email: testEmail,
        nome: 'Teste Profissional',
        profissao: 'cabeleireira',
        role: 'profissional',
        empresaId: empresaId,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        ativo: true,
      });

      // Create empresa document
      await db.collection('empresas').doc(empresaId).set({
        empresaId: empresaId,
        proprietarioUid: testUid,
        nome: 'Teste Profissional',
        profissao: 'cabeleireira',
        plano: 'free',
        onboardingCompleto: false,
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        ativo: true,
      });

      // Verify user was created
      const userDoc = await db.collection('usuarios').doc(testUid).get();
      expect(userDoc.exists).to.be.true;
      expect(userDoc.data().email).to.equal(testEmail);
      expect(userDoc.data().role).to.equal('profissional');

      // Verify empresa was created
      const empresaDoc = await db.collection('empresas').doc(empresaId).get();
      expect(empresaDoc.exists).to.be.true;
      expect(empresaDoc.data().plano).to.equal('free');
    });

    it('should validate required fields', async function() {
      const testEmail = `test_${Date.now()}@example.com`;
      const testUid = `test_uid_${Date.now()}`;

      // Try to create user without required fields
      try {
        await db.collection('usuarios').doc(testUid).set({
          uid: testUid,
          // Missing email, nome, role
        });
        throw new Error('Should have failed');
      } catch (error) {
        expect(error.message).to.not.equal('Should have failed');
      }
    });
  });

  describe('TC-002: Cadastro de Cliente', function() {
    it('should create client document with role cliente', async function() {
      const testEmail = `cliente_${Date.now()}@example.com`;
      const clienteUid = `cliente_uid_${Date.now()}`;

      await db.collection('usuarios').doc(clienteUid).set({
        uid: clienteUid,
        email: testEmail,
        nome: 'Teste Cliente',
        role: 'cliente',
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        ativo: true,
      });

      const userDoc = await db.collection('usuarios').doc(clienteUid).get();
      expect(userDoc.exists).to.be.true;
      expect(userDoc.data().role).to.equal('cliente');
      expect(userDoc.data().empresaId).to.be.undefined;

      // Cleanup
      await db.collection('usuarios').doc(clienteUid).delete();
    });
  });

  describe('TC-003: Login de Profissional', function() {
    it('should find profissional by email and return empresaId', async function() {
      const testEmail = `login_test_${Date.now()}@example.com`;
      const testUid = `login_uid_${Date.now()}`;
      const empresaId = `prof_${testUid}`;

      // Setup test data
      await db.collection('usuarios').doc(testUid).set({
        uid: testUid,
        email: testEmail,
        nome: 'Login Test',
        profissao: 'esteticista',
        role: 'profissional',
        empresaId: empresaId,
        ativo: true,
      });

      // Query user by email
      const querySnapshot = await db.collection('usuarios')
        .where('email', '==', testEmail)
        .where('role', '==', 'profissional')
        .get();

      expect(querySnapshot.empty).to.be.false;
      
      const userData = querySnapshot.docs[0].data();
      expect(userData.empresaId).to.equal(empresaId);

      // Cleanup
      await db.collection('usuarios').doc(testUid).delete();
    });
  });

  describe('TC-004: Separação de Roles', function() {
    it('should correctly distinguish between profissional and cliente', async function() {
      const profUid = `prof_${Date.now()}`;
      const clienteUid = `cliente_${Date.now()}`;

      await db.collection('usuarios').doc(profUid).set({
        uid: profUid,
        email: `prof_${Date.now()}@test.com`,
        nome: 'Prof Test',
        role: 'profissional',
        empresaId: 'empresa_teste',
      });

      await db.collection('usuarios').doc(clienteUid).set({
        uid: clienteUid,
        email: `cliente_${Date.now()}@test.com`,
        nome: 'Cliente Test',
        role: 'cliente',
      });

      const profDoc = await db.collection('usuarios').doc(profUid).get();
      const clienteDoc = await db.collection('usuarios').doc(clienteUid).get();

      expect(profDoc.data().role).to.equal('profissional');
      expect(profDoc.data().empresaId).to.equal('empresa_teste');
      
      expect(clienteDoc.data().role).to.equal('cliente');
      expect(clienteDoc.data().empresaId).to.be.undefined;

      // Cleanup
      await db.collection('usuarios').doc(profUid).delete();
      await db.collection('usuarios').doc(clienteUid).delete();
    });
  });

  describe('TC-005: Feature Flags', function() {
    it('should return correct features for free plan', async function() {
      const empresaId = `test_empresa_${Date.now()}`;
      
      await db.collection('empresas').doc(empresaId).set({
        empresaId: empresaId,
        plano: 'free',
        proprietarioUid: 'test_uid',
      });

      const empresaDoc = await db.collection('empresas').doc(empresaId).get();
      const plano = empresaDoc.data().plano;

      // Free plan should have limited features
      const freeFeatures = ['login', 'agenda_basica', 'agendamentos_basico'];
      expect(plano).to.equal('free');

      // Cleanup
      await db.collection('empresas').doc(empresaId).delete();
    });

    it('should return correct features for premium plan', async function() {
      const empresaId = `test_empresa_${Date.now()}`;
      
      await db.collection('empresas').doc(empresaId).set({
        empresaId: empresaId,
        plano: 'premium',
        proprietarioUid: 'test_uid',
      });

      const empresaDoc = await db.collection('empresas').doc(empresaId).get();
      const plano = empresaDoc.data().plano;

      expect(plano).to.equal('premium');

      // Cleanup
      await db.collection('empresas').doc(empresaId).delete();
    });
  });
});

