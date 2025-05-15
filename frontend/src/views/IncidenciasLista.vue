<template>
  <div class="incidencias-lista-container">
    <div class="sidebar">
      <button class="sidebar-button" @click="navegarAFormulario">Volver al Formulario</button>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="incidencia in incidencias" :key="incidencia._id">
              <td>{{ incidencia.type }}</td>
              <td>{{ incidencia.description }}</td>
              <td>{{ incidencia.executiveName }}</td>
              <td>{{ incidencia.createdAt }}</td>
              <td>{{ incidencia.updatedAt }}</td>
              <td>{{ incidencia.comments }}</td>
            </tr>
            <tr v-if="incidencias.length === 0">
              <td colspan="6" class="no-data">No hay incidencias registradas.</td>
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
      incidencias: []  // Lista de incidencias
    };
  },
  mounted() {
    this.obtenerIncidencias();
  },
  methods: {
   obtenerIncidencias() {
  const token = localStorage.getItem('token');  // Obtener el token desde localStorage

  // Verificar que el token esté disponible
  if (!token) {
    console.error('Token no proporcionado');
    alert("Por favor inicie sesión");
    return;
  }

  console.log('Token al obtener incidencias:', token); // AGREGAR ESTE LOG

  // Configurar los encabezados con el token
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,  // Añadir el token al header
    },
  };

  // Realizar la solicitud GET para obtener las incidencias
  axios.get('https://proyectodetitulo.onrender.com/api/incidencias', config)  // Enviar la solicitud con los headers
    .then(response => {
      this.incidencias = response.data;  // Guardar las incidencias en la variable
    })
    .catch(error => {
      console.error('Error al cargar las incidencias:', error);
      alert('Error al cargar las incidencias');
    });
},
     
      
    navegarAFormulario() {
      this.$router.push('/dashboard-ejecutivo');  // Redirige al formulario
    }
  }
};

</script>

<style scoped>
/* Tu estilo para la página de lista de incidencias */
.incidencias-lista-container {
  display: flex;
}

.sidebar {
  width: 200px;
  background-color: #b81e1e;  /* Barra roja */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Cambié align-items para estar más cerca de la parte superior */
  padding-top: 200px;  /* Ajusté el espacio en la parte superior */
  position: fixed;  /* Fijar la barra a la izquierda */
  height: 100%;  /* Aseguramos que la barra ocupe toda la altura */
}

.sidebar-button {
  background-color: #f0f0f0;
  color: #333;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;  /* Margen para que el botón no quede pegado */
}

.sidebar-button:hover {
  background-color: #e0e0e0;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f9f9f9;
  margin-left: 210px;  /* Dejamos espacio para la barra lateral */
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
</style>
