/**
 * Clientes Module
 * Responsibilities:
 * - CRUD básico para clientes por empresa
 * - Observações internas
 * - Histórico de agendamentos por cliente
 */

export async function addCliente(empresaId, cliente) {
  if (!empresaId) throw new Error('empresaId é obrigatório');
  if (!cliente || !cliente.nome) throw new Error('Dados do cliente inválidos');

  const db = window.firebase.db;
  const payload = {
    nome: cliente.nome,
    email: cliente.email || null,
    telefone: cliente.telefone || null,
    criadoEm: new Date().toISOString(),
    criadoPor: window.firebase.auth.currentUser ? window.firebase.auth.currentUser.uid : null,
    observacoes: [],
  };

  const ref = await db.collection('empresas').doc(empresaId).collection('clientes').add(payload);
  return { id: ref.id, ...payload };
}

/**
 * Find a client by email under empresa; if not found, create one.
 * Returns the cliente object with id.
 */
export async function findOrCreateClienteByEmail(empresaId, email, nome, telefone) {
  if (!empresaId) throw new Error('empresaId é obrigatório');
  if (!email && !nome) throw new Error('Email ou nome é obrigatório para criar cliente');

  const db = window.firebase.db;
  if (email) {
    const q = await db.collection('empresas').doc(empresaId).collection('clientes').where('email', '==', email).get();
    if (!q.empty) {
      const d = q.docs[0];
      return { id: d.id, ...d.data() };
    }
  }

  // Create new cliente
  const payload = { nome: nome || (email ? email.split('@')[0] : 'Cliente'), email: email || null, telefone: telefone || null };
  const res = await addCliente(empresaId, payload);
  return res;
}

export async function getCliente(empresaId, clienteId) {
  if (!empresaId || !clienteId) throw new Error('empresaId e clienteId obrigatórios');
  const db = window.firebase.db;
  const snap = await db.collection('empresas').doc(empresaId).collection('clientes').doc(clienteId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

export async function listClientesEmpresa(empresaId) {
  if (!empresaId) throw new Error('empresaId é obrigatório');
  const db = window.firebase.db;
  const q = await db.collection('empresas').doc(empresaId).collection('clientes').orderBy('criadoEm', 'desc').get();
  return q.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addObservacao(empresaId, clienteId, nota) {
  if (!empresaId || !clienteId) throw new Error('empresaId e clienteId obrigatórios');
  if (!nota) throw new Error('Nota inválida');
  const db = window.firebase.db;
  const clienteRef = db.collection('empresas').doc(empresaId).collection('clientes').doc(clienteId);
  const fv = window.firebase.firestore && window.firebase.firestore.FieldValue ? window.firebase.firestore.FieldValue : (window.firebase.firestoreFieldValueArrayUnion || null);
  if (fv && fv.arrayUnion) {
    await clienteRef.update({ observacoes: fv.arrayUnion({ texto: nota, criadoEm: new Date().toISOString(), criadoPor: window.firebase.auth.currentUser ? window.firebase.auth.currentUser.uid : null }) });
  } else {
    // fallback: fetch and push
    const snap = await clienteRef.get();
    const data = snap.exists ? snap.data() : { observacoes: [] };
    const arr = data.observacoes || [];
    arr.push({ texto: nota, criadoEm: new Date().toISOString(), criadoPor: window.firebase.auth.currentUser ? window.firebase.auth.currentUser.uid : null });
    await clienteRef.update({ observacoes: arr });
  }
  return { sucesso: true };
}

export async function getHistorico(empresaId, clienteId) {
  if (!empresaId || !clienteId) throw new Error('empresaId e clienteId obrigatórios');
  const db = window.firebase.db;
  const q = db.collection('empresas').doc(empresaId).collection('agendamentos').where('clienteUid', '==', clienteId).orderBy('inicio', 'desc');
  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export default { addCliente, getCliente, listClientesEmpresa, addObservacao, getHistorico };
