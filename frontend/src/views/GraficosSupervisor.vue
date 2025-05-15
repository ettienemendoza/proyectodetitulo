<template>
  <div class="graficos-container">
    <h2 class="page-title">Gráficos de Estadísticas</h2>

    <div class="filter-card">
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
    </div>

    <div v-if="reporteGenerado" class="report-container">
      <h3>Resumen del Reporte</h3>
      <p>{{ resumen }}</p>
      <div class="chart-card" v-if="chartData">
        <canvas ref="graficoCanvas" width="400" height="400"></canvas>
        <button @click="descargarGrafico" class="download-chart-button">Descargar Gráfico</button>
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

      try {
        const response = await axios.get('https://proyectodetitulo.onrender.com/api/reporte-incidencias', config);
        const data = response.data;
        this.procesarDatos(data);
        this.reporteGenerado = true;
      } catch (error) {
        console.error('Error al generar el reporte:', error);
        alert('Error al generar el reporte');
      }
    },
    procesarDatos(data) {
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
        conteoPorTipo[tipo] = (conteoPorTipo[tipo] || 0) + 1;
        totalIncidencias++;
      });

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
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        }]
      };

      // Crear el resumen textual
      let resumenTexto = `Se encontraron ${totalIncidencias} incidencias en el período seleccionado. Detalles: `;
      labels.forEach((tipo, index) => {
        resumenTexto += `${valores[index]} ${tipo} (${porcentajes[index]}), `;
      });
      this.resumen = resumenTexto.slice(0, -2) + '.';

      this.renderChart();
    },
    renderChart() {
      const canvas = this.$refs.graficoCanvas;
      if (canvas && this.chartData) {
        const ctx = canvas.getContext('2d');
        if (this.chartInstance) {
          this.chartInstance.destroy();
        }
        this.chartInstance = new Chart(ctx, {
          type: 'pie',
          data: this.chartData,
          options: {
            responsive: true,
            maintainAspectRatio: true,
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
                               label += context.parsed.y + ' (' + context.dataset.data[context.dataIndex] + ')';
                           }
                           return label;
                       }
                   }
                }
            }
          }
        });
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

.filter-form-container {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.filter-form-container h3{
    color: #b81e1e;
    margin-bottom: 1em;
    text-align: left;
    font-size: 1.4em;
}

.form-group {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: bold;
  font-size: 1em;
}

input[type="date"],
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  margin-bottom: 15px;
  transition: border-color 0.3s ease;
  font-size: 1em;
}

input[type="date"]:focus,
select:focus {
  outline: none;
  border-color: #b81e1e;
  box-shadow: 0 0 5px rgba(184, 30, 30, 0.3);
}

.generate-report-button {
  background-color: #b81e1e;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin-top: 20px;
}

.generate-report-button:hover {
  background-color: #a31d1d;
  transform: scale(1.05);
}

.generate-report-button:active {
  transform: translateY(2px);
}

.report-container {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.report-container h3{
    color: #b81e1e;
    margin-bottom: 1em;
    font-size: 1.4em;
}

.report-container p{
    font-size: 1.1em;
    color: #333;
    margin-bottom: 1em;
    line-height: 1.5;
}


.chart-container {
  margin-top: 20px;
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
}

.download-chart-button {
  background-color: #b81e1e;
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.1em;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin-top: 20px;
  display: block;
  text-align: center;
  margin: 20px auto 0 auto;
  width: 200px;
}

.download-chart-button:hover {
  background-color: #a31d1d;
  transform: scale(1.05);
}

.download-chart-button:active {
  transform: translateY(2px);
}

@media (max-width: 768px) {
  .filter-form-container,
  .report-container {
    width: 100%;
    margin-left: 0;
  }

  .chart-container {
    max-width: 100%;
  }
}
</style>
