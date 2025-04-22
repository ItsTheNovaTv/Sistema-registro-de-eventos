import {
    obtenerAños,
    obtenerEventos,
    obtenerModalidades,
    obtenerEquipos
  } from "./consultas.js";
  
  document.addEventListener("DOMContentLoaded", async () => {
    const añoSelect = document.getElementById("año-combobox");
    const eventoSelect = document.getElementById("evento-combobox");
    const modalidadSelect = document.getElementById("modalidad-combobox");
    const contenedorEquipos = document.getElementById("contenedor-equipos");
    const btnBuscar = document.getElementById("btnUsuariosFiltro");
  
    // 🔹 Llenar años al cargar
    const años = await obtenerAños();
    años.forEach(año => {
      const option = document.createElement("option");
      option.value = año;
      option.textContent = año;
      añoSelect.appendChild(option);
    });
  
  // 🔹 Cuando cambia el año → cargar eventos inmediatamente
  añoSelect.addEventListener("change", async () => {
    const añoSeleccionado = añoSelect.value;
    console.log(añoSeleccionado);
    eventoSelect.innerHTML = `<option value="">Cargando eventos...</option>`;
    modalidadSelect.innerHTML = `<option value="">Selecciona modalidad</option>`;
    contenedorEquipos.innerHTML = "";

    if (!añoSeleccionado) {
      eventoSelect.innerHTML = `<option value="">Selecciona un año válido</option>`;
      return;
    }

    const eventos = await obtenerEventos(añoSeleccionado);
    eventoSelect.innerHTML = "";

    if (eventos.length === 0) {
      eventoSelect.innerHTML = `<option value="">No hay eventos</option>`;
      return;
    }

    eventos.forEach(evento => {
      const option = document.createElement("option");
      option.value = evento;
      option.textContent = evento;
      eventoSelect.appendChild(option);
    });
  });
  
    // 🔹 Cuando cambia el evento → cargar modalidades
    eventoSelect.addEventListener("change", async () => {
      const año = añoSelect.value;
      const evento = eventoSelect.value;
  
      modalidadSelect.innerHTML = `<option value="">Cargando modalidades...</option>`;
      contenedorEquipos.innerHTML = "";
  
      if (!año || !evento) return;
  
      const modalidades = await obtenerModalidades(año, evento);
      modalidadSelect.innerHTML = "";
  
      if (modalidades.length === 0) {
        modalidadSelect.innerHTML = `<option value="">No hay modalidades</option>`;
        return;
      }
  
      modalidades.forEach(modalidad => {
        const option = document.createElement("option");
        option.value = modalidad;
        option.textContent = modalidad;
        modalidadSelect.appendChild(option);
      });
    });
  
    // 🔹 Al hacer clic en "Buscar" → cargar tarjetas de equipos
    btnBuscar.addEventListener("click", async () => {
      contenedorEquipos.innerHTML = "";
  
      const año = añoSelect.value;
      const evento = eventoSelect.value;
      const modalidad = modalidadSelect.value;
  
      if (!año || !evento || !modalidad) {
        contenedorEquipos.innerHTML = `<p>Por favor, selecciona año, evento y modalidad.</p>`;
        return;
      }
  
      const equipos = await obtenerEquipos(año, evento, modalidad);
  
      if (equipos.length === 0) {
        contenedorEquipos.innerHTML = "<p>No se encontraron equipos.</p>";
        return;
      }
  
      equipos.forEach(eq => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "module";
        tarjeta.innerHTML = `
          <div class="module-header">
            <h3>ID: ${eq.id}</h3>
            <h3>${eq.Nombre}</h3>
          </div>
          <div class="module-body">
            <p><strong>Institución:</strong> ${eq.Institucion}</p>
            <p><strong>Asesor:</strong> ${eq.asesor}</p>
            <p><strong>Categoría:</strong> ${eq.categoria}</p>
            
            <p><strong>Integrantes:</strong><br>
              ${eq["integrante 1"] || ""}<br>
              ${eq["integrante 2"] || ""}<br>
              ${eq["integrante 3"] || ""}<br>
              ${eq["integrante 4"] || ""}
            </p>
          </div>
          <div class="module-footer">
           <p><strong>Contacto:</strong> ${eq.contacto}</p>
          </div>
          
        `;
        contenedorEquipos.appendChild(tarjeta);
      });
    });
  });
  