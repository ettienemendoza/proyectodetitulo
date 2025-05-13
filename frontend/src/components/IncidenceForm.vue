<!-- src/components/IncidenceForm.vue -->
<template>
    <div>
      <h2>Registrar Incidencia</h2>
      <input v-model="type" type="text" placeholder="Tipo de incidencia" />
      <textarea v-model="description" placeholder="Descripción de la incidencia"></textarea>
      <button @click="submitIncidence">Registrar</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        type: '',
        description: ''
      };
    },
    methods: {
      submitIncidence() {
        console.log('Tipo:', this.type);
        console.log('Descripción:', this.description);
        // Aquí agregarías la lógica para guardar la incidencia
      }
    }
  };
  </script>
  
  <style scoped>
  input, textarea {
    margin: 10px 0;
    padding: 8px;
    width: 300px;
  }
  button {
    padding: 10px 15px;
    background-color: #007bff;
    color: white;
    border: none;
  }
  </style>
  