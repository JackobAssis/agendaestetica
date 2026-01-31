# Deploy Firebase (Rules + Cloud Function)

Prerequisites:

- Install Firebase CLI and authenticate: `npm install -g firebase-tools` then `firebase login`.
- Ensure `firebase` project is initialized and you have access to the target project.
- Set `FIREBASE_PROJECT_ID` to your project id.

Deploy steps:

1. Deploy Firestore Rules:

```bash
firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
```

2. Deploy the Cloud Function `confirmAgendamento`:

```bash
cd functions
npm install
firebase deploy --only functions:confirmAgendamento --project YOUR_FIREBASE_PROJECT_ID
```

3. Configure frontend URL:

Set `window.APP_CONFIG.confirmAgendamentoFunctionUrl` in your production HTML or environment to the deployed function URL, e.g. `https://us-central1-PROJECT.cloudfunctions.net/confirmAgendamento`.

Set `window.APP_CONFIG.createClienteFunctionUrl` to the deployed `createCliente` function URL if you want the frontend to create/deduplicate clients via the Cloud Function (recommended). Example:

```js
window.APP_CONFIG = {
  confirmAgendamentoFunctionUrl: 'https://us-central1-PROJECT.cloudfunctions.net/confirmAgendamento',
  createClienteFunctionUrl: 'https://us-central1-PROJECT.cloudfunctions.net/createCliente'
}
```

4. Test example (curl):

Obtain an ID token for a proprietario (use firebase admin SDK or perform client sign-in and getIdToken()). Then call:

```bash
curl -X POST https://<REGION>-<PROJECT>.cloudfunctions.net/confirmAgendamento \
  -H "Authorization: Bearer <ID_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"empresaId":"prof_<UID>","agendamentoId":"<AGENDAMENTO_ID>"}'
```

Notes:
- The Cloud Function validates the ID token and checks that the caller is the `proprietarioUid` of the empresa.
- Firestore Rules were written to allow public creation of `agendamentos` with `status == 'solicitado'` and restrict updates/deletes to the owner or the creating cliente.

- Firestore Rules also enforce that creation of `empresas/{empresaId}/clientes` is NOT allowed publicly; instead, use the Cloud Function `createCliente` to create/deduplicate clients. This function runs with Admin privileges and bypasses Firestore Rules, providing a safe channel to validate and deduplicate client records before insertion.

