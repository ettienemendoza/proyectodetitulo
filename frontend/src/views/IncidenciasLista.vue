<template>
  <div class="incidencias-lista-container">
    <div class="sidebar">
      <button class="sidebar-button" @click="navegarAFormulario">
        {{ usuario.rol === 'supervisor' ? 'Volver al Perfil Supervisor' : 'Volver al Formulario' }}
      </button>
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
              <th>Comentarios</th>
              <th v-if="usuario.rol === 'supervisor'">Acciones</th> </tr>
          </thead>
          <tbody>
            <tr v-for="incidencia in incidencias" :key="incidencia._id">
              <td>{{ incidencia.type }}</td>
              <td>{{ incidencia.description }}</td>
              <td>{{ incidencia.executiveName }}</td>
              <td>{{ new Date(incidencia.createdAt).toLocaleDateString() }}</td>
              <td>{{ new Date(incidencia.updatedAt).toLocaleTimeString() }}</td>
              <td>{{ incidencia.comments }}</td>
              <td v-if="usuario.rol === 'supervisor'">  <button @click="verDetalleIncidencia(incidencia._id)" class="edit-button">Editar</button>
                <button @click="borrarIncidencia(incidencia._id)" class="delete-button">Borrar</button>
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
import axios from 'axios';

export default {
  data() {
    return {
      incidencias: [],
      usuario: {}, // Para almacenar la información del usuario
    };
  },
  mounted() {
    this.obtenerIncidencias();
    this.usuario = JSON.parse(localStorage.getItem('usuario')) || {}; // Obtener el rol del usuario
  },
  methods: {
    obtenerIncidencias() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no proporcionado');
        alert("Por favor inicie sesión");
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
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #444;
}

.tabla-container {
  margin-top: 20px;
  overflow-x: auto;
}

.incidencias-tabla {
  width: 100%;
  border-collapse: collapse;
}

.incidencias-tabla th, .incidencias-tabla td {
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
  background-color: #4CAF50;
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
</style>
