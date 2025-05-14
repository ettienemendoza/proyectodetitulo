<template>
  <div class="login-container">
    <div class="background-overlay"></div>
    <div class="login-box">
      <div class="title-banner">
        <h1>Iniciar Sesión</h1>
      </div>
      <div class="login-form">
        <div class="form-group">
          <label for="usuario">Usuario:</label>
          <input type="text" v-model="usuario" id="usuario" placeholder="Usuario" />
        </div>
        <div class="form-group">
          <label for="contrasena">Contraseña:</label>
          <input type="password" v-model="contrasena" id="contrasena" placeholder="Contraseña" />
        </div>
        <button @click="iniciarSesion" class="btn-login">Iniciar Sesión</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      usuario: '',
      contrasena: ''
    };
  },
  methods: {
    async iniciarSesion() {
      console.log('Datos enviados al backend:', {
        usuario: this.usuario,
        contrasena: this.contrasena
      });

      try {
        const response = await axios.post('https://proyectodetitulo.onrender.com/api/login', {
          usuario: this.usuario,  // El backend espera "nombre", no "usuario"
          contrasena: this.contrasena
        });

        console.log('Respuesta del servidor:', response.data); // Verificar la respuesta del servidor

        if (response.data.token) {
          console.log('Token recibido:', response.data.token);  // Verificar que se recibió el token

          // Guardar el token y el rol en localStorage
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('rol', response.data.rol);
          localStorage.setItem('usuario', JSON.stringify({ nombre: this.usuario }));  // Guardar el nombre del usuario

          // Verificar en la consola si el token y rol están en localStorage
          console.log('Token en localStorage:', localStorage.getItem('token'));
          console.log('Rol en localStorage:', localStorage.getItem('rol'));

          // Verificar el rol antes de redirigir
          console.log('Rol del usuario:', response.data.rol);  // Verificar el rol

          setTimeout(() => {
            if (response.data.rol === 'supervisor') {
              console.log('Redirigiendo a dashboard-supervisor');
              this.$router.push('/dashboard-supervisor');
            } else if (response.data.rol === 'ejecutivo') {
              console.log('Redirigiendo a dashboard-ejecutivo');
              this.$router.push('/dashboard-ejecutivo');
            }
          }, 500); // Retraso de 500ms
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Usuario o contraseña incorrectos');
      }
    }
  }
};
</script>

<style scoped>
/* Estilo del formulario de login */
.login-container {
  background-image: url('@/assets/edificio.jpg');
  background-size: cover;
  background-position: center;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

.login-box {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  width: 400px;
  text-align: center;
  z-index: 1;
}

.title-banner {
  text-align: center;
  margin-bottom: 20px;
}

h1 {
  color: #d9534f;
  font-size: 2em;
}

.form-group {
  margin-bottom: 15px;
}

label {
  font-size: 1.2em;
  color: #444;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
}

.btn-login {
  background-color: #d9534f;
  color: white;
  padding: 10px 20px;
  width: 100%;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2em;
}

.btn-login:hover {
  background-color: #c23d39;
}
</style>
