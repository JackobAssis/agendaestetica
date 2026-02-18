/**
 * Router Module
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 5 (router.js)
 * 
 * Responsibility:
 * - Client-side routing without frameworks
 * - Page transitions
 * - Permission-based redirects
 * - Authentication checks
 * 
 * Compatible with Vercel static hosting
 */

import { obterUsuarioAtual } from './modules/auth.js';

const PAGES = {
    LOGIN: { path: '/login', file: '/pages/login.html', public: true, requireAuth: false },
    RECUPERAR_SENHA: { path: '/recuperar-senha', file: '/pages/recuperar-senha.html', public: true, requireAuth: false },
    DASHBOARD_PROF: { path: '/dashboard', file: '/pages/dashboard.html', public: false, requireAuth: true, role: 'profissional' },
    ONBOARDING: { path: '/onboarding', file: '/pages/onboarding.html', public: false, requireAuth: true },
    AGENDA: { path: '/agenda', file: '/pages/agenda.html', public: false, requireAuth: true },
    AGENDAMENTOS: { path: '/agendamentos', file: '/pages/agendamentos.html', public: false, requireAuth: true },
    CLIENTES: { path: '/clientes', file: '/pages/clientes.html', public: false, requireAuth: true },
    PERFIL: { path: '/perfil', file: '/pages/perfil.html', public: false, requireAuth: true },
    MEUS_AGENDAMENTOS: { path: '/meus-agendamentos', file: '/pages/meus-agendamentos.html', public: false, requireAuth: true, role: 'cliente' },
    PAGINA_CLIENTE: { path: '/pagina-cliente', file: '/pages/pagina-cliente.html', public: false, requireAuth: true, role: 'cliente' },
    SOLICITACOES_TROCA: { path: '/solicitacoes-troca', file: '/pages/solicitacoes-troca.html', public: false, requireAuth: true, role: 'profissional' },
    NOTIFICACOES: { path: '/notificacoes', file: '/pages/notificacoes.html', public: false, requireAuth: true },
    RELATORIOS: { path: '/relatorios', file: '/pages/relatorios.html', public: false, requireAuth: true, role: 'profissional' },
    PAGINA_PUBLICA: { path: '/agenda/:profissionalId', file: '/pages/pagina-publica.html', public: true, requireAuth: false },
    LINK_AGENDAMENTO: { path: '/agendar/:profissionalId', file: '/pages/agendar-cliente.html', public: true, requireAuth: false },
    CONFIRMACAO: { path: '/confirmacao', file: '/pages/confirmacao.html', public: true, requireAuth: false },
    AGENDAR_CLIENTE: { path: '/agendar-cliente', file: '/pages/agendar-cliente.html', public: true, requireAuth: false },
    HOME: { path: '/', file: '/index.html', public: true, requireAuth: false },
};

/**
 * Get current path from browser
 */
function getCurrentPath() {
    // Remove search params and hash
    const path = window.location.pathname;
    // Ensure path starts with /
    return path.startsWith('/') ? path : '/' + path;
}

/**
 * Navigate to a page
 * @param {string} path - Page path
 * @param {object} params - URL parameters
 */
export async function navigate(path, params = {}) {
    // Build URL
    let url = path;
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, value);
    });
    
    // Verificar permissão antes de navegar
    const page = findPageByPath(url);
    
    if (!page) {
        console.warn('Page not found, redirecting to login:', url);
        window.location.href = '/login';
        return;
    }
    
    // Verificar autenticação
    if (page.requireAuth && !obterUsuarioAtual()) {
        window.location.href = '/login';
        return;
    }
    
    // Update browser history
    window.history.pushState({ path: url }, '', url);
    
    // Load page
    await loadPage(url);
}

/**
 * Load page content dynamically
 * @param {string} path - Page path
 */
async function loadPage(path) {
    const page = findPageByPath(path);
    
    if (!page) {
        console.warn('Page not found:', path);
        // Fallback to login or home
        const fallback = obterUsuarioAtual() ? '/pages/login.html' : '/pages/login.html';
        const app = document.getElementById('app');
        if (app) {
            try {
                const response = await fetch(fallback);
                if (response.ok) {
                    app.innerHTML = await response.text();
                }
            } catch (e) {
                app.innerHTML = '<div class="error-page"><h1>Página não encontrada</h1></div>';
            }
        }
        return;
    }
    
    try {
        // Load HTML
        const response = await fetch(page.file);
        if (!response.ok) throw new Error(`Failed to load ${page.file}`);
        
        const html = await response.text();
        
        // Parse HTML and extract body content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Get the body content
        const bodyContent = doc.body.innerHTML;
        
        // Inject into app
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = bodyContent;
        }
        
        // Also inject any additional stylesheets from the page's head
        const existingStyles = document.querySelectorAll('link[data-dynamic]');
        existingStyles.forEach(style => style.remove());
        
        const links = doc.head.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = link.href;
            newLink.setAttribute('data-dynamic', 'true');
            document.head.appendChild(newLink);
        });
        
        // Load associated JS
        const jsFile = page.file.replace('.html', '.js');
        
        // Remove previous script if exists
        const existingScript = document.querySelector(`script[src="${jsFile}"]`);
        if (existingScript) {
            existingScript.remove();
        }
        
        const moduleScript = document.createElement('script');
        moduleScript.type = 'module';
        moduleScript.src = jsFile;
        document.body.appendChild(moduleScript);
        
        // Scroll to top
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Error loading page:', error);
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div class="error-page">
                    <h1>Erro ao carregar página</h1>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

/**
 * Find page configuration by path
 */
function findPageByPath(path) {
    // Normalize path
    const normalizedPath = path.split('?')[0].split('#')[0];
    
    // Direct match
    const directMatch = Object.values(PAGES).find(p => p.path === normalizedPath);
    if (directMatch) return directMatch;
    
    // Check for parameter paths
    const pathPattern = normalizedPath.split('/').filter(Boolean);
    
    for (const page of Object.values(PAGES)) {
        const pattern = page.path.split('/').filter(Boolean);
        if (pattern.length === pathPattern.length) {
            const match = pattern.every((p, i) => p.startsWith(':') || p === pathPattern[i]);
            if (match) return page;
        }
    }
    
    return null;
}

/**
 * Check if file exists
 */
async function checkFileExists(filepath) {
    try {
        const response = await fetch(filepath, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Setup router on page load
 */
export async function setupRouter() {
    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.path) {
            loadPage(event.state.path);
        } else {
            loadPage(getCurrentPath());
        }
    });
    
    // Load initial page based on URL
    const currentPath = getCurrentPath();
    
    // Se não tem path, redirecionar para login ou dashboard
    if (currentPath === '/' || currentPath === '') {
        const usuario = obterUsuarioAtual();
        const targetPath = usuario ? '/dashboard' : '/login';
        
        // Use replaceState to avoid history entry for redirect
        window.history.replaceState({ path: targetPath }, '', targetPath);
        await loadPage(targetPath);
        return;
    }
    
    // Verificar permissão
    const page = findPageByPath(currentPath);
    
    if (page && page.requireAuth && !obterUsuarioAtual()) {
        // Redirect to login
        window.history.replaceState({ path: '/login' }, '', '/login');
        await loadPage('/login');
        return;
    }
    
    // Initialize state
    if (!window.history.state || !window.history.state.path) {
        window.history.replaceState({ path: currentPath }, '', currentPath);
    }
    
    await loadPage(currentPath);
}

/**
 * Require authentication to access page
 * @param {string} requiredRole - optional role requirement ('profissional', 'cliente')
 * @returns {boolean}
 */
export function requireAuth(requiredRole = null) {
    const usuario = obterUsuarioAtual();
    
    if (!usuario) {
        navigate('/login');
        return false;
    }
    
    if (requiredRole && usuario.role !== requiredRole) {
        navigate('/login');
        return false;
    }
    
    return true;
}
