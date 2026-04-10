import { createRouter, createWebHashHistory } from 'vue-router'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth' // Importante para o F5
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import CustosView from '../views/CustosView.vue'
import InvestimentosView from '../views/investimentosView.vue'

const routes = [
    {
        path: '/',
        name: 'Login',
        component: LoginView
    },
    {
        path: '/home',
        name: 'Home',
        component: HomeView,
        meta: { requiresAuth: true }
    },
    {
        path: '/custos',
        name: 'Custos',
        component: CustosView,
        meta: { requiresAuth: true }
    },
    {
        path: '/investimentos',
        name: 'Investimentos',
        component: InvestimentosView,
        meta: { requiresAuth: true }
    }

]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
            auth,
            (user) => {
                removeListener();
                resolve(user);
            },
            reject
        );
    });
};

router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
    
    const user = await getCurrentUser();

    if (requiresAuth && !user) {
        next('/'); 
    } else if (to.path === '/' && user) {

        next('/home');
    } else {
        next();
    }
});

export default router;