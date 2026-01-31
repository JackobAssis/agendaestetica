/**
 * Router Module
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 5 (router.js)
 * 
 * Responsibility:
 * - Client-side routing without frameworks
 * - Page transitions
 * - Permission-based redirects
 * - Authentication checks
 */

import { obterUsuarioAtual } from './modules/auth.js';

const PAGES = {
    LOGIN: { path: '/login', file: 'pages/login.html', public: true, requireAuth: false },
    DASHBOARD_PROF: { path: '/dashboard', file: 'pages/dashboard.html', public: false, requireAuth: true },
    ONBOARDING: { path: '/onboarding', file: 'pages/onboarding.html', public: false, requireAuth: true },
    AGENDA: { path: '/agenda', file: 'pages/agenda.html', public: false, requireAuth: true },
    AGENDAMENTOS: { path: '/agendamentos', file: 'pages/agendamentos.html', public: false, requireAuth: true },
    CLIENTES: { path: '/clientes', file: 'pages/clientes.html', public: false, requireAuth: true },
    PERFIL: { path: '/perfil', file: 'pages/perfil.html', public: false, requireAuth: true },
    PAGINA_PUBLICA: { path: '/agenda/:profissionalId', file: 'pages/pagina-publica.html', public: true, requireAuth: false },
    LINK_AGENDAMENTO: { path: '/agendar/:profissionalId', file: 'pages/agendar-cliente.html', public: true, requireAuth: false },
    CONFIRMACAO: { path: '/confirmacao', file: 'pages/confirmacao.html', public: true, requireAuth: false },
};

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
        console.error('Page not found:', url);
        navigate('/login');
        return;
    }
    
    // Verificar autenticação
    if (page.requireAuth && !obterUsuarioAtual()) {
        navigate('/login');
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
        console.error('Page not found:', path);
        navigate('/login');
        return;
    }
    
    try {
        // Load HTML
        const response = await fetch(page.file);
        if (!response.ok) throw new Error(`Failed to load ${page.file}`);
        
        const html = await response.text();
        
        // Inject into app
        const app = document.getElementById('app');
        app.innerHTML = html;
        
        // Load associated JS
        const jsFile = page.file.replace('.html', '.js');
        const scriptExists = await checkFileExists(jsFile);
        
        if (scriptExists) {
            const moduleScript = document.createElement('script');
            moduleScript.type = 'module';
            moduleScript.src = jsFile;
            document.body.appendChild(moduleScript);
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
        
    } catch (error) {
        console.error('Error loading page:', error);
        document.getElementById('app').innerHTML = `
            <div class="error-page">
                <h1>Erro ao carregar página</h1>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/**
 * Find page configuration by path
 */
function findPageByPath(path) {
    // Direct match
    if (PAGES[Object.keys(PAGES).find(key => PAGES[key].path === path)]) {
        return PAGES[Object.keys(PAGES).find(key => PAGES[key].path === path)];
    }
    
    // Check for parameter paths
    const pathPattern = path.split('/').filter(Boolean);
    
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
    window.addEventListener('popstate', () => {
        loadPage(window.location.pathname);
    });
    
    // Load initial page based on URL
    let currentPath = window.location.pathname || '/login';
    
    // Se não tem path, redirecionar para login ou dashboard
    if (currentPath === '/' || currentPath === '') {
        const usuario = obterUsuarioAtual();
        currentPath = usuario ? '/dashboard' : '/login';
    }
    
    // Verificar permissão
    const page = findPageByPath(currentPath);
    
    if (page && page.requireAuth && !obterUsuarioAtual()) {
        currentPath = '/login';
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
