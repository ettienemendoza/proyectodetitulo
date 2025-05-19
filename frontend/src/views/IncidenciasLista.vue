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
        <h3>Filtrar Incidencias</h3>
        <div class="filter-group">
          <label for="tipoError">Tipo de Error:</label>
          <select id="tipoError" v-model="filtro.type">
            <option value="">Todos</option>
            <option value="Biometría">Biometría</option>
            <option value="Fallo de preguntas">Fallo de preguntas</option>
            <option value="Problemas en el sistema">Problemas en el sistema</option>
            <option value="Sin preguntas">Sin preguntas</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="estado">Estado:</label>
          <select id="estado" v-model="filtro.estado">
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="en proceso">En Proceso</option>
            <option value="resuelta">Resuelta</option>
          </select>
        </div>
        <div class="filter-group">
          <label for="fechaInicio">Fecha Inicio:</label>
          <input type="date" id="fechaInicio" v-model="filtro.fechaInicio" />
        </div>
        <div class="filter-group">
          <label for="fechaFin">Fecha Fin:</label>
          <input type="date" id="fechaFin" v-model="filtro.fechaFin" />
        </div>
        <button @click="obtenerIncidencias" class="filter-button">Aplicar Filtros</button>
        <button @click="generarReporteErroresComunes" class="report-button">Generar Reporte de Errores</button>
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
              <th v-if="usuario.rol === 'supervisor'">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="incidencia in incidenciasFiltradas" :key="incidencia._id">
              <td>{{ incidencia.type }}</td>
              <td>{{ incidencia.description }}</td>
              <td>{{ incidencia.executiveName }}</td>
              <td>{{ new Date(incidencia.createdAt).toLocaleDateString() }}</td>
              <td>{{ new Date(incidencia.updatedAt).toLocaleTimeString() }}</td>
              <td>{{ incidencia.estado }}</td>
              <td v-if="usuario.rol === 'supervisor'">
                <button @click="verDetalleIncidencia(incidencia._id)" class="edit-button">Editar</button>
                <button @click="borrarIncidencia(incidencia._id)" class="delete-button">Borrar</button>
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

      if (confirm('¿Estás seguro de que deseas eliminar esta incidencia?')) {
        try {
          await axios.delete(`https://proyectodetitulo.onrender.com/api/incidencias/${id}`, config);
          console.log('Incidencia eliminada');
          alert('Incidencia eliminada exitosamente');
          this.obtenerIncidencias(); // Recargar la lista después de eliminar
        } catch (error) {
          console.error('Error al eliminar la incidencia:', error);
          alert('Error al eliminar la incidencia');
        }
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
          const response = await axios.post('https://proyectodetitulo.onrender.com/api/guardar-reporte-errores', { reporteErrores }, config);
          console.log('Reporte de errores guardado en el backend:', response.data.message);
          
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
  justify-content: center;
  align-items: flex-start;
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
  margin-top: 10px;
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