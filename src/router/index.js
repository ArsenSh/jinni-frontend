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
        meta: { title: "Jinni's Eye", requiresAuth: true }
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

router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title || 'Jinni';
    if (to.meta.public) return next();
    if (to.name && from.name && to.name === from.name) {
        console.warn('⚠️ Preventing redirect loop:', to.name);
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
            if (user?.role === 'staff') { return next({ name: 'StaffValidation' }) }
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
    // Staff (validation-only role) — locked to StaffValidation and a few utility routes
    if (user?.role === 'staff') {
        const staffRoutes = ['StaffValidation', 'ContactUs', 'Terms', 'Privacy', 'BusinessPrivacy', 'BusinessTerms']
        if (!staffRoutes.includes(to.name)) { return next({ name: 'StaffValidation' }) }
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

export default router;