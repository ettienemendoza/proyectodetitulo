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

      <div class="option-card" @click="irAListaIncidencias">
        <h3>Lista de Incidencias</h3>
      </div>

      <div class="option-card" @click="irAAdministracion">
        <h3>Administración</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    // Redirige a la vista de gráfico de estadísticas
    irAGrafico() {
      this.$router.push('/grafico-estadisticas');
    },

    // Redirige a la vista de lista de incidencias
    irAListaIncidencias() {
      this.$router.push('/lista-supervisor'); // Cambiado a la lista general
    },

    // Redirige a la vista de administración de usuarios
    irAAdministracion() {
      this.$router.push('/administracion');
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
}

.supervisor-header {
  background-color: #b81e1e;
  color: white;
  padding: 10px;
  margin-bottom: 30px;
}

.supervisor-options {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.option-card {
  background-color: #b81e1e;
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

h3 {
  font-size: 18px;
  font-weight: bold;
}
</style>
