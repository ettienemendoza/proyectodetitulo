import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';  // Asegúrate de importar Vuex store

createApp(App)
  .use(store)  // Usa Vuex en tu aplicación
  .use(router)  // Usa Vue Router
  .mount('#app');
