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
        <button @click="mostrarFormularioReset" class="btn-reset-password">Olvidé mi contraseña</button>

        <div v-if="mostrarResetFormulario" class="reset-form">
          <div class="form-group">
            <label for="resetUsuario">Usuario:</label>
            <input type="text" v-model="resetUsuario" id="resetUsuario" placeholder="Usuario" />
          </div>
          <div class="form-group">
            <label for="resetEmail">Correo Electrónico:</label>
            <input type="email" v-model="resetEmail" id="resetEmail" placeholder="Correo Electrónico" />
          </div>
          <button @click="resetPassword" class="btn-reset-submit">Enviar Contraseña al Correo</button>
          <button @click="mostrarResetFormulario = false" class="btn-reset-cancel">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// loginpage.vue
import axios from 'axios';

export default {
  data() {
    return {
      usuario: '',
      contrasena: '',
      resetUsuario: '',
      resetEmail: '',
      mostrarResetFormulario: false,
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
          usuario: this.usuario,
          contrasena: this.contrasena
        });

        console.log('Respuesta del servidor:', response.data);

        if (response.data.token) {
          console.log('Token recibido:', response.data.token);

          localStorage.setItem('token', response.data.token);
          localStorage.setItem('rol', response.data.rol);
          localStorage.setItem('usuario', JSON.stringify({ nombre: this.usuario, email: response.data.email }));
          console.log('Token en localStorage:', localStorage.getItem('token'));
          console.log('Rol en localStorage:', localStorage.getItem('rol'));

          console.log('Rol del usuario:', response.data.rol);

          setTimeout(() => {
            if (response.data.rol === 'supervisor') {
              console.log('Redirigiendo a dashboard-supervisor');
              this.$router.push('/dashboard-supervisor');
            } else if (response.data.rol === 'ejecutivo') {
              console.log('Redirigiendo a dashboard-ejecutivo');
              this.$router.push('/dashboard-ejecutivo');
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Usuario o contraseña incorrectos');
      }
    },
    mostrarFormularioReset() {
      this.mostrarResetFormulario = true;
    },
    async resetPassword() {
      if (!this.resetUsuario || !this.resetEmail) {
        alert('Por favor, ingresa tu usuario y correo electrónico.');
        return;
      }

      try {
        const response = await axios.post('https://proyectodetitulo.onrender.com/api/reset-password', {
          usuario: this.resetUsuario,
          email: this.resetEmail,
        });
        alert(response.data.message);
        this.mostrarResetFormulario = false; // Ocultar el formulario después del envío
      } catch (error) {
        console.error('Error al solicitar el restablecimiento de contraseña:', error);
        alert(error.response.data.message || 'Error al solicitar el restablecimiento de contraseña');
      } finally {
        this.resetUsuario = '';
        this.resetEmail = '';
      }
    },
  },
};
</script>

<style scoped>
/* loginpage.vue */
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

.btn-reset-password {
  background-color: #5bc0de;
  color: white;
  padding: 10px 20px;
  width: 100%;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2em;
  margin-top: 10px;
}

.btn-reset-password:hover {
  background-color: #46b8da;
}
</style>