/**
 * Permissions Module
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 5 (permissoes.js)
 * 
 * Responsibility:
 * - Verificar permissões de acesso
 * - Feature flags (free vs premium)
 * - Bloqueio de funcionalidades por plano
 */

import { obterUsuarioAtual } from './auth.js';

/**
 * Verificar se usuário é profissional
 * @returns {boolean}
 */
export function ehProfissional() {
    const usuario = obterUsuarioAtual();
    return usuario && usuario.role === 'profissional';
}

/**
 * Verificar se usuário é cliente
 * @returns {boolean}
 */
export function ehCliente() {
    const usuario = obterUsuarioAtual();
    return usuario && usuario.role === 'cliente';
}

/**
 * Verificar se usuário está logado
 * @returns {boolean}
 */
export function estaLogado() {
    return obterUsuarioAtual() !== null;
}

/**
 * Obter plano do profissional (free/premium)
 * @returns {Promise<string>} 'free' | 'premium'
 */
export async function obterPlano() {
    try {
        const usuario = obterUsuarioAtual();
        
        if (!usuario || !usuario.empresaId) {
            return 'free';
        }
        
        const db = window.firebase.db;
        const empresaDoc = await db.collection('empresas').doc(usuario.empresaId).get();
        
        if (empresaDoc.exists()) {
            return empresaDoc.data().plano || 'free';
        }
        
        return 'free';
        
    } catch (error) {
        console.error('Erro ao obter plano:', error);
        return 'free';
    }
}

/**
 * Feature Flag: Verificar se funcionalidade está disponível
 * @param {string} feature - 'tema_avancado', 'notificacoes_email', 'relatorios', 'integracao_agenda'
 * @returns {Promise<boolean>}
 */
export async function temFeature(feature) {
    try {
        const plano = await obterPlano();
        
        // Features por plano (PLANO-MESTRE-TECNICO.md > Seção 8)
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

/**
 * Bloquear funcionalidade não disponível
 * @param {string} feature
 * @param {string} mensagemCustom (opcional)
 * @throws {Error}
 */
export async function validarFeature(feature, mensagemCustom = null) {
    const disponivel = await temFeature(feature);
    
    if (!disponivel) {
        const mensagem = mensagemCustom || `Essa funcionalidade está disponível apenas no plano Premium`;
        throw new Error(mensagem);
    }
}

/**
 * Validar acesso à página (middleware)
 * @param {string} pagina
 * @param {string} roleRequerida (opcional)
 * @returns {boolean}
 */
export function validarAcessoPagina(pagina, roleRequerida = null) {
    const usuario = obterUsuarioAtual();
    
    // Páginas públicas
    const paginasPublicas = ['/login', '/cadastro', '/agenda/:id', '/agendar/:id'];
    if (paginasPublicas.some(p => p === pagina || p.replace(':id', '\\d+') === pagina)) {
        return true;
    }
    
    // Exigir login para outras páginas
    if (!usuario) {
        return false;
    }
    
    // Validar role específica
    if (roleRequerida && usuario.role !== roleRequerida) {
        return false;
    }
    
    return true;
}

/**
 * Validar que onboarding foi completado (profissional)
 * @returns {Promise<boolean>}
 */
export async function foiOnboardingCompleto() {
    try {
        const usuario = obterUsuarioAtual();
        
        if (!usuario || !usuario.empresaId) {
            return false;
        }
        
        const db = window.firebase.db;
        const empresaDoc = await db.collection('empresas').doc(usuario.empresaId).get();
        
        if (!empresaDoc.exists()) {
            return false;
        }
        
        return empresaDoc.data().onboardingCompleto === true;
        
    } catch (error) {
        console.error('Erro ao verificar onboarding:', error);
        return false;
    }
}
