import { db } from "./Firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
export async function obtenerAños() {
  const añoActual = new Date().getFullYear();
  const años = [];
  for (let año = 2000; año <= añoActual; año++) {
    años.push(año.toString());
  }
  return años.reverse(); // Más reciente primero
}

// 🔹 USUARIOS
export async function obtenerUsuarios() {
  const ref = collection(db, "usuarios");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// 🔹 EVENTOS por año
// Ruta: /2025_eventos/
export async function obtenerEventos(año) {
  if (!año) throw new Error("❌ El año no puede estar vacío.");
  const eventosRef = collection(db, `${año}_eventos`);
  const snapshot = await getDocs(eventosRef);
  return snapshot.docs.map(doc => doc.id); // Ej: ["programacion", "robotica"]
}

// 🔹 MODALIDADES
export async function obtenerModalidades(año, evento) {
  const modalidadesRef = collection(db, `${año}_eventos/${evento}/modalidad`);
  const snapshot = await getDocs(modalidadesRef);
  return snapshot.docs.map(doc => doc.id);
}

// 🔹 EQUIPOS
export async function obtenerEquipos(año, evento, modalidad) {
  const equiposRef = collection(db, `${año}_eventos/${evento}/modalidad/${modalidad}/equipos`);
  const snapshot = await getDocs(equiposRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ En caso de que no existan los elementos, evitar errores, si se agrega otro componente u otro DOMListener, agregar aquí y en el if de abajo
  const añoSelect = document.getElementById("año-combobox");
  const eventoSelect = document.getElementById("evento-combobox");
  const modalidadSelect = document.getElementById("modalidad-combobox");
  const btnEventos = document.getElementById("btnEventos");
  const btnModalidades = document.getElementById("btnModalidades");
  const btnDescargarPDF = document.getElementById("btnDescargarPDF");

  let modo = "";
  window.modoSeleccionado = modo;

  // ✅ Evita error si los elementos no existen en esta página
  if (!btnEventos || !btnModalidades || !añoSelect || !eventoSelect || !modalidadSelect) return;
  
// 🔹 AÑOS DISPONIBLES (2000 hasta el año actual)



//
if (location.pathname.includes("reportes.html")) {
  import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(({ jsPDF }) => {
    window.jspdf = { jsPDF }; // Exponerlo globalmente
  });

  import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");

  document.addEventListener("DOMContentLoaded", async () => {
    const año = "2025";
    const evento = "programacion";
    const modalidad = "estructuras complejas";

    const equipos = await obtenerEquipos(año, evento, modalidad);
    const tbody = document.getElementById("tabla-equipos");

    equipos.forEach(equipo => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${equipo.nombre || 'Sin nombre'}</td>
        <td>${equipo.institucion || 'N/A'}</td>
        <td>${equipo.asesor || 'N/A'}</td>
        <td>
          ${equipo['integrante 1'] || ''},
          ${equipo['integrante 2'] || ''},
          ${equipo['integrante 3'] || ''},
          ${equipo['integrante 4'] || ''}
        </td>
      `;
      tbody.appendChild(fila);
    });

    // Generar PDF
    window.generarPDF = async function () {
      const doc = new window.jspdf.jsPDF();
      const elemento = document.getElementById('contenido-pdf');

      await html2canvas(elemento).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        document.getElementById('visorPDF').src = url;
      });
    };
  });
}


// ✅ Cargar jsPDF y html2canvas si estamos en reportes.html
if (location.pathname.includes("reportes.html")) {
  import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js").then(({ jsPDF }) => {
    window.jspdf = { jsPDF };
  });
  import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
}

let datosEventos = [];

// ✅ Mostrar tabla y actualizar título dinámicamente
function mostrarEnTabla(datos, titulo = "Eventos") {
  const tbody = document.querySelector("#tabla-eventos tbody");
  const tituloTabla = document.getElementById("tituloTabla");

  tbody.innerHTML = "";
  tituloTabla.textContent = `Lista de ${titulo}`;

  if (datos.length === 0) {
    const fila = document.createElement("tr");
    fila.innerHTML = `<td colspan="2" style="text-align:center; padding:10px;">No se encontraron ${titulo.toLowerCase()}.</td>`;
    tbody.appendChild(fila);
    return;
  }

  datos.forEach((item, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td style="border:1px solid #ccc; padding:6px;">${index + 1}</td>
      <td style="border:1px solid #ccc; padding:6px;">${item}</td>
    `;
    tbody.appendChild(fila);
  });

  datosEventos = datos;
}

// ✅ Generar PDF desde plantilla HTML
async function imprimirPlantillaComoPDF() {
  const contenedor = document.getElementById("plantillaPDF");

  if (!contenedor || datosEventos.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  while (!window.jspdf || !window.jspdf.jsPDF) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const canvas = await html2canvas(contenedor, { scale: 2 });

  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("reporte.pdf");
}


// ✅ Buscar datos al dar clic en Buscar
window.buscarEquipos = async function () {
  const año = document.getElementById("año-combobox").value;
  const evento = document.getElementById("evento-combobox").value;
  const modo = window.modoSeleccionado || "";

  if (!año) {
    alert("Selecciona un año.");
    return;
  }

  if (modo === "eventos") {
    const eventos = await obtenerEventos(año);
    mostrarEnTabla(eventos, "Eventos");
    return;
  }

  if (modo === "modalidades") {
    if (!evento) {
      alert("Selecciona un evento.");
      return;
    }

    const modalidades = await obtenerModalidades(año, evento);
    mostrarEnTabla(modalidades, "Modalidades");
  }
};

// ✅ Configuración de interfaz
document.addEventListener("DOMContentLoaded", async () => {
  const añoSelect = document.getElementById("año-combobox");
  const eventoSelect = document.getElementById("evento-combobox");
  const modalidadSelect = document.getElementById("modalidad-combobox");
  const btnEventos = document.getElementById("btnEventos");
  const btnModalidades = document.getElementById("btnModalidades");
  const btnDescargarPDF = document.getElementById("btnDescargarPDF");

  let modo = "";
  window.modoSeleccionado = modo;

  // ✅ Ocultar combos al iniciar
  setTimeout(() => {
    añoSelect.style.display = "none";
    eventoSelect.style.display = "none";
    modalidadSelect.style.display = "none";
  }, 0);

  const limpiarCombos = () => {
    añoSelect.value = "";
    eventoSelect.innerHTML = `<option value="">Selecciona Evento</option>`;
    modalidadSelect.innerHTML = `<option value="">Selecciona Modalidad</option>`;
  };

  const llenarAños = async () => {
    const años = await obtenerAños();
    añoSelect.innerHTML = `<option value="">Selecciona año</option>`;
    años.forEach(a => {
      const option = document.createElement("option");
      option.value = a;
      option.textContent = a;
      añoSelect.appendChild(option);
    });
  };

  btnEventos.addEventListener("click", async () => {
    modo = "eventos";
    window.modoSeleccionado = modo;
    await llenarAños();
    limpiarCombos();

    añoSelect.style.display = "block";
    eventoSelect.style.display = "none";
    modalidadSelect.style.display = "none";
  });

  btnModalidades.addEventListener("click", async () => {
    modo = "modalidades";
    window.modoSeleccionado = modo;
    await llenarAños();
    limpiarCombos();

    añoSelect.style.display = "block";
    eventoSelect.style.display = "none";
    modalidadSelect.style.display = "none";
  });

  añoSelect.addEventListener("change", async () => {
    const año = añoSelect.value;

    if (!año) {
      eventoSelect.style.display = "none";
      return;
    }

    if (window.modoSeleccionado === "modalidades") {
      const eventos = await obtenerEventos(año);
      eventoSelect.innerHTML = `<option value="">Selecciona Evento</option>`;
      eventos.forEach(ev => {
        const option = document.createElement("option");
        option.value = ev;
        option.textContent = ev;
        eventoSelect.appendChild(option);
      });

      eventoSelect.style.display = "block";
    }
  });

  modalidadSelect.style.display = "none";

  if (btnDescargarPDF) {
    btnDescargarPDF.addEventListener("click", imprimirPlantillaComoPDF);
  }
});
});