import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import DashboardEjecutivo from '../views/DashboardEjecutivo.vue';
import DashboardSupervisor from '../views/DashboardSupervisor.vue';
import IncidenciasLista from '../views/IncidenciasLista.vue';
import AdministracionUsuarios from '../views/AdministracionUsuarios.vue';
import ListaSupervisor from '../views/ListaSupervisor.vue';
import GraficosSupervisor from '../views/GraficosSupervisor.vue'; 

const routes = [
  { path: '/', component: LoginPage },
  { path: '/dashboard-ejecutivo', component: DashboardEjecutivo, meta: { requiresAuth: true, rol: 'ejecutivo' } },
  { path: '/dashboard-supervisor', component: DashboardSupervisor, meta: { requiresAuth: true, rol: 'supervisor' } },
  { path: '/incidencias-lista', component: IncidenciasLista, meta: { requiresAuth: true, rol: 'ejecutivo' } },
  { path: '/administracion', component: AdministracionUsuarios },
  { path: '/lista-supervisor', component: ListaSupervisor, meta: { requiresAuth: true, rol: 'supervisor' } }, // Nueva ruta para la lista del supervisor
  { path: '/graficos-supervisor', component: GraficosSupervisor, meta: { requiresAuth: true, rol: 'supervisor' } }, // Agregar la ruta para el componente GraficosSupervisor
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  const userRole = localStorage.getItem('rol');

  if (requiresAuth && !localStorage.getItem('token')) {
    next('/');
  } else if (requiresAuth && userRole !== to.meta.rol) {
    next('/dashboard-' + userRole);
  } else {
    next();
  }
});

export default router;
