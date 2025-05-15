<template>
  <div class="incidence-detail-container">
    <div class="sidebar">
      <button class="sidebar-button" @click="navegarADashboard">Volver al Dashboard</button>
    </div>
    <div class="main-content">
      <h2>Detalle de Incidencia</h2>
      <div v-if="incidencia">
        <div class="incidence-form-container">
          <div class="form-group">
            <div class="form-label">
              <label>Tipo de Incidencia:</label>
            </div>
            <div class="form-input">
              <input type="text" v-model="incidencia.type" :disabled="!isEditing" />
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">
              <label>Descripción:</label>
            </div>
            <div class="form-input">
              <textarea v-model="incidencia.description" :disabled="!isEditing"></textarea>
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">
              <label>Nombre Ejecutivo:</label>
            </div>
            <div class="form-input">
              <input type="text" v-model="incidencia.executiveName" disabled />
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">
              <label>Fecha:</label>
            </div>
             <div class="form-input">
              <input type="text"  :value="new Date(incidencia.createdAt).toLocaleDateString()" disabled />
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">
              <label>Hora:</label>
            </div>
            <div class="form-input">
               <input type="text" :value="new Date(incidencia.updatedAt).toLocaleTimeString()" disabled />
            </div>
          </div>
          <div class="form-group">
            <div class="form-label">
              <label>Comentarios:</label>
            </div>
            <div class="form-input">
              <textarea v-model="incidencia.comments" :disabled="!isEditing"></textarea>
            </div>
          </div>

          <div class="button-group">
            <button v-if="!isEditing" @click="editarIncidencia" class="edit-button">Editar</button>
            <button v-if="isEditing" @click="guardarIncidencia" class="save-button">Guardar</button>
            <button @click="borrarIncidencia" class="delete-button">Borrar</button>
             <button  @click="navegarADashboard" class="back-button">Volver al Dashboard</button>
          </div>
        </div>
      </div>
       <div v-else>
        <p>No se ha seleccionado ninguna incidencia.</p>
       </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      incidencia: null,
      isEditing: false,
      usuario: {},
    };
  },
  mounted() {
    this.obtenerIncidencia();
     this.usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  },
  methods: {
   async obtenerIncidencia() {
      const token = localStorage.getItem('token');
      const id = this.$route.params.id; // Obtiene el ID de la ruta

      if (!token) {
        console.error('Token no proporcionado');
        alert('Por favor, inicie sesión');
        this.$router.push('/');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.get(`https://proyectodetitulo.onrender.com/api/incidencias/${id}`, config);
        this.incidencia = response.data;
      } catch (error) {
        console.error('Error al cargar la incidencia:', error);
        alert('Error al cargar la incidencia');
        this.$router.push('/incidencias-lista'); // Redirige a la lista
      }
    },
    editarIncidencia() {
      this.isEditing = true;
    },
    async guardarIncidencia() {
      const token = localStorage.getItem('token');
      const id = this.$route.params.id;

      if (!token) {
        console.error('Token no proporcionado');
        alert('Por favor, inicie sesión');
        this.$router.push('/');
        return;
      }

       const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const response = await axios.put(
          `https://proyectodetitulo.onrender.com/api/incidencias/${id}`,
          this.incidencia,
          config
        );
        console.log('Incidencia actualizada:', response.data);
        alert('Incidencia actualizada exitosamente');
        this.isEditing = false;
        this.obtenerIncidencia();
      } catch (error) {
        console.error('Error al actualizar la incidencia:', error);
        alert('Error al actualizar la incidencia');
      }
    },
    async borrarIncidencia() {
      const token = localStorage.getItem('token');
       const id = this.$route.params.id;
      if (!token) {
        console.error('Token no proporcionado');
        alert('Por favor, inicie sesión');
        this.$router.push('/');
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (confirm('¿Estás seguro de que deseas eliminar esta incidencia?')) {
        try {
          await axios.delete(`https://proyectodetitulo.onrender.com/api/incidencias/${id}`, config);
          console.log('Incidencia eliminada');
          alert('Incidencia eliminada exitosamente');
          this.navegarADashboard();
        } catch (error) {
          console.error('Error al eliminar la incidencia:', error);
          alert('Error al eliminar la incidencia');
        }
      }
    },
    navegarADashboard() {
      this.$router.push('/dashboard-supervisor');
    },
  },
};
</script>


<style scoped>
.incidence-detail-container {
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

.sidebar-button:hover {
  background-color: #e0e0e0;
}

.main-content {
  flex: 1;
  background-color: #d8d8d8;
  padding: 20px;
  overflow-y: auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #444;
  color: #b81e1e;
}

.incidence-form-container {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-label {
  text-align: left;
  margin-bottom: 5px;
  color: #666;
  font-weight: bold;
}

.form-input {
  flex: 1;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 10px;
}

textarea {
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}
.edit-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
.edit-button:hover {
  background-color: #45a049;
}

.save-button {
  background-color: #2196F3;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-button:hover {
  background-color: #1976D2;
}

.delete-button {
  background-color: #b81e1e;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #a71010;
}

.back-button {
  background-color: #333;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #222;
}
</style>
