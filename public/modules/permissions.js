/**
 * Permissions Module - Firebase v9+ Modular SDK
 * CORRIGIDO para Firebase v9+ modular
 */

import { obterUsuarioAtual } from './auth.js';
import { getFirebaseDB, doc, getDoc } from './firebase.js';

export function ehProfissional() {
    const usuario = obterUsuarioAtual();
    return usuario && usuario.role === 'profissional';
}

export function ehCliente() {
    const usuario = obterUsuarioAtual();
    return usuario && usuario.role === 'cliente';
}

export function estaLogado() {
    return obterUsuarioAtual() !== null;
}

export async function obterPlano() {
    try {
        const usuario = obterUsuarioAtual();
        
        if (!usuario || !usuario.empresaId) {
            return 'free';
        }
        
        const db = getFirebaseDB();  // ✅ v9+
        const docRef = doc(db, 'empresas', usuario.empresaId);
        const empresaDoc = await getDoc(docRef);  // ✅ v9+
        
        if (empresaDoc.exists()) {
            return empresaDoc.data().plano || 'free';
        }
        
        return 'free';
        
    } catch (error) {
        console.error('Erro ao obter plano:', error);
        return 'free';
    }
}

export async function temFeature(feature) {
    try {
        const plano = await obterPlano();
        
        const features = {
            free: [
                'login',
                'agenda_basica',
                'agendamentos_basico',
                'clientes_basico',
                'tema_padrao',
            ],
            premium: [
                'login',
                'agenda_basica',
                'agendamentos_basico',
                'clientes_basico',
                'tema_padrao',
                'tema_avancado',
                'notificacoes_email',
                'relatorios',
                'integracao_agenda',
                'bloqueios_customizados',
            ],
        };
        
        const featuresDoPlano = features[plano] || [];
        return featuresDoPlano.includes(feature);
        
    } catch (error) {
        console.error('Erro ao verificar feature:', error);
        return false;
    }
}

export async function validarFeature(feature, mensagemCustom = null) {
    const disponivel = await temFeature(feature);
    
    if (!disponivel) {
        const mensagem = mensagemCustom || `Essa funcionalidade está disponível apenas no plano Premium`;
        throw new Error(mensagem);
    }
}

export function validarAcessoPagina(pagina, roleRequerida = null) {
    const usuario = obterUsuarioAtual();
    
    const paginasPublicas = ['/login', '/cadastro', '/agenda/:id', '/agendar/:id'];
    if (paginasPublicas.some(p => p === pagina || p.replace(':id', '\\d+') === pagina)) {
        return true;
    }
    
    if (!usuario) {
        return false;
    }
    
    if (roleRequerida && usuario.role !== roleRequerida) {
        return false;
    }
    
    return true;
}

export async function foiOnboardingCompleto() {
    try {
        const usuario = obterUsuarioAtual();
        
        if (!usuario || !usuario.empresaId) {
            return false;
        }
        
        const db = getFirebaseDB();  // ✅ v9+
        const docRef = doc(db, 'empresas', usuario.empresaId);
        const empresaDoc = await getDoc(docRef);  // ✅ v9+
        
        if (!empresaDoc.exists()) {
            return false;
        }
        
        return empresaDoc.data().onboardingCompleto === true;
        
    } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
        return false;
    }
}

