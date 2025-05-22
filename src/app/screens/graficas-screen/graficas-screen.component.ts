import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdministradoresService } from 'src/app/services/administradores.service';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartData, Chart } from 'chart.js';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit{
  //Variables
  public total_user: any = {};
  public chart!: Chart;
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef;

  // Gráfico de línea (eventos por día o mes)
  public lineChartData: ChartData<'line'> = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril'],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Eventos registrados'
      }
    ]
  };


  public lineChartOption: any = {
    responsive: true
  };

  public lineChartPlugins = [DatalabelsPlugin];

  // Gráfico de barras 
  public barChartData: ChartData<'bar'> = {
    labels: ['Conferencia', 'Taller', 'Seminario', 'Concurso'],
    datasets: [
      {
        data: [0, 0, 0],
        label: 'Usuarios por evento',
        backgroundColor: ['#f88406', '#fcff44', '#82d3fb']
      }
    ]
  };

  public barChartOption: any = {
    responsive: true
  };
  public barChartPlugins = [DatalabelsPlugin];

  // Gráfico de pastel
  public pieChartData: ChartData<'pie'> = {
    labels: ['Administradores', 'Maestros', 'Alumnos'],
    datasets: [{
      data: [0, 0, 0],
      label: 'Usuarios registrados',
      backgroundColor: ['#f88406', '#fcff44', '#31e731']
    }]
  };

  public pieChartOption: any = {
    responsive: true
  };
  public pieChartPlugins = [DatalabelsPlugin];

  // Gráfico de dona
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Administradores', 'Maestros', 'Alumnos'],
    datasets: [{
      data: [0, 0, 0],
      label: 'Usuarios registrados',
      backgroundColor: ['#f88406', '#fcff44', '#31e7e7']
    }]
  };

  public doughnutChartOption: any = {
    responsive: true
  };
  public doughnutChartPlugins = [DatalabelsPlugin];

  constructor(
    private administradoresServices: AdministradoresService
  ){}

  ngOnInit(): void {
    this.obtenerDatos();
    this.totalEventos();
  }

  public obtenerDatos() {
     this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        console.log("Datos recibidos:", response);
        this.total_user = response;
 
        const admin = this.total_user.admin || 0;
        const maestros = this.total_user.maestros || 0;
        const alumnos = this.total_user.alumnos || 0;

        // Crear nuevos objetos para forzar actualización
        this.pieChartData = {
          labels: ['Administradores', 'Maestros', 'Alumnos'],
          datasets: [
            {
              data: [admin, maestros, alumnos],
              label: 'Usuarios registrados',
              backgroundColor: ['#f88406', '#fcff44', '#31e731']
            }
          ]
        };

        this.doughnutChartData = {
          labels: ['Administradores', 'Maestros', 'Alumnos'],
          datasets: [
            {
              data: [admin, maestros, alumnos],
              label: 'Usuarios registrados',
              backgroundColor: ['#f88406', '#fcff44', '#31e7e7']
            }
          ]
        };
      },
      (error) => {
        alert("No se pudo obtener el total de usuarios");
      }
    );
  }

  public totalEventos() {
    this.administradoresServices.getTotalEventos().subscribe(
      (response) => {
        const eventos: any[] = Array.isArray(response) ? response : [];
        console.log("Tipo de dato:", typeof response);
        console.log("¿Es arreglo?:", Array.isArray(response));
        console.log("Datos completos:", response);


        // Contar eventos por mes
        const eventosPorMes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Enero - Diciembre
        const eventosPorTipo: { [key: string]: number } = {
          "Conferencia": 0,
          "Taller": 0,
          "Seminario": 0,
          "Concurso": 0
        };

        eventos.forEach(evento => {
          // Contar por mes
          const fecha = new Date(evento.fecha_realizacion);
          if (fecha instanceof Date && !isNaN(fecha.getMonth())) {
            const mesIndex = fecha.getMonth(); // 0-11
            eventosPorMes[mesIndex] += 1;
          }

          // Contar por tipo
          const tipo = evento.tipo_evento;
          if (tipo in eventosPorTipo) {
            eventosPorTipo[tipo] += 1;
          }
        });

        // Actualizar gráfico de línea (eventos por mes)
        this.lineChartData = {
          labels: [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
          ],
          datasets: [{
            data: eventosPorMes,
            label: 'Eventos por mes',
            borderColor: '#f88406',
            backgroundColor: '#f88406'
          }]
        };

        // Actualizar gráfico de barras (eventos por tipo)
        this.barChartData = {
          labels: Object.keys(eventosPorTipo),
          datasets: [{
            data: Object.values(eventosPorTipo),
            label: 'Eventos por tipo',
            backgroundColor: ['#f88406', '#fcff44', '#31e731']
          }]
        };

        // Forzar actualización de gráficas
        this.lineChartData = { ...this.lineChartData };
        this.barChartData = { ...this.barChartData };

      },
      (error) => {
        alert("No se pudieron cargar los eventos");
      }
    );
  }
}
