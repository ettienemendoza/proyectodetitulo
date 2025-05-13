<template>
    <div class="incidencia-detalle-container">
      <h2>Detalles de Incidencia</h2>
      <div class="detalle-grid">
        <div class="detalle-item">
          <label>Tipo de Error:</label>
          <div class="dato">{{ tipoError }}</div>
        </div>
        <div class="detalle-item">
          <label>Descripción:</label>
          <div class="dato">{{ descripcion }}</div>
        </div>
        <div class="detalle-item">
          <label>Nombre Ejecutivo:</label>
          <div class="dato">{{ nombreEjecutivo }}</div>
        </div>
        <div class="detalle-item">
          <label>Fecha:</label>
          <div class="dato">{{ fecha }}</div>
        </div>
        <div class="detalle-item">
          <label>Hora:</label>
          <div class="dato">{{ hora }}</div>
        </div>
        <div class="detalle-item comentarios">
          <label>Comentarios:</label>
          <div class="dato">{{ comentarios }}</div>
          <textarea v-if="esSupervisor" v-model="nuevoComentario" @keydown.enter="agregarComentario" placeholder="Agregar comentario"></textarea>
          <button v-if="esSupervisor" @click="agregarComentario">Agregar</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'IncidenciaDetalle', //  Asegúrate de que coincida con el nombre del archivo y la ruta
    data() {
      return {
        tipoError: localStorage.getItem('tipoError') || 'No disponible',
        descripcion: localStorage.getItem('descripcion') || 'No disponible',
        nombreEjecutivo: localStorage.getItem('nombreUsuario') || 'Desconocido',
        fecha: localStorage.getItem('fechaIncidencia') || 'No disponible',
        hora: localStorage.getItem('horaIncidencia') || 'No disponible',
        comentarios: 'Comentario inicial.', //  ¡Esto vendría de la base de datos!
        nuevoComentario: '',
        esSupervisor: true //  ¡Esto debería venir de la autenticación!
      };
    },
    methods: {
      agregarComentario() {
        if (this.nuevoComentario.trim() !== '') {
          this.comentarios += `\n${this.nuevoComentario}`;
          this.nuevoComentario = '';
          //  ¡Aquí iría la lógica para guardar el comentario en la base de datos!
        }
      }
    },
    mounted() {
      //  Opcional: Limpiar localStorage después de usar los datos
      //  localStorage.removeItem('tipoError');
      //  localStorage.removeItem('descripcion');
      //  ...
    }
  };
  </script>
  
  <style scoped>
  .incidencia-detalle-container {
    width: 80%;
    margin: 20px auto;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 20px;
  }
  
  .detalle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 20px;
  }
  
  .detalle-item {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    padding: 15px;
  }
  
  .detalle-item label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
    color: #555;
  }
  
  .dato {
    color: #333;
  }
  
  .comentarios {
    grid-column: 1 / -1; /* Ocupa toda la fila */
  }
  
  .comentarios textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
    resize: vertical;
    margin-bottom: 10px;
  }
  
  .comentarios button {
    background-color: #4CAF50;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .comentarios button:hover {
    background-color: #45a049;
  }
  </style>