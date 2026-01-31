const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// HTTP function to confirm an agendamento atomically.
// Expects JSON body: { empresaId, agendamentoId }
// Requires Authorization: Bearer <idToken> of the proprietario
exports.confirmAgendamento = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });

  try {
    const idToken = (req.headers.authorization || '').replace(/^Bearer\s+/, '');
    if (!idToken) return res.status(401).send({ error: 'Missing Authorization token' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    const { empresaId, agendamentoId } = req.body || {};
    if (!empresaId || !agendamentoId) return res.status(400).send({ error: 'empresaId and agendamentoId required' });

    // Verify requester is proprietario
    const empresaRef = db.collection('empresas').doc(empresaId);
    const empresaSnap = await empresaRef.get();
    if (!empresaSnap.exists) return res.status(404).send({ error: 'Empresa not found' });
    const empresa = empresaSnap.data();
    if (empresa.proprietarioUid !== uid) return res.status(403).send({ error: 'Not authorized' });

    const agRef = empresaRef.collection('agendamentos').doc(agendamentoId);

    const result = await db.runTransaction(async (tx) => {
      const agSnap = await tx.get(agRef);
      if (!agSnap.exists) throw new Error('Agendamento not found');
      const ag = agSnap.data();

      // Check for conflicts with already confirmed agendamentos
      const conflictQuery = empresaRef.collection('agendamentos')
        .where('inicio', '<', ag.fim)
        .where('fim', '>', ag.inicio)
        .where('status', '==', 'confirmado');

      const conflictSnap = await tx.get(conflictQuery);
      if (!conflictSnap.empty) throw new Error('Conflict detected while confirming');

      tx.update(agRef, { status: 'confirmado', confirmadoEm: admin.firestore.FieldValue.serverTimestamp() });
      return { id: agendamentoId, status: 'confirmado' };
    });

    return res.status(200).send({ success: true, result });
  } catch (err) {
    console.error('confirmAgendamento error', err);
    return res.status(500).send({ error: err.message || 'internal_error' });
  }
});

// HTTP function to create (or find) a cliente under an empresa.
// Expects JSON body: { empresaId, nome, email, telefone }
// This endpoint is intended to be called from the public booking flow.
// The function uses the Admin SDK (bypasses Firestore Rules) to perform
// deduplication and validation. Consider protecting this endpoint with
// recaptcha or rate-limiting in production.
exports.createCliente = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send({ error: 'Method not allowed' });

  try {
    const { empresaId, nome, email, telefone } = req.body || {};
    if (!empresaId || !nome) return res.status(400).send({ error: 'empresaId and nome are required' });

    const empresaRef = db.collection('empresas').doc(empresaId);
    const empresaSnap = await empresaRef.get();
    if (!empresaSnap.exists) return res.status(404).send({ error: 'Empresa not found' });

    // Deduplicate by email if provided
    if (email) {
      const q = await empresaRef.collection('clientes').where('email', '==', email).limit(1).get();
      if (!q.empty) {
        const doc = q.docs[0];
        return res.status(200).send({ exists: true, cliente: { id: doc.id, ...doc.data() } });
      }
    }

    const payload = {
      nome: String(nome),
      email: email ? String(email) : null,
      telefone: telefone ? String(telefone) : null,
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
      criadoPor: null,
    };

    const newRef = await empresaRef.collection('clientes').add(payload);
    const newSnap = await newRef.get();
    return res.status(201).send({ exists: false, cliente: { id: newRef.id, ...newSnap.data() } });
  } catch (err) {
    console.error('createCliente error', err);
    return res.status(500).send({ error: err.message || 'internal_error' });
  }
});
