import { obterUsuarioAtual } from '../modules/auth.js';
import { getPlan, setPlan, PLANS, temFeature } from '../modules/monetization.js';
import { slugify, isSlugAvailable } from '../modules/slug.js';

// firestore helpers used below
import { 
    getFirestore,
    doc,
    getDoc,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

function getFirebaseDB() {
    if (typeof window !== 'undefined' && window.firebaseApp) {
        return getFirestore(window.firebaseApp);
    }
    throw new Error('Firebase Firestore não inicializado. Verifique index.html');
}

const nomeEl = document.getElementById('perfil-nome');
const emailEl = document.getElementById('perfil-email');
const slugInput = document.getElementById('perfil-slug');
const btnSaveSlug = document.getElementById('btn-save-slug');
const slugLink = document.getElementById('slug-link');

// serviços UI
const servicesListEl = document.getElementById('services-list');
const newServiceName = document.getElementById('new-service-name');
const newServicePrice = document.getElementById('new-service-price');
const newServiceDuration = document.getElementById('new-service-duration');
const btnAddService = document.getElementById('btn-add-service');

let servicos = [];
let editingIndex = null;

const planoText = document.getElementById('plano-atual-text');
const planoSelect = document.getElementById('plano-select');
const btnChange = document.getElementById('btn-change-plan');

async function init(){
  const usuario = obterUsuarioAtual();
  if(!usuario) { window.location.href = '/login'; return; }
  nomeEl.textContent = usuario.nome;
  emailEl.textContent = usuario.email || '';

  const plano = await getPlan(usuario.empresaId);
  planoText.textContent = plano.charAt(0).toUpperCase() + plano.slice(1);
  planoSelect.value = plano;

  // carregar slug atual
  await carregarSlug(usuario.empresaId);

  btnChange.addEventListener('click', async ()=>{
    const newPlan = planoSelect.value;
    if(newPlan === plano) return alert('Plano igual ao atual');
    try{
      await setPlan(usuario.empresaId, newPlan);
      alert('Plano atualizado');
      window.location.reload();
    }catch(e){ console.error(e); alert('Erro ao atualizar plano'); }
  });
}

// carregar slug do Firestore e configurar botão de salvar
async function carregarSlug(empresaId) {
    try {
        const db = getFirebaseDB();
        const ref = doc(db, 'empresas', empresaId);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};
        if (slugInput) slugInput.value = data.slug || '';
        if (slugLink) {
            if (data.slug) {
                slugLink.textContent = `https://agendaestetica.app/p/${data.slug}`;
            } else {
                slugLink.textContent = '';
            }
        }
        // show address if available
        if (data.endereco && document.getElementById('perfil-endereco')) {
            document.getElementById('perfil-endereco').textContent = data.endereco;
        }
        // also load services if any
        servicos = data.servicos || [];
        renderServicos();
    } catch (e) {
        console.error('Não foi possível carregar slug ou serviços:', e);
    }
}

// renderizar lista de serviços
function renderServicos() {
    if (!servicesListEl) return;
    servicesListEl.innerHTML = '';
    servicos.forEach((s, idx) => {
        const li = document.createElement('li');
        const nome = s.nome || s;
        const preco = s.preco != null ? `R$ ${s.preco}` : '';
        const dur = s.duracao != null ? `${s.duracao}min` : '';
        li.textContent = `${nome} ${preco} ${dur}`.trim();
        li.style.marginBottom = '0.5rem';
        const btnEdit = document.createElement('button');
        btnEdit.textContent = '✏️';
        btnEdit.className = 'btn btn--small';
        btnEdit.style.marginLeft = '0.5rem';
        btnEdit.addEventListener('click', () => editarServico(idx));
        const btnDel = document.createElement('button');
        btnDel.textContent = '🗑️';
        btnDel.className = 'btn btn--small btn--danger';
        btnDel.style.marginLeft = '0.25rem';
        btnDel.addEventListener('click', () => removerServico(idx));
        li.appendChild(btnEdit);
        li.appendChild(btnDel);
        servicesListEl.appendChild(li);
    });
}

async function salvarServicos(empresaId) {
    try {
        const db = getFirebaseDB();
        const ref = doc(db, 'empresas', empresaId);
        await updateDoc(ref, { servicos });
    } catch (e) {
        console.error('Erro ao salvar serviços:', e);
    }
}

function editarServico(index) {
    const s = servicos[index];
    editingIndex = index;
    newServiceName.value = s.nome || '';
    newServicePrice.value = s.preco != null ? s.preco : '';
    newServiceDuration.value = s.duracao != null ? s.duracao : '';
    btnAddService.textContent = 'Atualizar Serviço';
}

async function removerServico(index) {
    if (!confirm('Remover este serviço?')) return;
    servicos.splice(index, 1);
    renderServicos();
    const usuario = obterUsuarioAtual();
    if (usuario) await salvarServicos(usuario.empresaId);
}

if (btnAddService) {
    btnAddService.addEventListener('click', async () => {
        // check if unlimited services allowed
        const usuario = obterUsuarioAtual();
        const allowUnlimitedServices = await temFeature('servicos_ilimitados');
        if (!allowUnlimitedServices && servicos.length >= 5) {
            return alert('Limite de 5 serviços no plano Free. Upgrade para plano Premium.');
        }
        
        const nome = newServiceName.value.trim();
        const preco = parseFloat(newServicePrice.value) || 0;
        const dur = parseInt(newServiceDuration.value) || 0;
        if (!nome) return alert('Nome do serviço é obrigatório');
        const novo = { nome, preco, duracao: dur };
        if (editingIndex != null) {
            servicos[editingIndex] = novo;
            editingIndex = null;
            btnAddService.textContent = 'Adicionar Serviço';
        } else {
            servicos.push(novo);
        }
        newServiceName.value = '';
        newServicePrice.value = '';
        newServiceDuration.value = '';
        renderServicos();
        if (usuario) await salvarServicos(usuario.empresaId);
    });
}}

if (btnSaveSlug) {
    btnSaveSlug.addEventListener('click', async () => {
        if (!slugInput) return;
        const raw = slugInput.value.trim();
        const candidate = slugify(raw);
        if (!candidate) {
            return alert('Digite um slug válido (apenas letras, números e hífens)');
        }

        const usuario = obterUsuarioAtual();
        if (!usuario) return alert('Usuário não encontrado');
        const empresaId = usuario.empresaId;

        try {
            const available = await isSlugAvailable(candidate, empresaId);
            if (!available) {
                return alert('Este slug já está em uso');
            }

            const db = getFirebaseDB();
            const ref = doc(db, 'empresas', empresaId);
            await updateDoc(ref, { slug: candidate, public: true });

            if (slugLink) slugLink.textContent = `https://agendaestetica.app/p/${candidate}`;
            alert('Slug atualizado com sucesso');
        } catch (e) {
            console.error('Erro ao atualizar slug:', e);
            alert('Não foi possível atualizar slug');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
