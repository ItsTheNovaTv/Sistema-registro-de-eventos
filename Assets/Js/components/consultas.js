import { db } from "./Firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


export async function obtenerAños() {
 const añoInicio = 2020;
    const añoActual = new Date().getFullYear();
    const añoExtra = añoActual + 1;

    const añosDisponibles = [];

    for (let año = añoInicio; año <= añoActual; año++) {
        try {
            const ref = collection(db, `${año}_eventos`);
            const snap = await getDocs(ref);
            if (!snap.empty) {
                añosDisponibles.push(año.toString());
            }
        } catch (e) {
            console.warn("No se pudo acceder a "`${año}_eventos`);
        }
    }

    // Añadir el año siguiente (aunque no tenga datos)
    añosDisponibles.push(añoExtra.toString());

    return añosDisponibles;
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
});