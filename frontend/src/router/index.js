import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import DashboardEjecutivo from '../views/DashboardEjecutivo.vue';
import DashboardSupervisor from '../views/DashboardSupervisor.vue';
import IncidenciaSupervisor from '../views/IncidenciaSupervisor.vue';
import IncidenciasLista from '../views/IncidenciasLista.vue';
import AdministracionUsuarios from '../views/AdministracionUsuarios.vue';
import ListaSupervisor from '../views/ListaSupervisor.vue';
import GraficosSupervisor from '@/views/GraficosSupervisor.vue';

const routes = [
  { path: '/', component: LoginPage },
  { path: '/dashboard-ejecutivo', component: DashboardEjecutivo },
  { path: '/dashboard-supervisor', component: DashboardSupervisor },
  { path: '/incidencias/:id', component: IncidenciaSupervisor }, // Ruta para el detalle de la incidencia (supervisor)
  { path: '/incidencias-lista', component: IncidenciasLista }, // Ruta para la lista de incidencias (ejecutivo y supervisor)
  { path: '/administracion', component: AdministracionUsuarios },
  { path: '/lista-supervisor', component: ListaSupervisor },
  {path: '/graficos-supervisor', component: GraficosSupervisor},
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;