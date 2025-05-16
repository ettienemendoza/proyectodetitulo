<template>
  <div class="supervisor-container">
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

      <div class="option-card" @click="irAAdministracion">
        <h3>Administración</h3>
      </div>
    </div>
    <button class="logout-button" @click="cerrarSesion">
      CERRAR SESIÓN
      <span class="logout-icon">🚪</span>
    </button>
  </div>
</template>

<script>
export default {
  methods: {
    // Redirige a la vista de gráfico de estadísticas
    irAGrafico() {
      this.$router.push('/graficos-supervisor');
    },

    // Redirige a la vista de lista de incidencias
    irAListaSupervisor() {
      this.$router.push('/lista-supervisor');
    },

    // Redirige a la vista de administración de usuarios
    irAAdministracion() {
      this.$router.push('/administracion');
    },
    cerrarSesion() {
      // Eliminar el token y la información del usuario del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      localStorage.removeItem('usuario');

      // Redirigir al usuario a la página de inicio de sesión (asumiendo que la ruta es '/')
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.supervisor-container {
  text-align: center;
  padding: 20px;
  background-color: #f2f2f2;
  min-height: 100vh;
  background-image: url('@/assets/supervisor.jpg'); /* Ruta a tu imagen */
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Alinea los elementos desde la parte superior */
}

.supervisor-header {
  background-color: rgba(184, 30, 30, 0.8); /* Fondo con transparencia para mejor legibilidad */
  color: white;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 10px;
}

.supervisor-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px; /* Espacio antes del botón de cerrar sesión */
}

.option-card {
  background-color: rgba(184, 30, 30, 0.9); /* Fondo con transparencia */
  color: white;
  padding: 30px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 200px;
}

.option-card:hover {
  background-color: #8c1414;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 5px;
}

h3 {
  font-size: 1.5em;
  font-weight: bold;
}

.logout-button {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #555;
}

.logout-icon {
  margin-left: 5px;
  font-size: 1.2em;
}
</style>