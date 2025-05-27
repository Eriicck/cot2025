document.addEventListener('DOMContentLoaded', function() {

    // --- DATOS (simulados, luego vendrán del backend) ---
    const profesionalesData = {
        traumatologia: [
            { id: 1, nombre: "Dr. Juan Pérez", matricula: "MN 12345", foto: "img/Raul.avif", bio: "Especialista en rodilla y cadera, artroscopias y reemplazos articulares." },
            { id: 2, nombre: "Dra. Ana Gómez", matricula: "MN 67890", foto: "img/dra2.avif", bio: "Experta en medicina deportiva y rehabilitación de lesiones de hombro y codo." }
        ],
        pediatria: [
            { id: 3, nombre: "Dr. Carlos López", matricula: "MN 11223", foto: "img/doc1.jpg", bio: "Pediatra con enfoque en neonatología y seguimiento del desarrollo infantil." },
            { id: 4, nombre: "Dra. Laura Fernández", matricula: "MN 44556", foto: "img/doc2pediatra.jpg", bio: "Atención integral del niño y adolescente, puericultura y vacunas." }
        ],
        neurologia: [
            { id: 5, nombre: "Dr. Martín Rodríguez", matricula: "MN 77889", foto: "img/Dr. 2.avif", bio: "Especializado en enfermedades neurodegenerativas como Alzheimer y Parkinson." },
            { id: 6, nombre: "Dra. Sofía Torres", matricula: "MN 99001", foto: "img/Dra. Victoria.avif", bio: "Neurología clínica general, cefaleas, epilepsia y trastornos del sueño." }
        ]
    };
    // Asegúrate de tener imágenes en img/ con esos nombres o cambia las rutas

    const especialidadesParaTurnos = [
        { id_db: 1, clave_js: 'traumatologia', nombre: 'Traumatología' }, // Asumimos que 1 es el ID en BD para traumatologia
        { id_db: 2, clave_js: 'pediatria', nombre: 'Pediatría' },     // Asumimos que 2 es el ID en BD para pediatria
        { id_db: 3, clave_js: 'neurologia', nombre: 'Neurología' }    // Asumimos que 3 es el ID en BD para neurologia
    ];


    // --- MENÚ HAMBURGUESA ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            // Cambiar icono de hamburguesa a X y viceversa
            const icon = navToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- MOSTRAR/OCULTAR PROFESIONALES ---
    const botonesVerProfesionales = document.querySelectorAll('.especialidad-card .btn-ver-profesionales');
    const seccionProfesionales = document.getElementById('profesionales');
    const listaProfesionalesDiv = document.getElementById('lista-profesionales');
    const nombreEspecialidadSeleccionadaSpan = document.getElementById('nombre-especialidad-seleccionada');
    const btnCerrarProfesionales = document.getElementById('btn-cerrar-profesionales');

    botonesVerProfesionales.forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.especialidad-card');
            const especialidadKey = card.dataset.especialidad; // 'traumatologia', 'pediatria', etc.
            const profesionales = profesionalesData[especialidadKey];
            
            const especialidadNombre = card.querySelector('h3').textContent;
            if(nombreEspecialidadSeleccionadaSpan) nombreEspecialidadSeleccionadaSpan.textContent = `- ${especialidadNombre}`;
            
            if(listaProfesionalesDiv) listaProfesionalesDiv.innerHTML = ''; // Limpiar anteriores

            if (profesionales && listaProfesionalesDiv) {
                profesionales.forEach(prof => {
                    const profHTML = `
                        <div class="profesional-card">
                            <img src="${prof.foto}" alt="Foto de ${prof.nombre}">
                            <h4>${prof.nombre}</h4>
                            <p>Matrícula: ${prof.matricula}</p>
                            <p class="bio">${prof.bio}</p>
                        </div>
                    `;
                    listaProfesionalesDiv.innerHTML += profHTML;
                });
                if(seccionProfesionales) {
                    seccionProfesionales.style.display = 'block';
                    seccionProfesionales.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    if (btnCerrarProfesionales && seccionProfesionales) {
        btnCerrarProfesionales.addEventListener('click', () => {
            seccionProfesionales.style.display = 'none';
            const seccionEspecialidades = document.getElementById('especialidades');
            if (seccionEspecialidades) seccionEspecialidades.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- MAPA CON LEAFLET.JS ---
    const mapaDiv = document.getElementById('mapa');
    if (mapaDiv) {
        const map = L.map('mapa').setView([-34.64948297063554, -58.78710022512634], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        L.marker([-34.64948297063554, -58.78710022512634]).addTo(map)
            .bindPopup('Consultorios Médicos Aquí.<br> Calle Falsa 123.')
            .openPopup();
    }

    // --- FORMULARIO DE TURNOS (LÓGICA FRONTEND INICIAL) ---
    const selectEspecialidadTurno = document.getElementById('especialidad-turno');
    const selectDoctorTurno = document.getElementById('doctor-turno');
    const selectHoraTurno = document.getElementById('hora-turno');
    const formTurnos = document.getElementById('form-turnos');
    const mensajeTurnoDiv = document.getElementById('mensaje-turno');
    const inputFechaTurno = document.getElementById('fecha-turno');

    // Cargar especialidades en el select de turnos
    function cargarEspecialidadesSelect() {
        if (!selectEspecialidadTurno) return;
        especialidadesParaTurnos.forEach(esp => {
            const option = document.createElement('option');
            option.value = esp.clave_js; // Usamos la clave_js para buscar en profesionalesData
            option.dataset.idDb = esp.id_db; // Guardamos el ID de la BD aquí
            option.textContent = esp.nombre;
            selectEspecialidadTurno.appendChild(option);
        });
    }
    
    if(selectEspecialidadTurno) cargarEspecialidadesSelect();

    // Cargar doctores cuando se selecciona una especialidad
    if (selectEspecialidadTurno) {
        selectEspecialidadTurno.addEventListener('change', function() {
            const especialidadKey = this.value; // 'traumatologia', etc.
            
            if(selectDoctorTurno) {
                selectDoctorTurno.innerHTML = '<option value="">Seleccione un doctor</option>'; // Limpiar
                selectDoctorTurno.disabled = true;
            }
            if(selectHoraTurno) {
                selectHoraTurno.innerHTML = '<option value="">Seleccione una hora disponible</option>';
                selectHoraTurno.disabled = true;
            }


            if (especialidadKey && profesionalesData[especialidadKey] && selectDoctorTurno) {
                profesionalesData[especialidadKey].forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.id; // ID numérico del doctor
                    option.textContent = doc.nombre;
                    selectDoctorTurno.appendChild(option);
                });
                selectDoctorTurno.disabled = false;
            }
        });
    }

    // Cargar horas disponibles (simulado) cuando se selecciona un doctor y fecha
    function cargarHorasDisponibles() {
        if (!selectDoctorTurno || !inputFechaTurno || !selectHoraTurno) return;
        
        // Aquí idealmente harías una llamada fetch al backend para obtener horarios
        // Para simular:
        selectHoraTurno.innerHTML = '<option value="">Seleccione una hora disponible</option>';
        if(selectDoctorTurno.value && inputFechaTurno.value) { // Si hay un doctor y fecha seleccionados
            const horasMock = ["09:00", "09:30", "10:00", "10:30", "11:00", "15:00", "15:30", "16:00"];
            horasMock.forEach(hora => {
                const option = new Option(hora, hora);
                selectHoraTurno.add(option);
            });
            selectHoraTurno.disabled = false;
        } else {
            selectHoraTurno.disabled = true;
        }
    }

    if(selectDoctorTurno) selectDoctorTurno.addEventListener('change', cargarHorasDisponibles);
    if(inputFechaTurno) inputFechaTurno.addEventListener('change', cargarHorasDisponibles);


    // Envío del Formulario (simulado, luego irá al backend)
    if (formTurnos) {
        formTurnos.addEventListener('submit', async function(e) {
            e.preventDefault();
            if(mensajeTurnoDiv) mensajeTurnoDiv.textContent = 'Procesando solicitud...';
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());

            // Obtener el ID de especialidad para la base de datos
            const selectedEspecialidadOption = selectEspecialidadTurno.options[selectEspecialidadTurno.selectedIndex];
            data.especialidad_id_db = selectedEspecialidadOption ? selectedEspecialidadOption.dataset.idDb : null;
            // data.doctor_id ya está (es el value del select de doctores)

            console.log("Datos a enviar (simulado):", data);

            // SIMULACIÓN DE LLAMADA A API (reemplazar con fetch real más adelante)
            setTimeout(() => {
                const exito = Math.random() > 0.3; // Simular éxito o fallo
                if (exito) {
                    if(mensajeTurnoDiv) {
                        mensajeTurnoDiv.textContent = `Turno solicitado con éxito para el ${data.fecha} a las ${data.hora}. Nos comunicaremos para confirmar.`;
                        mensajeTurnoDiv.style.color = 'green';
                        mensajeTurnoDiv.style.backgroundColor = '#e6ffed';
                        mensajeTurnoDiv.style.border = '1px solid green';
                    }
                    formTurnos.reset();
                    // Resetear selects dependientes
                    if(selectDoctorTurno) {
                        selectDoctorTurno.innerHTML = '<option value="">Seleccione un doctor</option>';
                        selectDoctorTurno.disabled = true;
                    }
                    if(selectHoraTurno) {
                        selectHoraTurno.innerHTML = '<option value="">Seleccione una hora disponible</option>';
                        selectHoraTurno.disabled = true;
                    }
                    if(selectEspecialidadTurno) selectEspecialidadTurno.value = "";

                } else {
                    if(mensajeTurnoDiv) {
                        mensajeTurnoDiv.textContent = `Error: No se pudo solicitar el turno en este momento. Intente más tarde.`;
                        mensajeTurnoDiv.style.color = 'red';
                        mensajeTurnoDiv.style.backgroundColor = '#ffe6e6';
                        mensajeTurnoDiv.style.border = '1px solid red';
                    }
                }
            }, 1500);
        });
    }


    // --- AÑO ACTUAL EN FOOTER ---
    const currentYearSpan = document.getElementById('currentYear');
    if(currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

}); // Fin de DOMContentLoaded