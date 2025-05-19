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
      // ... (tu código de inicio de sesión)
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
/* ... (tus estilos existentes) */

.reset-form {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.btn-reset-submit,
.btn-reset-cancel {
  background-color: #5bc0de;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  margin-top: 10px;
  margin-right: 5px;
}

.btn-reset-cancel {
  background-color: #d9534f;
}

.btn-reset-submit:hover {
  background-color: #46b8da;
}

.btn-reset-cancel:hover {
  background-color: #c9302c;
}
</style>