<template>
  <div class="dashboard-container">
    <div class="sidebar">
      <button class="sidebar-button" @click="navegarAIncidencias">Lista de Incidencias</button>
      <button class="sidebar-button logout-button" @click="cerrarSesion">
        CERRAR SESIÓN
        <span class="logout-icon">🚪</span> </button>
    </div>
    <div class="main-content">
      <div class="incidence-form-container">
        <h2>Formulario de Incidencia</h2>

        <div class="form-group">
          <div class="form-label">
            <label for="tipoError">Tipo de Error:</label>
          </div>
          <div class="form-input">
            <select id="tipoError" v-model="incidencia.type" @change="mostrarInputOtros">
              <option value="">Seleccione un tipo de error</option>
              <option value="Biometría">Biometría</option>
              <option value="Fallo de preguntas">Fallo de preguntas</option>
              <option value="Problemas en el sistema">Problemas en el sistema</option>
              <option value="Sin preguntas">Sin preguntas</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
        </div>

        <div class="form-group" v-if="mostrarOtroTipoError">
          <div class="form-label">
            <label for="otroTipoError">Especificar Otro Error:</label>
          </div>
          <div class="form-input">
            <input type="text" id="otroTipoError" v-model="incidencia.otroTipoError" placeholder="Ingrese el tipo de error" />
          </div>
        </div>

        <div class="form-group">
          <div class="form-label">
            <label for="descripcion">Descripción:</label>
          </div>
          <div class="form-input">
            <textarea id="descripcion" v-model="incidencia.description" placeholder="Ingrese la descripción del error"></textarea>
          </div>
        </div>

        <div v-if="usuario.rol === 'supervisor'" class="form-group">
          <div class="form-label">
            <label for="comentarios">Comentarios:</label>
          </div>
          <div class="form-input">
            <textarea id="comentarios" v-model="incidencia.comments" placeholder="Ingrese los comentarios del error"></textarea>
          </div>
        </div>

        <button @click="guardarIncidencia" class="agregar-button">Agregar</button>
      </div>
    </div>
  </div>
</template>

<script>
// dashboardejecutivo.vue
import axios from 'axios';

export default {
  data() {
    return {
      incidencia: {
        type: '',
        otroTipoError: '',
        description: '',
        executiveName: '',
        comments: '',
        fecha: '',
        hora: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      mostrarOtroTipoError: false,
      usuario: {},
    };
  },
  mounted() {
    this.usuario = JSON.parse(localStorage.getItem('usuario')) || {};
    this.incidencia.executiveName = this.usuario.nombre || '';
  },
  methods: {
    mostrarInputOtros() {
      this.mostrarOtroTipoError = (this.incidencia.type === 'Otros');
      if (!this.mostrarOtroTipoError) {
        this.incidencia.otroTipoError = '';
      }
    },
    guardarIncidencia() {
      this.incidencia.fecha = new Date().toLocaleDateString();
      this.incidencia.hora = new Date().toLocaleTimeString();

      const token = localStorage.getItem('token');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (!this.incidencia.type || !this.incidencia.description || !this.incidencia.executiveName) {
        alert('Por favor complete todos los campos');
        return;
      }

      axios.post('https://proyectodetitulo.onrender.com/api/incidencias', this.incidencia, config)
        .then(response => {
          console.log('Incidencia registrada:', response);
          this.navegarAIncidencias();
        })
        .catch(error => {
          console.error('Error al agregar la incidencia:', error);
          alert('Error al registrar la incidencia');
        });
    },
    navegarAIncidencias() {
      this.$router.push('/incidencias-lista');
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
/* dashboardejecutivo.vue */
.dashboard-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: #b81e1e;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 20px;
}

.sidebar-button {
  background-color: #f0f0f0;
  color: #333;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;
  width: 80%;
  text-align: center;
}

.sidebar>button:first-child {
  margin-top: 100px;
  margin-bottom: 100px;
}

.sidebar-button:hover {
  background-color: #e0e0e0;
}

.logout-button {
  margin-top: auto;
  margin-bottom: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-icon {
  margin-left: 5px;
  font-size: 1.2em;
}

.main-content {
  flex: 1;
  background-color: #d8d8d8;
  padding: 20px;
}

.incidence-form-container {
  background-color: rgb(183, 184, 194);
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 500px;
  margin: 20px auto;
}

.form-group {
  display: flex;
  margin-bottom: 15px;
  align-items: center;
}

.form-label {
  width: 150px;
  text-align: right;
  padding-right: 10px;
}

label {
  display: inline-block;
  margin-bottom: 0;
  color: #666;
}

.form-input {
  flex: 1;
}

input,
select,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.agregar-button {
  background-color: #b81e1e;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

.agregar-button:hover {
  background-color: #45a049;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #444;
}
</style>