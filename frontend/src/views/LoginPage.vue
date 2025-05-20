<template>
  <div class="login-container">
    <div class="background-overlay"></div>
    <div class="login-box">
      <div class="title-banner">
        <h1>Iniciar Sesión</h1>
      </div>
      <div class="login-form">
        <div class="form-group">
          <label for="usuario">Correo Electrónico:</label>
          <input type="text" v-model="usuario" id="usuario" placeholder="Correo Electrónico" />
        </div>
        <div class="form-group">
          <label for="contrasena">Contraseña:</label>
          <input type="password" v-model="contrasena" id="contrasena" placeholder="Contraseña" />
        </div>
        <button @click="iniciarSesion" class="btn-login">Iniciar Sesión</button>
        <button @click="mostrarFormularioOlvidoContrasena" class="btn-reset-password">Olvidé mi contraseña</button>

        <div v-if="mostrarOlvidoContrasena" class="reset-form">
          <div class="form-group">
            <label for="resetInfo">Usuario o Correo Electrónico:</label>
            <input type="text" v-model="resetInfo" id="resetInfo" placeholder="Usuario o Correo Electrónico" />
          </div>
          <button @click="solicitarNotificacionSupervisor" class="btn-reset-submit">Solicitar Restablecimiento</button>
          <button @click="mostrarOlvidoContrasena = false" class="btn-reset-cancel">Cancelar</button>
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
      resetInfo: '',
      mostrarOlvidoContrasena: false,
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
          localStorage.setItem('usuario', JSON.stringify({ nombre: response.data.nombre, email: this.usuario }));
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
        alert('Correo electrónico o contraseña incorrectos'); // Mensaje de error actualizado
      }
    },
    mostrarFormularioOlvidoContrasena() {
      this.mostrarOlvidoContrasena = true;
    },
    async solicitarNotificacionSupervisor() {
      if (!this.resetInfo) {
        alert('Por favor, ingresa tu usuario o correo electrónico.');
        return;
      }

      try {
        await axios.post('https://proyectodetitulo.onrender.com/api/notify-supervisor-reset', {
          userInfo: this.resetInfo, // <---- Asegúrate de que esto esté aquí
        });
        alert('Se ha registrado tu solicitud. Contacta a tu supervisor.');
        this.mostrarOlvidoContrasena = false; // Ocultar el formulario después del envío
      } catch (error) {
        console.error('Error al notificar al supervisor:', error);
        alert(error.response.data.message || 'Error al solicitar notificación al supervisor.');
      } finally {
        this.resetInfo = '';
      }
    },
  },
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

.btn-reset-password {
  background-color: #007bff; /* Un color diferente para la solicitud */
  color: white;
  padding: 10px 20px;
  width: 100%;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  margin-top: 10px;
  margin-right: 5px;
}

.btn-reset-cancel {
  background-color: #d9534f;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  margin-top: 10px;
}

.btn-reset-submit:hover {
  background-color: #0056b3;
}

.btn-reset-cancel:hover {
  background-color: #c9302c;
}
</style>