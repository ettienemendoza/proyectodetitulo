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

  console.log('Conteo por tipo:', conteoPorTipo);
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
      porcentajes: porcentajes
    }]
  };

  console.log('Datos del gráfico (this.chartData):', this.chartData);

  // Crear el resumen textual con conteo total y por tipo
  let resumenTexto = `Se encontraron ${totalIncidencias} incidencias en el período seleccionado. Detalles: `;
  labels.forEach((tipo, index) => {
    resumenTexto += `${tipo}: ${conteoPorTipo[tipo]} (${porcentajes[index]}), `;
  });
  this.resumen = resumenTexto.slice(0, -2) + '.';

  this.$nextTick(() => {
    this.renderChart();
  });
},

      
  renderChart() {
  const canvas = this.$refs.graficoCanvas;
  console.log('Elemento canvas en renderChart:', canvas);
  if (canvas && this.chartData) {
    const ctx = canvas.getContext('2d');
    console.log('Contexto del canvas:', ctx);
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
    this.chartInstance = new Chart(ctx, {
      type: 'pie',
      data: this.chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
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
                  // Accede a los porcentajes desde el dataset
                  if (context.dataset.porcentajes && context.dataset.porcentajes[`${context.dataIndex}`]) {
                    label += ' - ' + context.dataset.porcentajes[`${context.dataIndex}`];
                  }
                }
                return label;
              }
            }
            }
          }
        }
      });
      console.log('Instancia del gráfico:', this.chartInstance);
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
}
};

</script>

<style scoped>
.graficos-container {
  padding: 20px;
  background-color: #f2f2f2;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

.page-title {
  background-color: #b81e1e;
  color: white;
  padding: 10px;
  margin-bottom: 20px;
  text-align: center;
  border-radius: 5px;
  font-size: 1.8em;
}

.report-layout {
  display: flex;
  gap: 20px; /* Espacio entre los dos cuadros */
  align-items: flex-start; /* Alinea los elementos en la parte superior */
}

.filter-section {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 300px; /* Ancho fijo para la sección de filtros */
}

.report-section {
  flex-grow: 1; /* La sección de reporte ocupa el espacio restante */
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: calc(100% - 12px);
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 1em;
}

.generate-report-button,
.back-to-dashboard-button,
.download-chart-button {
  background-color: #b81e1e;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
  margin-top: 10px;
  display: block; /* Para que los botones ocupen el ancho completo */
  width: 100%;
  box-sizing: border-box;
}

.generate-report-button:hover,
.back-to-dashboard-button:hover,
.download-chart-button:hover {
  background-color: #8c1717;
}

.back-to-dashboard-button {
  background-color: #333; /* Un color diferente para distinguirlo */
}

.back-to-dashboard-button:hover {
  background-color: #555;
}

.chart-card {
  margin-top: 20px;
  border: 1px solid #eee;
  padding: 15px;
  border-radius: 5px;
  text-align: center;
  max-width: 100%; /* Asegura que no sea más ancho que su contenedor */
  overflow: auto; /* Permite scroll si el contenido es demasiado grande (por precaución) */
}

.chart-card canvas {
  width: 100% !important; /* Hace que el canvas ocupe el ancho del contenedor */
  height: auto !important; /* Mantiene la proporción */
  max-height: 400px; /* O ajusta la altura máxima según lo necesites */
}

.download-chart-button {
  margin-top: 15px;
}

.initial-message {
  color: #777;
  font-style: italic;
}
</style>