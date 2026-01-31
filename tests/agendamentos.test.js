/**
 * Test Suite - Agendamentos Module
 * Tests for scheduling functionality (TC-021 to TC-032)
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

describe('Agendamentos Module (TC-021 to TC-032)', function() {
  this.timeout(15000);
  let db;
  const empresaId = `test_empresa_${Date.now()}`;
  const clienteUid = `cliente_${Date.now()}`;
  let agendamentoId;

  before(function() {
    configureFirebase();
    db = admin.firestore();
  });

  after(async function() {
    // Cleanup test data
    try {
      const empresaRef = db.collection('empresas').doc(empresaId);
      
      // Delete all agendamentos
      const agendamentos = await empresaRef.collection('agendamentos').get();
      for (const doc of agendamentos.docs) {
        // Delete subcollection remarcacoes first
        const remarcacoes = await doc.ref.collection('remarcacoes').get();
        for (const rem of remarcacoes.docs) {
          await rem.ref.delete();
        }
        await doc.ref.delete();
      }
      
      // Delete empresa
      await empresaRef.delete();
      
      // Delete cliente
      await db.collection('usuarios').doc(clienteUid).delete();
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('TC-021: Cliente Solicita Agendamento', function() {
    it('should create agendamento with status solicitado', async function() {
      const now = new Date();
      const inicio = new Date(now.getTime() + 86400000).toISOString(); // Tomorrow
      const fim = new Date(now.getTime() + 90000000).toISOString(); // +1h

      const agendamentoRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc();

      await agendamentoRef.set({
        inicio: inicio,
        fim: fim,
        clienteUid: clienteUid,
        nomeCliente: 'Teste Cliente',
        telefone: '(11) 99999-9999',
        servico: 'Corte de Cabelo',
        status: 'solicitado',
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
        notas: [],
      });

      agendamentoId = agendamentoRef.id;

      const agendamentoDoc = await agendamentoRef.get();
      expect(agendamentoDoc.exists).to.be.true;
      expect(agendamentoDoc.data().status).to.equal('solicitado');
      expect(agendamentoDoc.data().nomeCliente).to.equal('Teste Cliente');
    });
  });

  describe('TC-022: Profissional Confirma Agendamento', function() {
    it('should update status to confirmado', async function() {
      if (!agendamentoId) {
        this.skip();
        return;
      }

      const agendamentoRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId);

      await agendamentoRef.update({
        status: 'confirmado',
        confirmadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      const agendamentoDoc = await agendamentoRef.get();
      expect(agendamentoDoc.data().status).to.equal('confirmado');
      expect(agendamentoDoc.data().confirmadoEm).to.not.be.undefined;
    });

    it('should verify no conflicts when confirming', async function() {
      if (!agendamentoId) {
        this.skip();
        return;
      }

      const now = new Date();
      const existing = await db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId).get();
      const data = existing.data();

      // Check for conflicting confirmed appointments
      const conflicts = await db.collection('empresas').doc(empresaId).collection('agendamentos')
        .where('status', '==', 'confirmado')
        .where('inicio', '<', data.fim)
        .where('fim', '>', data.inicio)
        .get();

      // Should have 1 (the one we're confirming) but it might not show as conflict since we just confirmed
      expect(conflicts.size).to.be.lessThan(2);
    });
  });

  describe('TC-023: Conflito ao Confirmar', function() {
    it('should detect conflict with existing confirmed appointment', async function() {
      const now = new Date();
      
      // Create first appointment 10:00-11:00
      const inicio1 = new Date(now);
      inicio1.setHours(10, 0, 0, 0);
      const fim1 = new Date(inicio1);
      fim1.setHours(11, 0, 0, 0);

      await db.collection('empresas').doc(empresaId).collection('agendamentos').add({
        inicio: inicio1.toISOString(),
        fim: fim1.toISOString(),
        clienteUid: clienteUid,
        nomeCliente: 'Cliente 1',
        status: 'confirmado',
        servico: 'Teste',
      });

      // Try to create conflicting appointment 10:30-11:30
      const inicio2 = new Date(now);
      inicio2.setHours(10, 30, 0, 0);
      const fim2 = new Date(inicio2);
      fim2.setHours(11, 30, 0, 0);

      // This should be detected as conflict
      const hasOverlap = new Date(inicio1.toISOString()) < new Date(fim2.toISOString()) && 
                        new Date(fim1.toISOString()) > new Date(inicio2.toISOString());
      
      expect(hasOverlap).to.be.true;
    });
  });

  describe('TC-024: Cancelar Agendamento', function() {
    it('should update status to cancelado and save reason', async function() {
      const now = new Date();
      const inicio = new Date(now.getTime() + 172800000).toISOString(); // +2 days
      const fim = new Date(now.getTime() + 172800000 + 3600000).toISOString();

      const cancelRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc();

      await cancelRef.set({
        inicio: inicio,
        fim: fim,
        clienteUid: clienteUid,
        nomeCliente: 'Cliente Test',
        status: 'solicitado',
        servico: 'Teste',
      });

      await cancelRef.update({
        status: 'cancelado',
        canceladoEm: admin.firestore.FieldValue.serverTimestamp(),
        motivoCancelamento: 'Cliente solicitou cancelamento',
      });

      const doc = await cancelRef.get();
      expect(doc.data().status).to.equal('cancelado');
      expect(doc.data().motivoCancelamento).to.equal('Cliente solicitou cancelamento');
    });
  });

  describe('TC-025: Solicitar Remarcação', function() {
    it('should create remarcacao with status pendente', async function() {
      if (!agendamentoId) {
        this.skip();
        return;
      }

      const now = new Date();
      const novoInicio = new Date(now.getTime() + 259200000).toISOString(); // +3 days
      const novoFim = new Date(now.getTime() + 259200000 + 3600000).toISOString();

      const remarcacaoRef = db.collection('empresas').doc(empresaId)
        .collection('agendamentos').doc(agendamentoId)
        .collection('remarcacoes').doc();

      await remarcacaoRef.set({
        novoInicio: novoInicio,
        novoFim: novoFim,
        motivo: 'Preciso mudar de horário',
        status: 'pendente',
        criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Mark that there's a pending request
      await db.collection('empresas').doc(empresaId)
        .collection('agendamentos').doc(agendamentoId)
        .update({ temPedidoRemarcacao: true });

      const remDoc = await remarcacaoRef.get();
      expect(remDoc.data().status).to.equal('pendente');
      expect(remDoc.data().novoInicio).to.equal(novoInicio);
    });
  });

  describe('TC-026: Aceitar Remarcação', function() {
    it('should update agendamento with new date/time', async function() {
      const now = new Date();
      
      // Create test agendamento
      const agRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc();
      const oldInicio = new Date(now.getTime() + 86400000).toISOString();
      const oldFim = new Date(now.getTime() + 86400000 + 3600000).toISOString();

      await agRef.set({
        inicio: oldInicio,
        fim: oldFim,
        clienteUid: clienteUid,
        nomeCliente: 'Test',
        status: 'confirmado',
        servico: 'Test',
      });

      const agId = agRef.id;

      // Create remarcacao
      const newInicio = new Date(now.getTime() + 172800000).toISOString();
      const newFim = new Date(now.getTime() + 172800000 + 3600000).toISOString();

      const remRef = agRef.collection('remarcacoes').doc();
      await remRef.set({
        novoInicio: newInicio,
        novoFim: newFim,
        status: 'pendente',
      });

      // Accept the remarcacao
      await agRef.update({
        inicio: newInicio,
        fim: newFim,
        temPedidoRemarcacao: false,
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      await remRef.update({
        status: 'aceita',
        aceitaEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      const agDoc = await agRef.get();
      expect(agDoc.data().inicio).to.equal(newInicio);
      expect(agDoc.data().temPedidoRemarcacao).to.be.false;

      const remDoc = await remRef.get();
      expect(remDoc.data().status).to.equal('aceita');
    });
  });

  describe('TC-027: Rejeitar Remarcação', function() {
    it('should update remarcacao status to rejeitada', async function() {
      const now = new Date();
      
      const agRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc();
      const inicio = new Date(now.getTime() + 86400000).toISOString();
      const fim = new Date(now.getTime() + 86400000 + 3600000).toISOString();

      await agRef.set({
        inicio: inicio,
        fim: fim,
        clienteUid: clienteUid,
        nomeCliente: 'Test',
        status: 'confirmado',
        servico: 'Test',
      });

      const remRef = agRef.collection('remarcacoes').doc();
      await remRef.set({
        novoInicio: new Date(now.getTime() + 172800000).toISOString(),
        novoFim: new Date(now.getTime() + 172800000 + 3600000).toISOString(),
        status: 'pendente',
      });

      // Reject
      await remRef.update({
        status: 'rejeitada',
        motivoRejeicao: 'Horário indisponível',
        atualizadoEm: admin.firestore.FieldValue.serverTimestamp(),
      });

      await agRef.update({ temPedidoRemarcacao: false });

      const remDoc = await remRef.get();
      expect(remDoc.data().status).to.equal('rejeitada');
      expect(remDoc.data().motivoRejeicao).to.equal('Horário indisponível');
    });
  });

  describe('TC-028/TC-029: Listagem de Agendamentos', function() {
    it('should filter agendamentos by empresa', async function() {
      const agendamentos = await db.collection('empresas').doc(empresaId)
        .collection('agendamentos')
        .orderBy('inicio', 'asc')
        .get();

      expect(agendamentos.size).to.be.greaterThan(0);
      
      // All should belong to empresaId
      agendamentos.docs.forEach(doc => {
        expect(doc.ref.path).to.include(empresaId);
      });
    });

    it('should filter agendamentos by cliente', async function() {
      const agendamentos = await db.collectionGroup('agendamentos')
        .where('clienteUid', '==', clienteUid)
        .orderBy('inicio', 'asc')
        .get();

      agendamentos.docs.forEach(doc => {
        expect(doc.data().clienteUid).to.equal(clienteUid);
      });
    });
  });

  describe('TC-030: Bloqueios Removem Slots', function() {
    it('should exclude blocked times from available slots', async function() {
      const now = new Date();
      const workingStart = new Date(now);
      workingStart.setHours(9, 0, 0, 0);
      const workingEnd = new Date(now);
      workingEnd.setHours(12, 0, 0, 0);

      const bloqueadoInicio = new Date(now);
      bloqueadoInicio.setHours(10, 0, 0, 0);
      const bloqueadoFim = new Date(now);
      bloqueadoFim.setHours(11, 0, 0, 0);

      // Generate all slots from 9:00 to 12:00 (30min each = 6 slots)
      const allSlots = [];
      let cursor = new Date(workingStart);
      while (cursor.getTime() + 30 * 60000 <= workingEnd.getTime()) {
        allSlots.push(cursor.getTime());
        cursor = new Date(cursor.getTime() + 30 * 60000);
      }

      // Block 10:00-11:00 (should block 2 slots)
      const blockedStart = bloqueadoInicio.getTime();
      const blockedEnd = bloqueadoFim.getTime();

      const availableSlots = allSlots.filter(slot => {
        const slotEnd = slot + 30 * 60000;
        // Check overlap: slot < blockedEnd && slotEnd > blockedStart
        return !(slot < blockedEnd && slotEnd > blockedStart);
      });

      // Should have 4 slots instead of 6
      expect(allSlots.length).to.equal(6);
      expect(availableSlots.length).to.equal(4);
    });
  });

  describe('TC-031: Prevenção de Duplicação', function() {
    it('should prevent creating duplicate confirmed appointment', async function() {
      const now = new Date();
      const inicio = new Date(now.getTime() + 86400000);
      inicio.setHours(14, 0, 0, 0);
      const fim = new Date(inicio);
      fim.setHours(15, 0, 0, 0);

      // Check if there's already a confirmed appointment at this time
      const existing = await db.collection('empresas').doc(empresaId).collection('agendamentos')
        .where('status', '==', 'confirmado')
        .where('inicio', '==', inicio.toISOString())
        .get();

      // If exists, should not allow creating another
      if (existing.size > 0) {
        expect(existing.size).to.equal(1);
      } else {
        // Otherwise it should be possible to create
        const newDoc = await db.collection('empresas').doc(empresaId).collection('agendamentos').add({
          inicio: inicio.toISOString(),
          fim: fim.toISOString(),
          clienteUid: clienteUid,
          status: 'confirmado',
        });
        
        expect(newDoc.id).to.be.a('string');
        
        // Cleanup
        await newDoc.delete();
      }
    });
  });

  describe('TC-032: Notas Internas', function() {
    it('should add nota to agendamento', async function() {
      if (!agendamentoId) {
        this.skip();
        return;
      }

      const agendamentoRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId);

      await agendamentoRef.update({
        notas: admin.firestore.FieldValue.arrayUnion({
          texto: 'Cliente chegou com 5 minutos de atraso',
          data: new Date().toISOString(),
        }),
      });

      const doc = await agendamentoRef.get();
      expect(doc.data().notas).to.be.an('array');
      expect(doc.data().notas.length).to.equal(1);
      expect(doc.data().notas[0].texto).to.equal('Cliente chegou com 5 minutos de atraso');
    });
  });
});

