/**
 * Router Module
 * Reference: PLANO-MESTRE-TECNICO.md > Seção 5 (router.js)
 * 
 * Responsibility:
 * - Client-side routing without frameworks
 * - Page transitions
 * - Permission-based redirects
 */

const PAGES = {
    LOGIN: { path: '/login', file: 'pages/login.html' },
    CADASTRO: { path: '/cadastro', file: 'pages/cadastro.html' },
    DASHBOARD_PROF: { path: '/dashboard', file: 'pages/dashboard-profissional.html' },
    ONBOARDING: { path: '/onboarding', file: 'pages/onboarding.html' },
    AGENDA: { path: '/agenda', file: 'pages/agenda.html' },
    AGENDAMENTOS: { path: '/agendamentos', file: 'pages/agendamentos.html' },
    CLIENTES: { path: '/clientes', file: 'pages/clientes.html' },
    PERFIL: { path: '/perfil', file: 'pages/perfil.html' },
    PAGINA_PUBLICA: { path: '/agenda/:profissionalId', file: 'pages/pagina-publica.html' },
    LINK_AGENDAMENTO: { path: '/agendar/:profissionalId', file: 'pages/agendar-cliente.html' },
    CONFIRMACAO: { path: '/confirmacao/:agendamentoId', file: 'pages/confirmacao.html' },
};

const PUBLIC_PAGES = ['/login', '/cadastro', '/agenda/:profissionalId', '/agendar/:profissionalId'];

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
    const currentPath = window.location.pathname || '/login';
    await loadPage(currentPath);
}

/**
 * Redirect if permission denied
 */
export function requireAuth(requiredRole = null) {
    // This will be implemented in FASE 2
    // Check auth state and redirect if needed
}
