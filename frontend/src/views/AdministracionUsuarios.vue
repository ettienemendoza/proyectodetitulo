<template>
  <div class="admin-container">
    <h2>Administración de Usuarios</h2>
    <!-- Formulario para agregar un usuario -->
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
    <!-- Lista de usuarios -->
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
  name: 'AdministracionUsuarios',  // Nombre del componente corregido
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
    this.obtenerUsuarios();  // Cargar los usuarios cuando el componente se monta
  },
  methods: {
    // Agregar un nuevo usuario
    async agregarUsuario() {
      try {
        const response = await axios.post('http://localhost:3000/api/usuarios', this.nuevoUsuario);
        console.log(response.data);
        alert('Usuario creado exitosamente');
        this.obtenerUsuarios();  // Actualizar la lista de usuarios
        this.nuevoUsuario = { nombre: '', contrasena: '', cargo: 'ejecutivo' };  // Limpiar el formulario
      } catch (error) {
        console.error('Error al agregar el usuario:', error);
        alert('Error al crear el usuario');
      }
    },

    // Obtener la lista de usuarios
    async obtenerUsuarios() {
      try {
        const response = await axios.get('http://localhost:3000/api/usuarios');
        this.usuarios = response.data;
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    },

    // Eliminar un usuario
    async eliminarUsuario(id) {
      try {
        await axios.delete(`http://localhost:3000/api/usuarios/${id}`);
        alert('Usuario eliminado');
        this.obtenerUsuarios();  // Actualizar la lista de usuarios
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

