<template>
  <div class="login-container">
    <div class="background-overlay"></div>
    <div class="login-box">
      <div class="title-banner">
        <h1>Iniciar Sesión</h1>
      </div>
      <div class="login-form">
        <div class="form-group">
          <label for="usuario">Usuario o Correo Electrónico:</label>
          <input type="text" v-model="resetInfo" id="resetInfo" placeholder="Usuario o Correo Electrónico" />
        </div>
        <button @click="iniciarSesion" class="btn-login">Iniciar Sesión</button>
        <button @click="mostrarMensajeContactoSupervisor" class="btn-reset-password">Olvidé mi contraseña</button>

        <div v-if="mostrarMensaje" class="reset-message">
          <p>{{ mensajeContactoSupervisor }}</p>
          <button @click="mostrarMensaje = false" class="btn-reset-cancel">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      usuario: '',
      contrasena: '',
      resetInfo: '',
      mostrarMensaje: false,
      mensajeContactoSupervisor: '',
    };
  },
  methods: {
    async iniciarSesion() {
      // ... (tu código de inicio de sesión)
    },
    mostrarMensajeContactoSupervisor() {
      this.mensajeContactoSupervisor = `Hola ${this.resetInfo || 'usuario'}, por favor contacta directamente con un supervisor para restablecer tu contraseña.`;
      this.mostrarMensaje = true;
      this.resetInfo = ''; // Limpiar el campo después de mostrar el mensaje
    },
  },
};
</script>

<style scoped>

.reset-message {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  text-align: center;
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

.btn-reset-cancel:hover {
  background-color: #c9302c;
}
</style>