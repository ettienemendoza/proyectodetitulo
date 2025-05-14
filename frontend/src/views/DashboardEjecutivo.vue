<template>
  <div class="dashboard-container">
    <div class="sidebar">
      <button class="sidebar-button" @click="navegarAIncidencias">Lista de Incidencias</button>
    </div>
    <div class="main-content">
      <div class="incidence-form-container">
        <h2>Formulario de Incidencia</h2>

        <!-- Tipo de error -->
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

        <!-- Campo para especificar otro tipo de error -->
        <div class="form-group" v-if="mostrarOtroTipoError">
          <div class="form-label">
            <label for="otroTipoError">Especificar Otro Error:</label>
          </div>
          <div class="form-input">
            <input type="text" id="otroTipoError" v-model="incidencia.otroTipoError" placeholder="Ingrese el tipo de error" />
          </div>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <div class="form-label">
            <label for="descripcion">Descripción:</label>
          </div>
          <div class="form-input">
            <textarea id="descripcion" v-model="incidencia.description" placeholder="Ingrese la descripción del error"></textarea>
          </div>
        </div>

        <!-- Comentarios (solo visible para el supervisor) -->
        <div v-if="usuario.rol === 'supervisor'" class="form-group">
          <div class="form-label">
            <label for="comentarios">Comentarios:</label>
          </div>
          <div class="form-input">
            <textarea id="comentarios" v-model="incidencia.comments" placeholder="Ingrese los comentarios del error"></textarea>
          </div>
        </div>

        <!-- Botón de agregar -->
        <button @click="guardarIncidencia" class="agregar-button">Agregar</button>
      </div>
    </div>
  </div>
</template>

<script>
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
      usuario: {}, // Aquí guardamos los datos del usuario logueado
    };
  },
  mounted() {
    // Asignamos el nombre del usuario logueado al nombre ejecutivo
    this.usuario = JSON.parse(localStorage.getItem('usuario')) || {}; // Recuperamos el usuario logueado desde localStorage
    this.incidencia.executiveName = this.usuario.nombre || ''; // Asignamos el nombre del usuario logueado automáticamente
  },
  methods: {
    mostrarInputOtros() {
      this.mostrarOtroTipoError = (this.incidencia.type === 'Otros');
      if (!this.mostrarOtroTipoError) {
        this.incidencia.otroTipoError = '';
      }
    },
    guardarIncidencia() {
      // Asignamos los valores de fecha y hora
      this.incidencia.fecha = new Date().toLocaleDateString();
      this.incidencia.hora = new Date().toLocaleTimeString();

      // Obtener el token del localStorage
      const token = localStorage.getItem('token');

      // Verificar que todos los campos estén completos antes de enviar
      if (!this.incidencia.type || !this.incidencia.description || !this.incidencia.executiveName) {
        alert('Por favor complete todos los campos');
        return;
      }

      // Configurar los headers para enviar el token
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Enviar la incidencia al backend
      axios.post('https://proyectodetitulo.onrender.com/api/incidencias', this.incidencia, config)
        .then(response => {
          console.log('Incidencia registrada:', response);
          this.navegarAIncidencias();
        })
        .catch(error => {
          console.error('Error al agregar la incidencia:', error);
        });
    },
    navegarAIncidencias() {
      this.$router.push('/incidencias-lista');
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 200px;
  background-color: #b81e1e;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sidebar-button {
  background-color: #f0f0f0;
  color: #333;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.sidebar-button:hover {
  background-color: #e0e0e0;
}

.main-content {
  flex: 1;
  background-color: #d8d8d8;
  padding: 20px;
}

.incidence-form-container {
  background-color: white;
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
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
