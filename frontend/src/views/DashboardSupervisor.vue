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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  /* Eliminamos la imagen de fondo aquí */
}

.background-image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/supervisor.jpg'); /* Ruta a tu imagen */
  background-size: cover;
  background-position: center top;
  filter: grayscale(100%); /* Aplica el filtro solo a la capa de la imagen */
  z-index: -1; /* Envía la capa de la imagen detrás del contenido */
}

.supervisor-header {
  background-color: #b81e1e; /* Color de fondo rojo sólido */
  color: white;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
  z-index: 0; /* Asegura que esté encima del overlay */
}

.supervisor-header h1,
.supervisor-header h3 {
  background-color: transparent;
  padding: 5px 0;
  margin: 0;
}

.supervisor-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
  z-index: 0; /* Asegura que esté encima del overlay */
}

.option-card {
  background-color: #b81e1e; /* Color de fondo rojo sólido */
  color: white;
  padding: 30px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 200px;
  z-index: 0; /* Asegura que esté encima del overlay */
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
  z-index: 0; /* Asegura que esté encima del overlay */
}

.logout-button:hover {
  background-color: #555;
}

.logout-icon {
  margin-left: 5px;
  font-size: 1.2em;
}
</style>