<template>
  <div class="incidencias-lista-container">
    <div class="sidebar">
      <button class="sidebar-button" @click="navegarADashboard">Volver al Menu Principal</button>
    </div>
    <div class="main-content">
      <h2>Lista de Incidencias</h2>
      <div class="tabla-container">
        <table class="incidencias-tabla">
          <thead>
            <tr>
              <th>Tipo de Incidencia</th>
              <th>Descripción</th>
              <th>Nombre Ejecutivo</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="incidencia in incidencias" :key="incidencia._id">
              <td>
                <input v-if="editingId === incidencia._id" v-model="editedIncidencia.type" />
                <span v-else>{{ incidencia.type }}</span>
              </td>
              <td>
                <textarea v-if="editingId === incidencia._id" v-model="editedIncidencia.description"></textarea>
                <span v-else>{{ incidencia.description }}</span>
              </td>
              <td>{{ incidencia.executiveName }}</td>
              <td>{{ new Date(incidencia.createdAt).toLocaleDateString() }}</td>
              <td>{{ new Date(incidencia.updatedAt).toLocaleTimeString() }}</td>
              <td>
                <select v-if="editingId === incidencia._id" v-model="editedIncidencia.estado">
                  <option value="pendiente">Pendiente</option>
                  <option value="en proceso">En Proceso</option>
                  <option value="resuelta">Resuelta</option>
                </select>
                <span v-else>{{ incidencia.estado }}</span>
              </td>
              <td>
                <div v-if="editingId === incidencia._id">
                  <button @click="guardarIncidencia(incidencia._id)" class="save-button">Guardar</button>
                  <button @click="cancelarEdicion" class="cancel-button">Cancelar</button>
                </div>
                <div v-else>
                  <button @click="editarIncidencia(incidencia)" class="edit-button">Editar</button>
                  <button @click="borrarIncidencia(incidencia._id)" class="delete-button">Borrar</button>
                </div>
              </td>
            </tr>
            <tr v-if="incidencias.length === 0">
              <td colspan="7" class="no-data">No hay incidencias registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
// listasupervisor.vue
import axios from 'axios';

export default {
  data() {
    return {
      incidencias: [],
      editingId: null,
      editedIncidencia: {},
    };
  },
  mounted() {
    this.obtenerIncidencias();
  },
  methods: {
    obtenerIncidencias() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no proporcionado');
        alert("Por favor inicie sesión");
        this.$router.push('/');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      axios.get('https://proyectodetitulo.onrender.com/api/incidencias', config)
        .then(response => {
          this.incidencias = response.data;
        })
        .catch(error => {
          console.error('Error al cargar las incidencias:', error);
          alert('Error al cargar las incidencias');
        });
    },
    navegarADashboard() {
      this.$router.push('/dashboard-supervisor');
    },
    editarIncidencia(incidencia) {
      this.editingId = incidencia._id;
      this.editedIncidencia = { ...incidencia };
    },
    cancelarEdicion() {
      this.editingId = null;
      this.editedIncidencia = {};
    },
    async guardarIncidencia(id) {
      const token = localStorage.getItem('token');
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
          this.editedIncidencia,
          config
        );
        console.log('Incidencia actualizada:', response.data);
        alert('Incidencia actualizada exitosamente');
        this.editingId = null;
        this.obtenerIncidencias();
      } catch (error) {
        console.error('Error al actualizar la incidencia:', error);
        alert('Error al actualizar la incidencia');
      }
    },
    async borrarIncidencia(id) {
      const token = localStorage.getItem('token');
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
          this.obtenerIncidencias();
        } catch (error) {
          console.error('Error al eliminar la incidencia:', error);
          alert('Error al eliminar la incidencia');
        }
      }
    },
  },
};
</script>

<style scoped>
/* Tu estilo para la página de lista de incidencias */
.incidencias-lista-container {
  display: flex;
}

.sidebar {
  width: 200px;
  background-color: #b81e1e;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 200px;
  position: fixed;
  height: 100%;
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
  padding: 20px;
  background-color: #f9f9f9;
  margin-left: 210px;
  overflow-y: auto;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #444;
  color: #b81e1e;
}

.tabla-container {
  margin-top: 20px;
  overflow-x: auto;
}

.incidencias-tabla {
  width: 100%;
  border-collapse: collapse;
}

.incidencias-tabla th,
.incidencias-tabla td {
  border: 1px solid #333;
  padding: 8px 12px;
  text-align: left;
}

.incidencias-tabla th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.no-data {
  text-align: center;
  font-style: italic;
}

.edit-button {
  background-color: #4caf50;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
}

.edit-button:hover {
  background-color: #45a049;
}

.save-button {
  background-color: #2196f3;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
}

.save-button:hover {
  background-color: #1976d2;
}

.cancel-button {
  background-color: #ccc;
  color: #333;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 5px;
}

.cancel-button:hover {
  background-color: #aaa;
}

.delete-button {
  background-color: #b81e1e;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.delete-button:hover {
  background-color: #a71010;
}
</style>