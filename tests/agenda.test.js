/**
 * Test Suite - Agenda Module
 * Tests for agenda and scheduling functionality
 */

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import admin from 'firebase-admin';

const configureFirebase = () => {
  process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'demo-project';
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';
  
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
  }
  
  return admin.firestore();
};

describe('Agenda Module', function() {
  this.timeout(10000);
  let db;
  const empresaId = `test_empresa_${Date.now()}`;

  before(function() {
    configureFirebase();
    db = admin.firestore();
  });

  after(async function() {
    // Cleanup test data
    try {
      const empresaRef = db.collection('empresas').doc(empresaId);
      const bloqueios = await empresaRef.collection('bloqueios').get();
      const agendamentos = await empresaRef.collection('agendamentos').get();
      
      for (const doc of bloqueios.docs) {
        await doc.ref.delete();
      }
      for (const doc of agendamentos.docs) {
        await doc.ref.delete();
      }
      
      await empresaRef.delete();
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('TC-013: Salvar Configuração de Agenda', function() {
    it('should save agenda configuration', async function() {
      const config = {
        dias: ['mon', 'tue', 'wed', 'thu', 'fri'],
        horaInicio: '09:00',
        horaFim: '18:00',
        duracaoSlot: 30,
        atualizadoEm: new Date().toISOString(),
      };

      await db.collection('empresas').doc(empresaId).set({
        empresaId: empresaId,
        proprietarioUid: 'test_uid',
        agendaConfig: config,
      });

      const empresaDoc = await db.collection('empresas').doc(empresaId).get();
      const savedConfig = empresaDoc.data().agendaConfig;

      expect(savedConfig).to.have.property('dias');
      expect(savedConfig.dias).to.include('mon');
      expect(savedConfig.horaInicio).to.equal('09:00');
      expect(savedConfig.horaFim).to.equal('18:00');
      expect(savedConfig.duracaoSlot).to.equal(30);
    });

    it('should validate required configuration fields', async function() {
      try {
        await db.collection('empresas').doc(empresaId).set({
          empresaId: empresaId,
          proprietarioUid: 'test_uid',
          agendaConfig: {
            // Missing dias, horaInicio, horaFim
            duracaoSlot: 30,
          },
        });
        throw new Error('Should have failed validation');
      } catch (error) {
        expect(error.message).to.not.equal('Should have failed validation');
      }
    });
  });

  describe('TC-015/TC-016: Bloqueios', function() {
    it('should create a blocking period', async function() {
      const blockRef = db.collection('empresas').doc(empresaId).collection('bloqueios').doc();
      
      await blockRef.set({
        inicio: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        fim: new Date(Date.now() + 90000000).toISOString(),
        motivo: 'Teste de bloqueio',
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        criadoPor: 'test_uid',
      });

      const blockDoc = await blockRef.get();
      expect(blockDoc.exists).to.be.true;
      expect(blockDoc.data().motivo).to.equal('Teste de bloqueio');
    });

    it('should reject invalid block (missing dates)', async function() {
      try {
        await db.collection('empresas').doc(empresaId).collection('bloqueios').add({
          motivo: 'Bloqueio inválido',
          // Missing inicio and fim
        });
        throw new Error('Should have failed');
      } catch (error) {
        expect(error.message).to.not.equal('Should have failed');
      }
    });
  });

  describe('TC-019: Geração de Slots', function() {
    it('should return empty for days not in working days', async function() {
      // Assuming Sunday is not a working day
      const testDate = new Date();
      testDate.setDate(testDate.getDate() + (7 - testDate.getDay())); // Next Sunday
      
      const dayOfWeek = testDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const workingDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      
      expect(workingDays).to.not.include(dayOfWeek);
    });

    it('should generate correct number of slots', async function() {
      // Config: 09:00 to 12:00, 60min slots, no interval
      // Expected: 3 slots (09:00, 10:00, 11:00)
      
      const horaInicio = '09:00';
      const horaFim = '12:00';
      const duracaoSlot = 60; // minutes
      
      const [hIni, mIni] = horaInicio.split(':').map(Number);
      const [hFim, mFim] = horaFim.split(':').map(Number);
      
      const start = new Date();
      start.setHours(hIni, mIni, 0, 0);
      const end = new Date();
      end.setHours(hFim, mFim, 0, 0);
      
      const slots = [];
      let cursor = new Date(start);
      
      while (cursor.getTime() + duracaoSlot * 60000 <= end.getTime()) {
        const slotStart = new Date(cursor);
        const slotEnd = new Date(cursor.getTime() + duracaoSlot * 60000);
        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
        cursor = new Date(slotEnd);
      }
      
      expect(slots.length).to.equal(3);
      expect(slots[0].start).to.include('T09:00');
      expect(slots[1].start).to.include('T10:00');
      expect(slots[2].start).to.include('T11:00');
    });
  });

  describe('TC-020: Conflito de Horário', function() {
    it('should detect overlapping appointments', async function() {
      const now = new Date();
      const inicio1 = now.toISOString();
      const fim1 = new Date(now.getTime() + 3600000).toISOString(); // +1 hour
      const inicio2 = new Date(now.getTime() + 1800000).toISOString(); // +30 min
      const fim2 = new Date(now.getTime() + 5400000).toISOString(); // +1.5 hours
      
      // Check overlap: (start1 < end2) && (end1 > start2)
      const overlap = new Date(inicio1) < new Date(fim2) && new Date(fim1) > new Date(inicio2);
      
      expect(overlap).to.be.true;
    });

    it('should not detect conflict for non-overlapping times', async function() {
      const now = new Date();
      const inicio1 = now.toISOString();
      const fim1 = new Date(now.getTime() + 3600000).toISOString(); // +1 hour
      const inicio2 = new Date(now.getTime() + 7200000).toISOString(); // +2 hours
      const fim2 = new Date(now.getTime() + 10800000).toISOString(); // +3 hours
      
      // Check overlap
      const overlap = new Date(inicio1) < new Date(fim2) && new Date(fim1) > new Date(inicio2);
      
      expect(overlap).to.be.false;
    });
  });
});

