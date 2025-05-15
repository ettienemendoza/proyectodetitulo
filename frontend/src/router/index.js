import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import DashboardEjecutivo from '../views/DashboardEjecutivo.vue';
import DashboardSupervisor from '../views/DashboardSupervisor.vue';
import IncidenceForm from '../components/IncidenceForm.vue';
import IncidenciaDetalle from '../views/IncidenciaDetalle.vue';
import IncidenciasLista from '../views/IncidenciasLista.vue';
import AdministracionUsuarios from '../views/AdministracionUsuarios.vue';
import IncidenciaSupervisor from '@/views/IncidenciaSupervisor.vue';

const routes = [
  { path: '/', component: LoginPage },
  { path: '/dashboard-ejecutivo', component: DashboardEjecutivo },
  { path: '/dashboard-supervisor', component: DashboardSupervisor },
  { path: '/incidencia', component: IncidenceForm },
  { path: '/incidencia-detalle', component: IncidenciaDetalle },
  { path: '/incidencias-lista', component: IncidenciasLista },
  { path: '/administracion', component: AdministracionUsuarios },
  {
    path: '/incidencias/:id', // Asegúrate de que el parámetro :id esté aquí
    name: 'IncidenciaSupervisor',
    component: IncidenciaSupervisor,
    meta: { requiresAuth: true, rol: 'supervisor' }, // Si usas autenticación
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
