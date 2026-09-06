import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import AuthPage from '@/views/AuthPage.vue'

const routes = [
    {
        path: '/',
        name: 'Landing',
        component: LandingPage,
        meta: { title: 'Welcome to Jinni', requiresAuth: false }
    },
    {
        path: '/auth',
        name: 'Auth',
        component: AuthPage,
        meta: { title: 'Authentication', requiresAuth: false }
    },
    {
        path: '/onboarding',
        name: 'Onboarding',
        component: () => import('../views/OnboardingPage.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/business',
        name: 'BusinessLanding',
        component: () => import('@/views/BusinessLanding.vue'),
        meta: { title: 'Jinni for Business', requiresAuth: false }
    },
    {
        path: '/business/apply',
        name: 'BusinessApply',
        component: () => import('@/views/BusinessOnboarding.vue'),
        meta: { title: 'List Your Business on Jinni', requiresAuth: false }
    },
    {
        path: '/chat',
        name: 'JinniChat',
        component: () => import('@/views/JinniChat.vue'),
        meta: { title: 'Jinni', requiresAuth: true }
    },
    {
        path: '/explore',
        name: 'Explore',
        component: () => import('@/views/ExploreView.vue'),
        meta: { title: "Jinni's Discoveries", requiresAuth: true }
    },
    {
        path: '/map-selector',
        name: 'MapSelector',
        component: () => import('@/views/MapSelector.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/contact',
        name: 'ContactUs',
        component: () => import('@/views/ContactUs.vue'),
        meta: { title: 'Contact Us', requiresAuth: true }
    },
    {
        path: '/terms',
        name: 'Terms',
        component: () => import('@/views/TermsOfService.vue'),
        meta: { title: 'Terms of Service', requiresAuth: false }
    },
    {
        path: '/privacy',
        name: 'Privacy',
        component: () => import('@/views/PrivacyPolicy.vue'),
        meta: { title: 'Privacy Policy', requiresAuth: false }
    },
    {
        path: '/business/privacy',
        name: 'BusinessPrivacy',
        component: () => import('@/views/BusinessPrivacyPolicy.vue'),
        meta: { title: 'Business Privacy Policy', requiresAuth: false }
    },
    {
        path: '/business/terms',
        name: 'BusinessTerms',
        component: () => import('@/views/BusinessTermsOfService.vue'),
        meta: { title: 'Business Terms of Service', requiresAuth: false }
    },
    {
        path: '/admin',
        name: 'Admin',
        component: () => import('@/views/AdminDashboard.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin' }
    },
    {
        path: '/admin/businesses',
        name: 'StaffValidation',
        component: () => import('@/views/StaffValidation.vue'),
        meta: { requiresAuth: true, requiresStaff: true, title: 'Validation — Admin' }
    },
    {
        path: '/business/dashboard',
        name: 'BusinessDashboard',
        component: () => import('@/views/BusinessDashboard.vue'),
        meta: { requiresAuth: true, title: 'My Business — Jinni' }
    },
    {
        path: '/share/:token',
        name: 'JinniShare',
        component: () => import('@/views/JinniShare.vue'),
        meta: { public: true }   // skip auth guard for this route
    },
    {
        // Retention report for the marketing team — token-guarded server-side
        // (MARKETING_REPORT_TOKEN env); aggregate numbers only, safe to share.
        path: '/marketing/:token',
        name: 'MarketingReport',
        component: () => import('@/views/MarketingReport.vue'),
        meta: { public: true, title: 'Jinni — Growth & Retention' }
    },
    {
        // Same report for logged-in marketing accounts (staff with the
        // viewMarketing permission) and admins — no token in the URL.
        path: '/marketing',
        name: 'MarketingView',
        component: () => import('@/views/MarketingReport.vue'),
        meta: { requiresAuth: true, title: 'Jinni — Growth & Retention' }
    }
]

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior() { return { top: 0 } } })
const isValidToken = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch { return false }
};

/* ── iOS Safari bottom-bar tint workaround ──────────────────────────────────
 * Recent iOS Safari computes its bottom-bar/URL-pill tint ONLY at a real page
 * load — verified on device 2026-08-20: theme-color meta changes, html/body
 * repaints and even user scrolls do NOT re-tint it; only reload does. App.vue
 * therefore cannot fix it from inside the page. The Auth screen's overlay
 * bottoms (night radial → #000, day desert → #e0a082) differ from every other
 * page's bottom edge in BOTH themes, so entering or leaving Auth on iOS is a
 * REAL navigation. It happens once per login; assets are cached, so the
 * reload is barely visible. */
const IS_IOS = /iP(hone|ad|od)/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title || 'Jinni';
    if (to.meta.public) return next();
    if (to.name && from.name && to.name === from.name) {
        console.warn('⚠️ Preventing redirect loop:', to.name);
        return next(false);
    }
    // Crossing the Auth color boundary on iOS → real page load, so Safari
    // recomputes its bottom-bar tint. from.name is required: a fresh load
    // (OAuth returns, deep links) already tinted correctly.
    if (IS_IOS && from.name
        && (to.name === 'Auth') !== (from.name === 'Auth')) {
        window.location.href = to.fullPath;
        return next(false);
    }
    // NEW OAuth flow: the backend hands out a single-use ?code= instead of the
    // JWT itself (a token in the URL leaks to logs, history and Referer). Swap
    // the code for the token via POST, then continue exactly as before.
    if (to.query.code && to.query.provider === 'google') {
        try {
            const API = import.meta.env.VITE_API_BASE_URL || ''
            const res = await fetch(`${API}/api/auth/exchange`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: to.query.code }),
            })
            if (!res.ok) throw new Error('exchange_failed')
            const data = await res.json()
            localStorage.setItem('authToken', data.token)
            const payload = JSON.parse(atob(data.token.split('.')[1]))
            const userData = { id: payload.userId || payload.id, email: payload.email, name: payload.name, onboardingCompleted: payload.onboardingCompleted || false, isAdmin: payload.isAdmin || false, role: payload.role || (payload.isAdmin ? 'admin' : 'user'), businessId: payload.businessId || null }
            localStorage.setItem('user', JSON.stringify(userData))
            if (userData.onboardingCompleted) { return next({ name: 'JinniChat', replace: true }) }
            else { return next({ name: 'Onboarding', replace: true }) }
        } catch (error) {
            console.error('OAuth exchange error:', error)
            return next({ name: 'Auth', query: { error: 'oauth_failed' }, replace: true })
        }
    }
    // Legacy flow kept for one deploy cycle so logins already in flight when
    // this ships still complete. Safe to delete after release.
    if (to.query.token && to.query.provider === 'google') {
        try {
            const token = to.query.token
            const userDataParam = to.query.userData
            localStorage.setItem('authToken', token)
            let userData
            if (userDataParam) { userData = JSON.parse(decodeURIComponent(userDataParam)) } 
            else {
                const payload = JSON.parse(atob(token.split('.')[1]))
                userData = {id: payload.userId || payload.id, email: payload.email, name: payload.name, onboardingCompleted: payload.onboardingCompleted || false, isAdmin: payload.isAdmin || false, role: payload.role || (payload.isAdmin ? 'admin' : 'user'), businessId: payload.businessId || null}
            }
            localStorage.setItem('user', JSON.stringify(userData))
            console.log('Google OAuth successful, redirecting...')
            if (userData.onboardingCompleted) { return next({ name: 'JinniChat', replace: true }) } 
            else { return next({ name: 'Onboarding', replace: true }) }
        } catch (error) {
            console.error('OAuth processing error:', error)
            return next({ name: 'Auth', query: { error: 'oauth_failed' }, replace: true })
        }
    }
    if (to.query.error && ['google_failed', 'token_generation_failed'].includes(to.query.error)) {
        console.error('OAuth Error:', to.query.error)
        return next({ name: 'Auth', query: { error: to.query.error }, replace: true })
    }
    const authToken = localStorage.getItem('authToken');
    const tokenValid = authToken && isValidToken(authToken);
    let user = null;
    try { 
        const userData = localStorage.getItem('user');
        if (userData) { user = JSON.parse(userData) }
    } catch (e) { 
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
    }
    const publicRoutes = ['Landing', 'Auth', 'Privacy', 'Terms', 'BusinessPrivacy', 'BusinessTerms', 'BusinessLanding', 'BusinessApply'];
    if (!to.meta.requiresAuth) {
        if (to.name === 'Privacy' || to.name === 'Terms' || to.name === 'BusinessPrivacy' || to.name === 'BusinessTerms') { return next() }
        if (tokenValid && publicRoutes.includes(to.name)) { 
            if (to.name === 'BusinessApply' || to.name === 'BusinessLanding') { return next() }
            if (user?.role === 'staff') {
                // Marketing-only staff live on the report page, not the queue
                const sp = user?.staffPermissions || {}
                const marketingOnly = sp.viewMarketing && !sp.validateBusinesses && !sp.manageDestinations && !sp.moderateExplore
                return next({ name: marketingOnly ? 'MarketingView' : 'StaffValidation' })
            }
            if (user?.isAdmin || user?.role === 'admin') { return next({ name: 'Admin' }) }
            if (user?.businessId) { return next({ name: 'BusinessDashboard' }) }
            return next({ name: user?.onboardingCompleted ? 'JinniChat' : 'Onboarding' });
        }
        return next();
    }
    if (!tokenValid) {
        if (authToken) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
        }
        return next({ name: 'Auth', query: { redirect: to.fullPath } });
    }
    // Staff — locked to their working page(s) plus a few utility routes.
    // Validators live on StaffValidation; marketing-only staff (viewMarketing
    // permission, nothing else) live on the Growth & Retention report.
    if (user?.role === 'staff') {
        const sp = user?.staffPermissions || {}
        const marketingOnly = sp.viewMarketing && !sp.validateBusinesses && !sp.manageDestinations && !sp.moderateExplore
        const staffRoutes = ['ContactUs', 'Terms', 'Privacy', 'BusinessPrivacy', 'BusinessTerms']
        if (sp.viewMarketing) staffRoutes.push('MarketingView')
        if (!marketingOnly) staffRoutes.push('StaffValidation')
        const home = marketingOnly ? 'MarketingView' : 'StaffValidation'
        if (!staffRoutes.includes(to.name)) { return next({ name: home }) }
        return next()
    }
    // Business owners go to their dashboard, not traveler onboarding/chat
    if (user?.businessId && !user?.isAdmin) {
        const bizRoutes = ['BusinessDashboard', 'BusinessApply', 'BusinessLanding', 'JinniChat', 'Explore', 'ContactUs', 'Onboarding', 'MapSelector', 'Terms', 'Privacy', 'BusinessPrivacy', 'BusinessTerms']
        if (!bizRoutes.includes(to.name)) { return next({ name: 'BusinessDashboard' }) }
        return next()
    }
    const needsOnboarding = !user?.onboardingCompleted && to.name !== 'Onboarding';
    const completedOnboarding = user?.onboardingCompleted && to.name === 'Onboarding' && !to.query.editing && from.name !== 'MapSelector';
    if (needsOnboarding) { return next({ name: 'Onboarding' }) }
    if (completedOnboarding) { return next({ name: 'JinniChat' }) }
    if (to.meta.requiresAdmin) { if (!user?.isAdmin && user?.role !== 'admin') { return next({ name: 'JinniChat' }) } }
    if (to.meta.requiresStaff) {
        // Staff-allowed routes: staff OR admin can pass
        const allowed = user?.role === 'staff' || user?.role === 'admin' || user?.isAdmin
        if (!allowed) { return next({ name: 'JinniChat' }) }
    }
    next();
});

/* ── Stale-chunk recovery ────────────────────────────────────────────────────
 * After a redeploy, a browser still holding the previous index.html asks for
 * route chunks that no longer exist; Caddy answers with the SPA fallback
 * (text/html), the dynamic import throws "'text/html' is not a valid
 * JavaScript MIME type", and the navigation silently dies — the user logs in,
 * sees "Welcome back", and stays on the auth page until a manual refresh.
 * A full reload at the SAME destination fetches the fresh index.html and its
 * new chunk names, which is exactly what that manual refresh was doing.
 * One attempt per minute, so a genuinely broken deploy can't reload-loop. */
const CHUNK_ERR = /error loading dynamically imported module|failed to fetch dynamically imported module|importing a module script failed|not a valid javascript mime type/i;
function recoverFromStaleChunk(to) {
    const last = Number(sessionStorage.getItem('jinni_chunk_reload') || 0);
    if (Date.now() - last < 60000) return;             // already tried — don't loop
    sessionStorage.setItem('jinni_chunk_reload', String(Date.now()));
    window.location.href = to || window.location.href; // full reload → fresh index.html
}
router.onError((error, to) => {
    if (CHUNK_ERR.test(String(error && error.message))) {
        recoverFromStaleChunk(to && to.fullPath);
    }
});
// Vite fires this for failed preloads (CSS and sibling chunks) that never
// reach router.onError.
window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    recoverFromStaleChunk();
});

export default router;