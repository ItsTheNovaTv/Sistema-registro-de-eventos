import {
  obtenerAños,
  obtenerEventos,
  obtenerModalidades,
  obtenerEquipos
} from "./components/consultas.js";

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

  // 🔹 Cuando cambia el año → cargar eventos
  añoSelect.addEventListener("change", async () => {
    const añoSeleccionado = añoSelect.value;
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

      // Manejo dinámico de integrantes
      let listaIntegrantes = "";
      if (Array.isArray(eq.Integrantes)) {
        eq.Integrantes.forEach(nombre => {
          listaIntegrantes += `${nombre}<br>`;
        });
      }

      tarjeta.innerHTML = `
        <div class="module-header">
          <h3>Equipo: ${eq.id}</h3>
          <p><strong>Evento:</strong> ${eventoSelect.value}</p>
          <p><strong>Modalidad:</strong> ${modalidadSelect.value}</p>
        </div>
  <div class="module-body">
    <p><strong>Institución:</strong> ${eq.Institucion || "No registrada"}</p>
    <p><strong>Asesor:</strong> ${eq.Asesor || "No registrado"}</p>
    <p><strong>Categoría:</strong> ${eq.Categoria || "No especificada"}</p>
    <p><strong>Integrantes:</strong><br>${listaIntegrantes}</p>
  </div>
  <div class="module-footer">
    <p><strong>Contacto:</strong> ${eq.Contacto || "No disponible"}</p>
    <button onclick='generarConstancia(${JSON.stringify(eq)}, "${eventoSelect.value}", "${modalidadSelect.value}")'>Imprimir Constancia</button>
  </div>
`;

      contenedorEquipos.appendChild(tarjeta);
    });
  });
});

window.generarConstancia = async function (equipo, evento, modalidad) {
  const integrantes = Array.isArray(equipo.Integrantes) ? equipo.Integrantes : [];

  if (integrantes.length === 0) {
    alert("Este equipo no tiene integrantes registrados.");
    return;
  }

  const hoy = new Date();
  const fechaTexto = hoy.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const plantilla = document.getElementById("plantilla-constancia");
  const zip = new JSZip();

  for (const integrante of integrantes) {
    // Rellenar texto dinámico en la plantilla
    document.getElementById("nombre-integrante").textContent = integrante;
    document.getElementById("detalle-evento").innerHTML = `Por su valiosa participación en el ${evento}, modalidad ${modalidad}, organizado por el Instituto Tecnológico Superior de Puerto Peñasco.`;
    document.getElementById("fecha-actual").textContent = `Puerto Peñasco, Sonora, ${fechaTexto}`;

    plantilla.style.display = "block";

    // Capturar como imagen
    const canvas = await html2canvas(plantilla, {
      scale: 2  // Mejora resolución
    });
    const imgData = canvas.toDataURL("image/png");

    // Crear PDF en formato A4 (210x297 mm)
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = 210;
    const pdfHeight = 297;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Guardar PDF como blob
    const pdfBlob = pdf.output("blob");
    const nombreArchivo = `Constancia_${integrante.replace(/\s+/g, "_")}.pdf`;

    zip.file(nombreArchivo, pdfBlob);
  }

  plantilla.style.display = "none";

  // Descargar archivo .zip con todas las constancias
  zip.generateAsync({ type: "blob" }).then(function (content) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `Constancias_${equipo.id}.zip`;
    link.click();
  });
};




