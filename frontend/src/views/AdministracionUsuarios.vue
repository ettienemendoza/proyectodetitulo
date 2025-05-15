<template>
  <div class="admin-container">
    <h2 class="page-title">Administración</h2>
    <div class="main-content">
      <div class="add-user-card">
        <h3>Añadir Usuarios</h3>
        <form @submit.prevent="agregarUsuario">
          <div class="form-group">
            <label for="nombre">Nombre:</label>
            <input type="text" id="nombre" v-model="nuevoUsuario.nombre" required />
          </div>
          <div class="form-group">
            <label for="contrasena">Contraseña:</label>
            <input type="password" id="contrasena" v-model="nuevoUsuario.contrasena" required />
          </div>
          <div class="form-group">
            <label for="cargo">Cargo:</label>
            <select id="cargo" v-model="nuevoUsuario.cargo" required>
              <option value="ejecutivo">Ejecutivo</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          <button type="submit" class="add-button">Crear</button>
        </form>
      </div>
      <div class="user-list-card">
        <h3>Lista de Usuarios</h3>
        <div class="table-container">
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
                  <button @click="editarUsuario(usuario)" class="edit-button">Editar</button>
                  <button @click="eliminarUsuario(usuario._id)" class="delete-button">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <button class="back-to-menu-button" @click="volverAlMenuPrincipal">Volver al Menú Principal</button>
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
      usuarios: [],
      usuarioEditando: null,
    };
  },
  mounted() {
    this.obtenerUsuarios();
  },
  methods: {
    // Agregar un nuevo usuario
    async agregarUsuario() {
      try {
        const response = await axios.post('https://proyectodetitulo.onrender.com/api/usuarios', this.nuevoUsuario);
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
        const response = await axios.get('https://proyectodetitulo.onrender.com/api/usuarios');
        this.usuarios = response.data;
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    },

    // Eliminar un usuario
    async eliminarUsuario(id) {
      try {
        await axios.delete(`https://proyectodetitulo.onrender.com/api/usuarios/${id}`);
        alert('Usuario eliminado');
        this.obtenerUsuarios();
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
      }
    },
    editarUsuario(usuario) {
      this.usuarioEditando = { ...usuario };
    },
    async guardarUsuario(usuario) {
      try {
        const response = await axios.put(
          `https://proyectodetitulo.onrender.com/api/usuarios/${usuario._id}`,
          {
            nombre: usuario.nombre,
            cargo: usuario.cargo,
          }
        );
        console.log("Usuario actualizado", response.data);
        alert("Usuario actualizado exitosamente");
        this.obtenerUsuarios();
        this.usuarioEditando = null;
      } catch (error) {
        console.error("Error al actualizar usuario", error);
        alert("Error al actualizar usuario");
      }
    },
    volverAlMenuPrincipal() {
      this.$router.push('/dashboard-supervisor'); // Ajusta la ruta según tu configuración
    },
  },
};
</script>

<style scoped>
.admin-container {
  padding: 20px;
  background-color: #f2f2f2;
  min-height: 100vh;
}

.page-title {
  background-color: #b81e1e;
  color: white;
  padding: 10px;
  margin-bottom: 20px;
  text-align: center;
  border-radius: 5px;
}

.main-content {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20px;
  margin-bottom: 20px;
}

.add-user-card,
.user-list-card {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.add-user-card h3,
.user-list-card h3 {
  color: #b81e1e;
  margin-bottom: 15px;
  text-align: left;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 15px;
  transition: border-color 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #b81e1e;
  box-shadow: 0 0 5px rgba(184, 30, 30, 0.3);
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: #a31d1d;
}

button:active {
  transform: translateY(2px);
}

.add-button {
  background-color: #b81e1e;
  color: white;
  margin-top: 10px;
  width: 100%;
}

.add-button:hover {
  background-color: #a31d1d;
}

.user-list {
  margin-top: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

table thead tr {
  background-color: #f0f0f0;
  color: #333;
  text-align: left;
}

table th,
table td {
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
}

table tbody tr:hover {
  background-color: #f8f8f8;
}

.edit-button,
.delete-button {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  margin: 2px;
}

.edit-button {
  background-color: #4caf50;
  color: white;
}

.edit-button:hover {
  background-color: #45a049;
}

.delete-button {
  background-color: #b81e1e;
  color: white;
}

.delete-button:hover {
  background-color: #a71010;
}

.back-to-menu-button {
  background-color: #b81e1e;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 20px;
  align-self: center;
  width: 200px;
  margin: 20px auto 0 auto;
  display: block;
  text-align: center;
}

.back-to-menu-button:hover {
  background-color: #a31d1d;
}

.back-to-menu-button:active {
  transform: translateY(2px);
}
</style>
