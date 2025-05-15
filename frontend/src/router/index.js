import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import DashboardEjecutivo from '../views/DashboardEjecutivo.vue';
import DashboardSupervisor from '../views/DashboardSupervisor.vue';

import IncidenciaSupervisor from '../views/IncidenciaSupervisor.vue';
import IncidenciasLista from '../views/IncidenciasLista.vue';
import AdministracionUsuarios from '../views/AdministracionUsuarios.vue';
import ListaSupervisor from '../views/ListaSupervisor.vue'; // Importa el nuevo componente

const routes = [
  { path: '/', component: LoginPage },
  { path: '/dashboard-ejecutivo', component: DashboardEjecutivo },
  { path: '/dashboard-supervisor', component: DashboardSupervisor },
  { path: '/incidencia', component: IncidenceForm },
  { path: '/incidencias/:id', component: IncidenciaSupervisor }, // Ruta para el detalle de la incidencia (supervisor)
  { path: '/incidencias-lista', component: IncidenciasLista }, // Ruta para la lista de incidencias (ejecutivo)
  { path: '/administracion', component: AdministracionUsuarios },
  { path: '/lista-supervisor', component: ListaSupervisor }, // Asegúrate de que esta ruta exista si la necesitas
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
