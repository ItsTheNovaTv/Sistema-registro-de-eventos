import { db } from "./components/Firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let datosEventos = [];

async function obtenerAños() {
    const posiblesAños = ["2023", "2024", "2025"];
    const añosDisponibles = [];

    for (const año of posiblesAños) {
        try {
            const ref = collection(db, `${año}_eventos`);
            const snap = await getDocs(ref);
            if (!snap.empty) añosDisponibles.push(año);
        } catch (e) {
            console.warn(`No se pudo acceder a ${año}_eventos`);
        }
    }

    return añosDisponibles;
}

async function obtenerEventos(año) {
    const eventosRef = collection(db, `${año}_eventos`);
    const snapshot = await getDocs(eventosRef);
    return snapshot.docs.map(doc => doc.id);
}

async function obtenerModalidades(año, evento) {
    const modalidadesRef = collection(db, `${año}_eventos/${evento}/modalidad`);
    const snapshot = await getDocs(modalidadesRef);
    return snapshot.docs.map(doc => doc.id);
}

function mostrarEnTabla(datos, titulo = "Eventos") {

    const modo = window.modoSeleccionado;
    const tbodyWeb = document.querySelector("#tabla-eventos tbody");
    const tituloWeb = document.getElementById("tituloTablaVisual");

    const idPDF = modo === "modalidades" ? "tabla-modalidades-pdf" : "tabla-eventos-pdf";
    const idTitulo = modo === "modalidades" ? "tituloTablaModalidades" : "tituloTabla";

    const tbodyPDF = document.querySelector(`#${idPDF} tbody`);
    const tituloPDF = document.getElementById(idTitulo);

    datosEventos = datos;
    tbodyWeb.innerHTML = "";
    tbodyPDF.innerHTML = "";

    tituloWeb.textContent = `Lista de ${titulo}`;
    tituloPDF.textContent = `Lista de ${titulo}`;

    if (!datos || datos.length === 0) {
        const fila = `<tr><td colspan="2" style="text-align:center;">No se encontraron ${titulo.toLowerCase()}.</td></tr>`;
        tbodyWeb.innerHTML = fila;
        tbodyPDF.innerHTML = fila;
        return;
    }

    datos.forEach((item, index) => {
        const fila = `
          <tr>
              <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
              <td style="border: 1px solid #ccc; padding: 6px;">${item}</td>
          </tr>
        `;
        tbodyWeb.innerHTML += fila;
        tbodyPDF.innerHTML += fila;
    });
}

async function imprimirPlantillaComoPDF() {
    const modo = window.modoSeleccionado;
    let contenedor, fechaId;

    if (modo === "eventos") {
        contenedor = document.getElementById("plantillaPDFEventos");
        fechaId = "fechaReporte";
    } else if (modo === "modalidades") {
        contenedor = document.getElementById("plantillaPDFModalidades");
        fechaId = "fechaReporteModalidades";
    } else {
        alert("Selecciona un modo válido antes de exportar.");
        return;
    }

    if (!contenedor) {
        alert("No se encontró la plantilla del PDF.");
        return;
    }

    if (!datosEventos || datosEventos.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const fechaActual = new Date().toLocaleDateString("es-MX", {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const fechaEl = document.getElementById(fechaId);
    if (fechaEl) fechaEl.textContent = `Fecha de generación: ${fechaActual}`;

    // Mostrar temporalmente el contenedor
    contenedor.style.visibility = "visible";
    contenedor.style.position = "static";

    // Esperar a que el DOM se renderice
    await new Promise(resolve => setTimeout(resolve, 200));

    const canvas = await html2canvas(contenedor, {
        scale: 2,
        backgroundColor: null,
        useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`reporte_${modo}.pdf`);

    // Volver a ocultar el contenedor
    contenedor.style.visibility = "hidden";
    contenedor.style.position = "absolute";
}




// 🔹 Lógica de búsqueda según el modo
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


document.addEventListener("DOMContentLoaded", async () => {
    const añoSelect = document.getElementById("año-combobox");
    const eventoSelect = document.getElementById("evento-combobox");
    const modalidadSelect = document.getElementById("modalidad-combobox");
    const btnEventos = document.getElementById("btnEventos");
    const btnModalidades = document.getElementById("btnModalidades");
    const btnDescargarPDF = document.getElementById("btnDescargarPDF");

    añoSelect.style.display = "none";
    eventoSelect.style.display = "none";
    modalidadSelect.style.display = "none";

    window.modoSeleccionado = "eventos";

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
        window.modoSeleccionado = "eventos";
        await llenarAños();
        limpiarCombos();
        añoSelect.style.display = "block";
        eventoSelect.style.display = "none";
        modalidadSelect.style.display = "none";
    });

    btnModalidades.addEventListener("click", async () => {
        window.modoSeleccionado = "modalidades";
        await llenarAños();
        limpiarCombos();
        añoSelect.style.display = "block";
        eventoSelect.style.display = "none";
        modalidadSelect.style.display = "none";
    });

    añoSelect.addEventListener("change", async () => {
        const año = añoSelect.value;
        if (!año || window.modoSeleccionado !== "modalidades") {
            eventoSelect.style.display = "none";
            return;
        }

        const eventos = await obtenerEventos(año);
        eventoSelect.innerHTML = `<option value="">Selecciona Evento</option>`;
        eventos.forEach(ev => {
            const option = document.createElement("option");
            option.value = ev;
            option.textContent = ev;
            eventoSelect.appendChild(option);
        });

        eventoSelect.style.display = "block";
    });

    if (btnDescargarPDF) {
        document.getElementById("btnDescargarPDF").addEventListener("click", imprimirPlantillaComoPDF);
    }
});

document.getElementById("btnDescargarExcel").addEventListener("click", () => {
    const modo = window.modoSeleccionado || "eventos";
    const datos = window.datosEventos;

    if (!Array.isArray(datos) || datos.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const encabezados = [["#", "Nombre"]];
    const filas = datos.map((nombre, index) => [index + 1, nombre]);
    const hoja = XLSX.utils.aoa_to_sheet(encabezados.concat(filas));

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Reporte");

    XLSX.writeFile(libro, `reporte_${modo}.xlsx`);
});

