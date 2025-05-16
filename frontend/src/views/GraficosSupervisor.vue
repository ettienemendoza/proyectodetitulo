<template>
  <div class="graficos-container">
    <h2 class="page-title">Gráficos de Estadísticas</h2>
    <div class="report-layout">
      <div class="filter-section">
        <h3>Filtrar Reporte</h3>
        <div class="form-group">
          <label for="tipoError">Tipo de Error:</label>
          <select id="tipoError" v-model="filtro.tipoError">
            <option value="">Todos</option>
            <option value="Biometría">Biometría</option>
            <option value="Fallo de preguntas">Fallo de preguntas</option>
            <option value="Problemas en el sistema">Problemas en el sistema</option>
            <option value="Sin preguntas">Sin preguntas</option>
            <option value="Otros">Otros</option>
          </select>
        </div>
        <div class="form-group">
          <label for="fechaInicio">Fecha Inicio:</label>
          <input type="date" id="fechaInicio" v-model="filtro.fechaInicio" />
        </div>
        <div class="form-group">
          <label for="fechaFin">Fecha Fin:</label>
          <input type="date" id="fechaFin" v-model="filtro.fechaFin" />
        </div>
        <button @click="generarReporte" class="generate-report-button">Generar Reporte</button>
        <button @click="volverAlMenuPrincipal" class="back-to-dashboard-button">Volver al Menú Principal</button>
      </div>
      <div class="report-section">
        <div v-if="reporteGenerado">
          <h3>Resumen del Reporte</h3>
          <p>{{ resumen }}</p>
          <div class="chart-card" v-if="chartData">
            <canvas ref="graficoCanvas" width="400" height="400"></canvas>
            <button @click="descargarGrafico" class="download-chart-button">Descargar Gráfico</button>
          </div>
          <div v-else>
            <p>No hay datos para mostrar en el gráfico con los filtros seleccionados.</p>
          </div>
        </div>
        <div v-else class="initial-message">
          <p>Selecciona los filtros y haz clic en "Generar Reporte" para ver las estadísticas.</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import Chart from 'chart.js/auto';

export default {
  name: 'GraficosSupervisor',
  data() {
    return {
      filtro: {
        tipoError: '',
        fechaInicio: '',
        fechaFin: '',
      },
      reporteGenerado: false,
      resumen: '',
      chartData: null,
      chartInstance: null,
    };
  },
  mounted() {
    // Si es necesario, puedes obtener datos adicionales aquí
  },
  methods: {
    async generarReporte() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token no proporcionado');
        alert('Por favor, inicie sesión');
        this.$router.push('/');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: this.filtro,
      };

      console.log('Filtros enviados al backend:', this.filtro);

      try {
        const response = await axios.get('https://proyectodetitulo.onrender.com/api/reporte-incidencias', config);
        console.log('Respuesta del backend:', response.data);
        const data = response.data;
        this.procesarDatos(data);
        this.reporteGenerado = true;
      } catch (error) {
        console.error('Error al generar el reporte:', error);
        alert('Error al generar el reporte');
      }
    },
    procesarDatos(data) {
      console.log('Datos recibidos para procesar:', data);
      if (!data || data.length === 0) {
        this.resumen = 'No se encontraron incidencias con los filtros seleccionados.';
        this.chartData = null;
        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }
        return;
      }
      const conteoPorTipo = {};
      let totalIncidencias = 0;

      data.forEach(incidencia => {
        const tipo = incidencia.type;
        conteoPorTipo[`${tipo}`] = (conteoPorTipo[`${tipo}`] || 0) + 1;
        totalIncidencias++;
      });

      console.log('Conteo por tipo:', conteoPorTipo); // <---- AGREGAR ESTE LOG
      const labels = Object.keys(conteoPorTipo);
      const valores = Object.values(conteoPorTipo);
      const porcentajes = valores.map(valor => ((valor / totalIncidencias) * 100).toFixed(2) + '%');

      this.chartData = {
        labels: labels,
        datasets: [{
          label: 'Tipos de Incidencia',
          data: valores,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
            'rgba(128, 0, 128, 0.6)', // Purple
            'rgba(0, 128, 0, 0.6)',   // Green
            'rgba(0, 0, 128, 0.6)',   // Navy
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(128, 0, 128, 1)',
            'rgba(0, 128, 0, 1)',
            'rgba(0, 0, 128, 1)',
          ],
          borderWidth: 1,
        }]
      };

      console.log('Datos del gráfico (this.chartData):', this.chartData); // <---- AGREGAR ESTE LOG

      // Crear el resumen textual
      let resumenTexto = `Se encontraron ${totalIncidencias} incidencias en el período seleccionado. Detalles: `;
      labels.forEach((tipo, index) => {
        resumenTexto += `${valores.length > index ? valores[`${index}`] : 0} ${tipo} (${porcentajes.length > index ? porcentajes[`${index}`] : '0.00%'}) , `;
      });
      this.resumen = resumenTexto.slice(0, -2) + '.';

      this.renderChart();
    },
    renderChart() {
      const canvas = this.$refs.graficoCanvas;
      console.log('Elemento canvas:', canvas); // <---- AGREGAR ESTE LOG
      if (canvas && this.chartData) {
        const ctx = canvas.getContext('2d');
        console.log('Contexto del canvas:', ctx); // <---- AGREGAR ESTE LOG
        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }
        this.chartInstance = new Chart(ctx, {
          type: 'pie',
          data: this.chartData,
          options: {
            responsive: true,
            maintainAspectRatio: false, // Permite ajustar la proporción
            plugins: {
              legend: {
                position: 'top'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let label = context.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      label += context.parsed.y + ' (' + context.dataset.data[`${context.dataIndex}`] + ')';
                    }
                    return label;
                  }
                }
              }
            }
          }
        });
        console.log('Instancia del gráfico:', this.chartInstance); // <---- AGREGAR ESTE LOG
      }
    },
      
    descargarGrafico() {
      const canvas = this.$refs.graficoCanvas;
      if (canvas) {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'grafico_incidencias.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert('No hay gráfico para descargar.');
      }
    },
    volverAlMenuPrincipal() {
      this.$router.push('/dashboard-supervisor');
    }
  },
  beforeUnmount() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  },
};
</script>
<style scoped>
.supervisor-container {
  text-align: center;
  padding: 20px;
  background-color: #f2f2f2;
  min-height: 100vh;
  background-image: url('@/assets/supervisor.jpg'); /* Ruta a tu imagen */
  background-size: cover;
  background-position: center top; /* Centra la imagen desde la parte superior */
  display: flex;
  flex-direction: column;
  align-items: stretch; /* Estira los elementos horizontalmente */
  justify-content: flex-start; /* Alinea los elementos desde la parte superior */
  filter: grayscale(100%); /* Aplica un filtro de escala de grises */
}

.supervisor-header {
  background-color: #b81e1e; /* Color de fondo sólido */
  color: white;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center; /* Centra el texto dentro del encabezado */
}

.supervisor-header h1,
.supervisor-header h3 {
  background-color: transparent; /* Asegura que el fondo del texto no sea transparente */
  padding: 5px 0; /* Añade un poco de espacio alrededor del texto */
  margin: 0; /* Elimina los márgenes predeterminados */
}

.supervisor-options {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px; /* Espacio antes del botón de cerrar sesión */
}

.option-card {
  background-color: rgba(184, 30, 30, 0.9); /* Fondo con transparencia */
  color: white;
  padding: 30px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 200px;
}

.option-card:hover {
  background-color: #8c1414;
}

h1 {
  font-size: 2.5em;
  margin-bottom: 5px;
}

h3 {
  font-size: 1.5em;
  font-weight: bold;
}

.logout-button {
  background-color: #333;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #555;
}

.logout-icon {
  margin-left: 5px;
  font-size: 1.2em;
}
</style>