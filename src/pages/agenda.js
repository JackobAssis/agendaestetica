import { obterUsuarioAtual } from '../modules/auth.js';
import { saveAgendaConfig, createBlock, generateSlotsForDate } from '../modules/agenda.js';

const form = document.getElementById('form-agenda');
const msg = document.getElementById('agenda-mensagem');
const formBloq = document.getElementById('form-bloqueio');
const bloqueioMsg = document.getElementById('bloqueio-msg');
const btnGerar = document.getElementById('btn-gerar');
const datePreview = document.getElementById('date-preview');
const slotsContainer = document.getElementById('slots-container');

function showMsg(element, text, type='success'){
  element.className = type==='success' ? 'success-message' : 'error-message';
  element.textContent = text;
  element.classList.remove('hidden');
}
function clearMsg(element){ element.classList.add('hidden'); }

form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  clearMsg(msg);
  const btn = form.querySelector('.submit-btn');
  btn.disabled = true; btn.textContent = 'Salvando...';

  try{
    const dias = Array.from(document.querySelectorAll('input[name="dias"]:checked')).map(i=>i.value);
    const horaInicio = document.getElementById('hora-inicio').value;
    const horaFim = document.getElementById('hora-fim').value;
    const duracaoSlot = parseInt(document.getElementById('duracao-slot').value, 10);

    const usuario = obterUsuarioAtual();
    if(!usuario || !usuario.empresaId) throw new Error('Usuário não autenticado');

    await saveAgendaConfig(usuario.empresaId, { dias, horaInicio, horaFim, duracaoSlot });
    showMsg(msg, 'Configuração salva com sucesso', 'success');
    btn.disabled = false; btn.textContent = 'Salvar Configuração';
  }catch(err){
    console.error('Erro salvar config', err);
    showMsg(msg, err.message || 'Erro ao salvar config', 'error');
    btn.disabled = false; btn.textContent = 'Salvar Configuração';
  }
});

formBloq.addEventListener('submit', async (e)=>{
  e.preventDefault();
  clearMsg(bloqueioMsg);
  const btn = formBloq.querySelector('.submit-btn');
  btn.disabled = true; btn.textContent = 'Criando...';

  try{
    const inicio = document.getElementById('block-inicio').value;
    const fim = document.getElementById('block-fim').value;
    const motivo = document.getElementById('block-motivo').value;

    const usuario = obterUsuarioAtual();
    if(!usuario || !usuario.empresaId) throw new Error('Usuário não autenticado');

    if(!inicio || !fim) throw new Error('Informe inicio e fim');
    if(new Date(inicio) >= new Date(fim)) throw new Error('Intervalo inválido');

    await createBlock(usuario.empresaId, { inicioISO: new Date(inicio).toISOString(), fimISO: new Date(fim).toISOString(), motivo });
    showMsg(bloqueioMsg, 'Bloqueio criado com sucesso', 'success');
    btn.disabled = false; btn.textContent = 'Criar Bloqueio';
  }catch(err){
    console.error('Erro criar bloqueio', err);
    showMsg(bloqueioMsg, err.message || 'Erro ao criar bloqueio', 'error');
    btn.disabled = false; btn.textContent = 'Criar Bloqueio';
  }
});

btnGerar.addEventListener('click', async ()=>{
  clearMsg(slotsContainer);
  slotsContainer.innerHTML = '';
  const date = datePreview.value;
  if(!date){ showMsg(slotsContainer, 'Selecione uma data', 'error'); return; }

  try{
    const usuario = obterUsuarioAtual();
    if(!usuario || !usuario.empresaId) throw new Error('Usuário não autenticado');

    btnGerar.disabled = true; btnGerar.textContent = 'Gerando...';
    const slots = await generateSlotsForDate(usuario.empresaId, date);
    btnGerar.disabled = false; btnGerar.textContent = 'Gerar Slots Disponíveis';

    if(!slots.length){ slotsContainer.innerHTML = '<p class="text-secondary">Nenhum slot disponível nesta data</p>'; return; }

    const list = document.createElement('ul');
    list.className = 'slots-list';
    slots.forEach(s => {
      const li = document.createElement('li');
      const dtStart = new Date(s.inicioISO);
      li.textContent = `${dtStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.fimISO).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      list.appendChild(li);
    });
    slotsContainer.appendChild(list);
  }catch(err){
    console.error('Erro gerar slots', err);
    showMsg(slotsContainer, err.message || 'Erro ao gerar slots', 'error');
    btnGerar.disabled = false; btnGerar.textContent = 'Gerar Slots Disponíveis';
  }
});

// Proteção: se não autenticado, redireciona
document.addEventListener('DOMContentLoaded', ()=>{
  const usuario = obterUsuarioAtual();
  if(!usuario || !usuario.empresaId){ window.location.href = '/login'; }
});
