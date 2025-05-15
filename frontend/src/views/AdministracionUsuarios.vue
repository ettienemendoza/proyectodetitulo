<template>
  <div class="admin-container">
    <h2>Administración de Usuarios</h2>

    <div class="add-user">
      <h3>Agregar Usuario</h3>
      <form @submit.prevent="agregarUsuario">
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input type="text" v-model="nuevoUsuario.nombre" required />
        </div>
        <div class="form-group">
          <label for="contrasena">Contraseña:</label>
          <input type="password" v-model="nuevoUsuario.contrasena" required />
        </div>
        <div class="form-group">
          <label for="cargo">Cargo:</label>
          <select v-model="nuevoUsuario.cargo" required>
            <option value="ejecutivo">Ejecutivo</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>
        <button type="submit">Crear Usuario</button>
      </form>
   
    </div>
   
    <div class="user-list">
      <h3>Lista de Usuarios</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cargo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario._id">
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.cargo }}</td>
            <td>
              <button @click="eliminarUsuario(usuario._id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdministracionUsuarios',
  data() {
    return {
      nuevoUsuario: {
        nombre: '',
        contrasena: '',
        cargo: 'ejecutivo'
      },
      usuarios: []
    };
  },
  mounted() {
    this.obtenerUsuarios();
  },
  methods: {
    // Agregar un nuevo usuario
    async agregarUsuario() {
      try {
        const response = await axios.post('https://proyectodetitulo.onrender.com/api/usuarios', this.nuevoUsuario); // Usa la URL de Render
        console.log(response.data);
        alert('Usuario creado exitosamente');
        this.obtenerUsuarios();
        this.nuevoUsuario = { nombre: '', contrasena: '', cargo: 'ejecutivo' };
      } catch (error) {
        console.error('Error al agregar el usuario:', error);
        alert('Error al crear el usuario');
      }
    },

    // Obtener la lista de usuarios
    async obtenerUsuarios() {
      try {
        const response = await axios.get('https://proyectodetitulo.onrender.com/api/usuarios'); // Usa la URL de Render
        this.usuarios = response.data;
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    },

    // Eliminar un usuario
    async eliminarUsuario(id) {
      try {
        await axios.delete(`https://proyectodetitulo.onrender.com/api/usuarios/${id}`); // Usa la URL de Render
        alert('Usuario eliminado');
        this.obtenerUsuarios();
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
      }
    }
  }
};
</script>

<style scoped>
/* Estilos del formulario de administración */
.admin-container {
  padding: 20px;
}

.add-user, .user-list {
  margin-bottom: 20px;
}

.add-user h3, .user-list h3 {
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background-color: #b81e1e;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #a31d1d;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th, table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

button {
  background-color: red;
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: darkred;
}
</style>
