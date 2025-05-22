import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { EditarEventoComponent } from 'src/app/modals/editar-evento/editar-evento.component';
import { EventosService } from 'src/app/services/eventos.service';
declare var $:any;

@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventosComponent implements OnInit{
  public tipo:string = "registro-eventos";
  public editar:boolean = false;
  public evento:any = {};
  public token: string = "";
  public errors:any = {};
  public lista_responsables: any[] = [];

  //selects
  public tipos: any[] = [
    {value: '1', viewValue: 'Conferencia'},
    {value: '2', viewValue: 'Taller'},
    {value: '3', viewValue: 'Seminario'},
    {value: '4', viewValue: 'Concurso'}
  ];

  public publicos: any[] = [
    {value: '1', personas: 'Estudiantes'},
    {value: '2', personas: 'Profesores'},
    {value: '3', personas: 'Público General'}
  ];

  public programas: any[] = [
    {value: '1', carrera: 'Ingeniería en Ciencias de la Computación'},
    {value: '2', carrera: 'Licenciatura en Ciencias de la Computación'},
    {value: '3', carrera: 'Ingeniería en Tecnologías de la Información'}
  ]
  
  constructor(
    private location: Location,
    private router: Router,
    private eventosService: EventosService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
  ){}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editar = true;

        this.eventosService.getEventoByID(id).subscribe(
          (response) => {
            this.evento = response;

            //Convertir publico_json si viene como string
            if (!Array.isArray(this.evento.publico_json)) {
              try {
                this.evento.publico_json = JSON.parse(this.evento.publico_json || "[]");
              } catch {
                this.evento.publico_json = [];
              }
            }

            console.log("Datos cargados:", this.evento);
          },
          (error) => {
            alert("No se pudo cargar el evento");
            this.router.navigate(["/eventos"]);
          }
        );
      } else {
        this.evento = this.eventosService.esquemaEvento();
      }
    });
    this.obtenerResponsables();
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.evento.fecha_realizacion = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.evento.fecha_realizacion);
  }

  public checkboxChange(event:any){
    console.log("Evento: ", event);
    if(event.checked){
      this.evento.publico_json.push(event.source.value)
    }else{
      console.log(event.source.value);
      this.evento.publico_json.forEach((publico, i) => {
        if(publico == event.source.value){
          this.evento.publico_json.splice(i,1)
        }
      });
    }
    if (!this.evento.publico_json.includes("Estudiantes")) {
      this.evento.programa_educativo = "";
    }
    console.log("Array publico: ", this.evento);
  }

  get estudiantesSeleccionados(): boolean {
    return Array.isArray(this.evento.publico_json) && this.evento.publico_json.includes('Estudiantes');
  }

  public revisarSeleccion(personas: string){
    return Array.isArray(this.evento.publico_json) && this.evento.publico_json.includes(personas);
  }

  public sinSignos(event: KeyboardEvent){
    const charCode = event.key.charCodeAt(0);
    if (
      !(charCode >= 48 && charCode <= 57) &&  // Numeros
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) &&  // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }

  public parrafo(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      !(charCode >= 48 && charCode <= 57) && // Números
      !(charCode >= 44 && charCode <= 46) && // Signos de puntiación
      !(charCode >= 58 && charCode <= 59) && // Signos de puntiación
      charCode !== 33 &&                          // Signos de puntiación
      charCode !== 63 &&                          // Signos de puntiación
      charCode !== 168 &&                          // Signos de puntiación
      charCode !== 173 &&                          // Signos de puntiación
      charCode !== 32                           // Espacio
    ) {
      event.preventDefault();
    }
  }

  public regresar(){
    this.location.back();
  }

  public registrar(){
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);

    if (!$.isEmptyObject(this.errors)) {
      return false;
    }

    // Asegúrate de convertir publico_json a string JSON
    if (typeof this.evento.publico_json === 'string') {
      try {
        this.evento.publico_json = JSON.parse(this.evento.publico_json);
      } catch {
        this.evento.publico_json = [];
      }
    }

    const eventoParaEnviar = {
      ...this.evento,
      publico_json: JSON.stringify(this.evento.publico_json),
      hora_inicio: this.evento.hora_inicio,
      hora_final: this.evento.hora_final,
      cupo_maximo: parseInt(this.evento.cupo_maximo, 10)
    };

    // Convertir programa_educativo a string si viene vacío
    if (!this.evento.programa_educativo) {
      this.evento.programa_educativo = "";
    }

    this.eventosService.registrarEvento(eventoParaEnviar).subscribe(
      (response) => {
        alert("Evento registrado correctamente");
        this.router.navigate(["home"]);
      },
      (error) => {
        console.error("Error detallado:", error);
        const mensaje = error.error?.detalle || error.error?.error || "Datos inválidos";
        alert(mensaje);
      }
    );
  }

  public actualizar(){
    this.errors = this.eventosService.validarEvento(this.evento, this.editar);

    if (!$.isEmptyObject(this.errors)) {
      return false;
    }

    // Asegúrate de que publico_json sea arreglo
    if (typeof this.evento.publico_json === 'string') {
      try {
        this.evento.publico_json = JSON.parse(this.evento.publico_json);
      } catch {
        this.evento.publico_json = [];
      }
    }

    // Resetear programa_educativo si no hay estudiantes
    if (!this.evento.publico_json.includes("Estudiantes")) {
      this.evento.programa_educativo = "";
    }

    // Convertir horas a formato HH:MM:SS si están sin segundos
    if (this.evento.hora_inicio && this.evento.hora_inicio.length < 8) {
      this.evento.hora_inicio += ":00"; // "14:00" → "14:00:00"
    }
    if (this.evento.hora_final && this.evento.hora_final.length < 8) {
      this.evento.hora_final += ":00";
    }

    // Convertir cupo_maximo a número
    if (typeof this.evento.cupo_maximo === "string") {
      const cupo = parseInt(this.evento.cupo_maximo, 10);
      if (!isNaN(cupo)) {
        this.evento.cupo_maximo = cupo;
      } else {
        this.errors["cupo_maximo"] = "El cupo debe ser un número válido";
        return false;
      }
    }

    this.abrirModalEditar(this.evento);
  }

  public obtenerResponsables(){
    this.eventosService.obtenerListaResponsables().subscribe(
      (response)=>{
        const admins = response.administradores || [];
        const maestros = response.maestros || [];

        // Procesamos y combinamos ambas listas en una sola con nombres completos
        this.lista_responsables = [
          ...admins.map(a => ({
            id: a.id,
            nombreCompleto: `${a.user.first_name} ${a.user.last_name}`
          })),
          ...maestros.map(m => ({
            id: m.id,
            nombreCompleto: `${m.user.first_name} ${m.user.last_name}`
          }))
        ];
      }, (error)=>{
        alert("No se pudo obtener la lista de los responsables");
      }
    );
  }

  cargarEvento(id: number) {
    this.eventosService.getEventoByID(id).subscribe(
      (response) => {
        this.evento = response;
        console.log("Datos cargados:", this.evento);
      },
      (error) => {
        alert("No se pudo cargar el evento");
        this.router.navigate(["/eventos"]);
      }
    );
  }

  public abrirModalEditar(idUser: number) {
      const dialogRef = this.dialog.open(EditarEventoComponent, {
        data: { evento: this.evento },
        height: '288px',
        width: '328px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result?.isEdited) {
          //confirmado → Mandar al backend

          // Convertir publico_json a string antes de enviar
          const eventoParaEnviar = {
            ...this.evento,
            publico_json: JSON.stringify(this.evento.publico_json)
          };

          this.eventosService.editarEvento(eventoParaEnviar).subscribe(
            (response) => {
              alert("Evento actualizado correctamente");
              this.router.navigate(["/eventos"]);
            },
            (error) => {
              alert("No se pudo actualizar el evento");
              console.error("Error al guardar:", error);
            }
          );
        } else {
          //Cancelado → No hacer nada
          console.log("Edición cancelada por el usuario");
        }
      });
    }
}
