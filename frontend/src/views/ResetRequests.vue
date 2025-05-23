<template>
  <div class="reset-requests-container">
    <h2>Solicitudes</h2>
    <button @click="volverAlDashboard" class="back-button">Volver al Menu Principal</button>
    <div v-if="resetRequests.length > 0">
      <ul>
        <li v-for="request in resetRequests" :key="request._id">
          <strong>Usuario/Correo:</strong> {{ request.descripcion || 'No disponible' }} -
          <strong>Fecha/Hora:</strong> {{ new Date(request.createdAt).toLocaleString() }}
          <button @click="marcarComoAtendido(request._id)" class="mark-attended-button">Marcar como Atendido</button>
        </li>
      </ul>
    </div>
    <div v-else>
      <p>No hay solicitudes pendientes.</p>
    </div>
  </div>
</template>

<script>
// El script de ResetRequests.vue no necesita cambios por ahora
import axios from 'axios';

export default {
  data() {
    return {
      resetRequests: [],
    };
  },
  mounted() {
    this.obtenerSolicitudes();
  },
  methods: {
    async obtenerSolicitudes() {
      const token = localStorage.getItem('token');
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        try {
          const response = await axios.get('https://proyectodetitulo.onrender.com/api/reset-requests', config);
          this.resetRequests = response.data;
          // Agrega un console.log aquí para ver la estructura exacta que llega:
          console.log("Datos recibidos para solicitudes:", this.resetRequests);
        } catch (error) {
          console.error('Error al obtener las solicitudes de reset:', error);
          alert('Error al obtener las solicitudes de restablecimiento.');
        }
      }
    },
    async marcarComoAtendido(requestId) {
      const token = localStorage.getItem('token');
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        try {
          await axios.delete(`https://proyectodetitulo.onrender.com/api/reset-requests/${requestId}`, config);
          this.obtenerSolicitudes(); // Recargar la lista después de marcar como atendido
          alert('Solicitud marcada como atendida.');
          this.volverAlDashboard(); // Volver al dashboard después de marcar
        } catch (error) {
          console.error('Error al marcar como atendido:', error);
          alert('Error al marcar la solicitud como atendida.');
        }
      }
    },
    volverAlDashboard() {
      this.$router.push('/dashboard-supervisor');
    },
  },
};
</script>

<style scoped>
/* Tu estilo para ResetRequests.vue */
.reset-requests-container {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin: 20px auto;
  max-width: 600px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.back-button {
  background-color: #d9534f; /* Rojo - Volver al Menu Principal */
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.back-button:hover {
  background-color: #c9302c;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

li:last-child {
  border-bottom: none;
}

.mark-attended-button {
  background-color: #007bff; /* Azul - Marcar como Atendido */
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
}

.mark-attended-button:hover {
  background-color: #0056b3;
}
</style>