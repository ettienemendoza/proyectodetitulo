// store/index.js
import { createStore } from 'vuex';

export default createStore({
  state: {
    usuario: null,
    rol: null,
  },
  mutations: {
    setUsuario(state, { usuario, rol }) {
      state.usuario = usuario;
      state.rol = rol;
    },
  },
  actions: {
    login({ commit }, { usuario, rol }) {
      commit('setUsuario', { usuario, rol });
    },
  },
  getters: {
    getUsuario: (state) => state.usuario,
    getRol: (state) => state.rol,
  },
});
