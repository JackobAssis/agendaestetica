const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// Rate-limited login function
exports.loginWithRateLimit = functions.https.onCall(async (data, context) => {
  const ip = context.rawRequest.ip;
  const key = `login:${ip}:${Date.now() / 60000 | 0}`; // Por minuto
  
  // Simular rate-limit (em produção, usar Redis ou Firestore)
  // Para MVP, limitar a 10 tentativas por minuto por IP
  const rateLimitRef = db.collection('rateLimits').doc(key);
  const rateLimitSnap = await rateLimitRef.get();
  const count = (rateLimitSnap.exists ? rateLimitSnap.data().count : 0) + 1;
  
  if (count > 10) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Muitas tentativas de login. Tente em 1 minuto.'
    );
  }
  
  // Atualizar contador
  await rateLimitRef.set({ count, timestamp: admin.firestore.FieldValue.serverTimestamp() });
  
  // Prosseguir com login normal
  const { email, password } = data;
  if (!email || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Email e senha obrigatórios');
  }
  
  try {
    const userCredential = await admin.auth().signInWithEmailAndPassword(email, password);
    return { uid: userCredential.user.uid };
  } catch (error) {
    throw new functions.https.HttpsError('unauthenticated', 'Credenciais inválidas');
  }
});

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

    // Usar lock distribuído para prevenir race condition
    const lockId = `${agendamentoId}:${Date.now()}`;
    const lockRef = empresaRef.collection('locks').doc(lockId);
    
    const result = await db.runTransaction(async (tx) => {
      // Verificar se já existe lock para este agendamento
      const existingLocks = await tx.get(empresaRef.collection('locks').where('agendamentoId', '==', agendamentoId));
      if (!existingLocks.empty) {
        throw new Error('Agendamento já está sendo processado');
      }
      
      // Criar lock
      tx.set(lockRef, { 
        agendamentoId, 
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 30000) // 30s
      });
      
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

    // Limpar lock após sucesso
    await lockRef.delete();

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
    const { empresaId, nome, email, telefone, recaptchaToken } = req.body || {};
    if (!empresaId || !nome) return res.status(400).send({ error: 'empresaId and nome are required' });

    // Optional reCAPTCHA protection: set RECAPTCHA_SECRET in functions config/env to enable.
    const recaptchaSecret = process.env.RECAPTCHA_SECRET || process.env.RECAPTCHA_SECRET_KEY || null;
    if (recaptchaSecret) {
      const token = recaptchaToken || req.headers['x-recaptcha-token'];
      if (!token) return res.status(403).send({ error: 'Missing recaptcha token' });
      try {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(recaptchaSecret)}&response=${encodeURIComponent(token)}`;
        const resp = await fetch(verifyUrl, { method: 'POST' });
        const data = await resp.json();
        if (!data.success) return res.status(403).send({ error: 'recaptcha verification failed' });
      } catch (e) {
        console.error('recaptcha verify error', e);
        return res.status(500).send({ error: 'recaptcha_verification_error' });
      }
    }

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
