<template>
  <div class="supervisor-container">
    <div class="background-image-overlay"></div>
    <div class="content">
      <div class="supervisor-header">
        <h1>Supervisor</h1>
        <h3>¿Qué deseas hacer?</h3>
      </div>
      <div class="supervisor-options">
        <div class="option-card" @click="irAGrafico">
          <h3>Gráfico de Estadísticas</h3>
        </div>
        <div class="option-card" @click="irAListaSupervisor">
          <h3>Lista de Incidencias</h3>
        </div>
        <div class="option-card relative" @click="irAResetRequests">
          <h3>Solicitudes de Reset</h3>
          <span v-if="resetRequestCount > 0" class="notification-badge">{{ resetRequestCount }}</span>
        </div>
        <div class="option-card" @click="irAAdministracion">
          <h3>Administración</h3>
        </div>
      </div>
      <button class="logout-button" @click="cerrarSesion">
        CERRAR SESIÓN
        <span class="logout-icon">🚪</span>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      resetRequestCount: 0,
    };
  },
  mounted() {
    this.obtenerConteoSolicitudes();
    // Actualizar el conteo periódicamente (opcional)
    this.interval = setInterval(this.obtenerConteoSolicitudes, 5000);
  },
  beforeUnmount() {
    clearInterval(this.interval); // Limpiar el intervalo al desmontar el componente
  },
  methods: {
    async obtenerConteoSolicitudes() {
      const token = localStorage.getItem('token');
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        try {
          const response = await axios.get('https://proyectodetitulo.onrender.com/api/reset-requests/count', config);
          this.resetRequestCount = response.data.count;
        } catch (error) {
          console.error('Error al obtener el conteo de solicitudes de reset:', error);
        }
      }
    },
    irAGrafico() {
      this.$router.push('/graficos-supervisor');
    },
    irAListaSupervisor() {
      this.$router.push('/lista-supervisor');
    },
    irAAdministracion() {
      this.$router.push('/administracion');
    },
    irAResetRequests() {
      this.$router.push('/reset-requests');
    },
    cerrarSesion() {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('usuario');
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
/* dashboardsupervisor.vue */
.supervisor-container {
  text-align: center;
  padding: 20px;
  background-color: #f2f2f2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  position: relative; /* Necesario para el z-index del overlay */
}

/* ... (tus estilos existentes) */

.supervisor-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  z-index: 1; /* Asegura que esté encima del content */
  position: relative; /* Para posicionar el badge */
}

.notification-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 5px 8px;
  font-size: 0.8em;
  z-index: 2;
}
</style>