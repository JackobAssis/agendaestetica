/**
 * Agendamentos Module
 * Responsibilities:
 * - Client solicita agendamento (status: 'solicitado')
 * - Profissional confirma (status: 'confirmado')
 * - Cancelamento, remarcação (requests), notas internas
 * - Listagens para empresa e cliente
 * - Criação de agendamento com transação para prevenir conflitos
 */

/**
 * Solicitar agendamento (cliente)
 * @param {string} empresaId
 * @param {object} payload { inicioISO, fimISO, clienteUid, nomeCliente, telefone, servico }
 */
export async function solicitarAgendamento(empresaId, payload) {
  if (!empresaId) throw new Error('empresaId é obrigatório');
  if (!payload || !payload.inicioISO || !payload.fimISO) throw new Error('Intervalo inválido');

  const db = window.firebase.db;
  const agRef = db.collection('empresas').doc(empresaId).collection('agendamentos');

  // criar documento com status 'solicitado'
  const docRef = await agRef.add({
    inicio: payload.inicioISO,
    fim: payload.fimISO,
    clienteUid: payload.clienteUid || null,
    nomeCliente: payload.nomeCliente || null,
    telefone: payload.telefone || null,
    servico: payload.servico || null,
    status: 'solicitado',
    criadoEm: new Date().toISOString(),
    notas: [],
  });

  return { id: docRef.id, ...payload, status: 'solicitado' };
}

/**
 * Confirmar agendamento (profissional)
 * Usa transação para prevenir conflitos
 * @param {string} empresaId
 * @param {string} agendamentoId
 */
export async function confirmarAgendamento(empresaId, agendamentoId) {
  if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
  const db = window.firebase.db;
  const agDocRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId);
  // If a Cloud Function URL is configured, delegate confirmation to it for atomic handling
  const remoteUrl = window.APP_CONFIG && window.APP_CONFIG.confirmAgendamentoFunctionUrl;
  if (remoteUrl) {
    // Ensure user is authenticated and obtain idToken
    const user = window.firebase.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    const idToken = await window.firebase.auth.getIdToken(user);

    const resp = await fetch(remoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ empresaId, agendamentoId })
    });

    const body = await resp.json();
    if (!resp.ok) throw new Error(body.error || 'Erro ao confirmar via Cloud Function');
    return body.result || body;
  }

  // Fallback: Transactional confirm (client-side)
  return db.runTransaction(async (transaction) => {
    const snap = await transaction.get(agDocRef);
    if (!snap.exists) throw new Error('Agendamento não encontrado');
    const data = snap.data();

    // Check conflicts
    const conflictQuery = db.collection('empresas').doc(empresaId).collection('agendamentos')
      .where('inicio', '<', data.fim)
      .where('fim', '>', data.inicio)
      .where('status', '==', 'confirmado');

    const conflictSnap = await transaction.get(conflictQuery);
    if (!conflictSnap.empty) throw new Error('Conflito de horário detectado ao confirmar');

    transaction.update(agDocRef, { status: 'confirmado', confirmadoEm: new Date().toISOString() });
    return { id: agendamentoId, status: 'confirmado' };
  });
}

/**
 * Cancelar agendamento
 * @param {string} empresaId
 * @param {string} agendamentoId
 * @param {string} motivo
 */
export async function cancelarAgendamento(empresaId, agendamentoId, motivo) {
  if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
  const db = window.firebase.db;
  const agDocRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId);

  await agDocRef.update({ status: 'cancelado', canceladoEm: new Date().toISOString(), motivoCancelamento: motivo || null });
  return { id: agendamentoId, status: 'cancelado' };
}

/**
 * Solicitar remarcação (cliente)
 * grava em subcollection remarcacoes
 */
export async function solicitarRemarcacao(empresaId, agendamentoId, novoInicioISO, novoFimISO, motivo) {
  if (!empresaId || !agendamentoId) throw new Error('empresaId e agendamentoId obrigatórios');
  if (!novoInicioISO || !novoFimISO) throw new Error('Novo intervalo inválido');

  const db = window.firebase.db;
  const remRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId).collection('remarcacoes');

  const res = await remRef.add({
    novoInicio: novoInicioISO,
    novoFim: novoFimISO,
    motivo: motivo || null,
    status: 'pendente',
    criadoEm: new Date().toISOString(),
  });

  // marcar pedido de remarcação no documento principal
  const agDocRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId);
  await agDocRef.update({ temPedidoRemarcacao: true });

  return { id: res.id, status: 'pendente' };
}

/**
 * Aceitar remarcação (profissional) — aplica nova data/hora
 */
export async function aceitarRemarcacao(empresaId, agendamentoId, remarcacaoId) {
  if (!empresaId || !agendamentoId || !remarcacaoId) throw new Error('Parâmetros obrigatórios');
  const db = window.firebase.db;
  const remRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId).collection('remarcacoes').doc(remarcacaoId);
  const agDocRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId);

  return db.runTransaction(async (transaction) => {
    const remSnap = await transaction.get(remRef);
    if (!remSnap.exists) throw new Error('Remarcação não encontrada');
    const rem = remSnap.data();

    // check conflicts for new slot (against confirmed)
    const conflictQuery = db.collection('empresas').doc(empresaId).collection('agendamentos')
      .where('inicio', '<', rem.novoFim)
      .where('fim', '>', rem.novoInicio)
      .where('status', '==', 'confirmado');

    const conflictSnap = await transaction.get(conflictQuery);
    if (!conflictSnap.empty) throw new Error('Conflito ao aceitar remarcação');

    transaction.update(agDocRef, { inicio: rem.novoInicio, fim: rem.novoFim, temPedidoRemarcacao: false, atualizadoEm: new Date().toISOString() });
    transaction.update(remRef, { status: 'aceita', aceitaEm: new Date().toISOString() });

    return { id: agendamentoId, remarcacaoId, status: 'remarcado' };
  });
}

/**
 * Rejeitar remarcação
 */
export async function rejeitarRemarcacao(empresaId, agendamentoId, remarcacaoId, motivo) {
  const db = window.firebase.db;
  const remRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId).collection('remarcacoes').doc(remarcacaoId);
  await remRef.update({ status: 'rejeitada', motivoRejeicao: motivo || null, atualizadoEm: new Date().toISOString() });
  await db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId).update({ temPedidoRemarcacao: false });
  return { id: remarcacaoId, status: 'rejeitada' };
}

/**
 * Listar agendamentos da empresa (filtro opcional: data)
 */
export async function listAgendamentosEmpresa(empresaId, opts = {}) {
  const db = window.firebase.db;
  let q = db.collection('empresas').doc(empresaId).collection('agendamentos').orderBy('inicio', 'asc');

  if (opts.start && opts.end) {
    q = q.where('inicio', '>=', opts.start).where('inicio', '<=', opts.end);
  }

  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Listar agendamentos de um cliente
 */
export async function listAgendamentosCliente(clienteUid) {
  const db = window.firebase.db;
  const q = db.collectionGroup('agendamentos').where('clienteUid', '==', clienteUid).orderBy('inicio', 'asc');
  const snap = await q.get();
  return snap.docs.map(d => ({ id: d.id, ...d.data(), refPath: d.ref.path }));
}

/**
 * Adicionar nota interna ao agendamento
 */
export async function addNota(empresaId, agendamentoId, nota) {
  const db = window.firebase.db;
  const agRef = db.collection('empresas').doc(empresaId).collection('agendamentos').doc(agendamentoId);
  await agRef.update({ notas: window.firebase.firebaseArrayUnion ? window.firebase.firebaseArrayUnion(nota) : window.firebase.firestoreFieldValueArrayUnion ? window.firebase.firestoreFieldValueArrayUnion(nota) : window.firebase.firestore.FieldValue.arrayUnion(nota) });
  return { sucesso: true };
}
