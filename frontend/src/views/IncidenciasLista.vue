<template>
  <div class="incidencias-lista-container">
    <div class="sidebar">
      <button class="sidebar-button" @click="navegarAFormulario">
        {{ usuario.rol === 'supervisor' ? 'Volver al Perfil Supervisor' : 'Volver al Formulario' }}
      </button>
    </div>
    <div class="main-content">
      <h2>Lista de Incidencias</h2>

      <div class="filter-container">
        </div>

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
            <tr v-for="incidencia in incidenciasFiltradas" :key="incidencia._id">
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
                <span v-if="editingId !== incidencia._id">{{ incidencia.estado }}</span>
                <select v-else v-model="editedIncidencia.estado">
                  <option value="pendiente">Pendiente</option>
                  <option value="en proceso">En Proceso</option>
                  <option value="resuelta">Resuelta</option>
                </select>
              </td>
              <td>
                <div v-if="editingId === incidencia._id">
                  <button @click="guardarIncidencia(incidencia._id)" class="save-button">Guardar</button>
                  <button @click="cancelarEdicion" class="cancel-button">Cancelar</button>
                </div>
                <div v-else>
                  <button v-if="usuario.rol === 'supervisor' || usuario.nombre === incidencia.executiveName" @click="editarIncidencia(incidencia)" class="edit-button">Editar</button>
                  <button v-if="usuario.rol === 'supervisor' || usuario.nombre === incidencia.executiveName" @click="borrarIncidencia(incidencia._id)" class="delete-button">Borrar</button>
                </div>
              </td>
            </tr>
            <tr v-if="incidenciasFiltradas.length === 0">
              <td colspan="7" class="no-data">No hay incidencias registradas con estos filtros.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="reporteErroresComunes && reporteErroresComunes.length > 0" class="reporte-errores-container">
        <h3>Reporte de Errores Comunes</h3>
        <ul>
          <li v-for="error in reporteErroresComunes" :key="error.error">
            {{ error.error }}: {{ error.cantidad }}
          </li>
        </ul>
      </div>
      <div v-else-if="reporteGenerado && reporteErroresComunes.length === 0" class="reporte-errores-container">
        <p>No hay errores comunes para mostrar con los filtros aplicados.</p>
      </div>
    </div>
  </div>
</template>

<script>
// incidenciaslista.vue
import axios from 'axios';

export default {
  data() {
    return {
      incidencias: [],
      usuario: {},
      filtro: {
        type: '',
        estado: '',
        fechaInicio: '',
        fechaFin: '',
      },
      reporteErroresComunes: [],
      reporteGenerado: false,
      editingId: null,
      editedIncidencia: {},
    };
  },
  mounted() {
    this.obtenerIncidencias();
    this.usuario = JSON.parse(localStorage.getItem('usuario')) || {};
  },
  computed: {
    incidenciasFiltradas() {
      return this.incidencias.filter(incidencia => {
        const tipoMatch = !this.filtro.type || incidencia.type === this.filtro.type;
        const estadoMatch = !this.filtro.estado || incidencia.estado === this.filtro.estado;
        const fechaInicioMatch = !this.filtro.fechaInicio || new Date(incidencia.createdAt) >= new Date(this.filtro.fechaInicio);
        const fechaFinMatch = !this.filtro.fechaFin || new Date(incidencia.createdAt) <= new Date(this.filtro.fechaFin);
        return tipoMatch && estadoMatch && fechaInicioMatch && fechaFinMatch;
      });
    },
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
        params: this.filtro,
      };

      axios.get('https://proyectodetitulo.onrender.com/api/incidencias', config)
        .then(response => {
          this.incidencias = response.data;
          this.reporteErroresComunes = []; // Limpiar el reporte al obtener nuevas incidencias
          this.reporteGenerado = false;
        })
        .catch(error => {
          console.error('Error al cargar las incidencias:', error);
          alert('Error al cargar las incidencias');
        });
    },
    navegarAFormulario() {
      if (this.usuario.rol === 'supervisor') {
        this.$router.push('/dashboard-supervisor');
      } else {
        this.$router.push('/dashboard-ejecutivo');
      }
    },
    verDetalleIncidencia(id) {
      this.$router.push(`/incidencias/${id}`);
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

      try {
        await axios.delete(`https://proyectodetitulo.onrender.com/api/incidencias/${id}`, config);
        console.log('Incidencia eliminada');
        alert('Incidencia eliminada exitosamente');
        this.obtenerIncidencias(); // Recargar la lista después de eliminar
      } catch (error) {
        console.error('Error al eliminar la incidencia:', error);
        alert('Error al eliminar la incidencia');
      } finally {
        this.editingId = null;
      }
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
    async generarReporteErroresComunes() {
      const erroresComunes = this.incidenciasFiltradas.reduce((acc, incidencia) => {
        acc[incidencia.type] = (acc[incidencia.type] || 0) + 1;
        return acc;
      }, {});

      const reporteErrores = Object.entries(erroresComunes)
        .map(([error, cantidad]) => ({ error, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad);

      this.reporteErroresComunes = reporteErrores;
      this.reporteGenerado = true;

      // Enviar el reporte al backend para guardar en estadísticas
      const token = localStorage.getItem('token');
      if (token) {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        try {
          const response = await axios.post('https://proyectodetititulo.onrender.com/api/guardar-reporte-errores', { reporteErrores }, config);
          console.log('Reporte de errores guardado en el backend:', response.data.message);
          // Puedes mostrar un mensaje al usuario si lo deseas
        } catch (error) {
          console.error('Error al guardar el reporte de errores en el backend:', error);
          alert('Error al guardar el reporte de errores.');
        }
      } else {
        console.error('Token no encontrado, no se pudo guardar el reporte de errores.');
      }
    },
  },
};
</script>

<style scoped>
/* incidenciaslista.vue */
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

.filter-container {
  background-color: #f0f0f0;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 5px;
  color: #333;
  font-weight: bold;
}

.filter-group select,
.filter-group input[type="date"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.filter-button,
.report-button {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

.report-button {
  background-color: #28a745;
}

.filter-button:hover,
.report-button:hover {
  opacity: 0.8;
}

.reporte-errores-container {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: white;
}

.reporte-errores-container h3 {
  color: #333;
  margin-bottom: 10px;
}

.reporte-errores-container ul {
  list-style: none;
  padding: 0;
}

.reporte-errores-container li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.reporte-errores-container li:last-child {
  border-bottom: none;
}
</style>