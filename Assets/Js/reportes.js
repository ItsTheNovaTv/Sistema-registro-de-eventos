import { db } from "./components/Firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
let datosEventos = [];

async function obtenerAños() {
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
            console.warn(`No se pudo acceder a ${año}_eventos`);
        }
    }

    // Añadir el año siguiente (aunque no tenga datos)
    añosDisponibles.push(añoExtra.toString());

    return añosDisponibles;
}

async function obtenerEquipos(año, evento, modalidad) {
    const equiposRef = collection(db, `${año}_eventos/${evento}/modalidad/${modalidad}/equipos`);
    const snapshot = await getDocs(equiposRef);
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            nombre: doc.id,
            asesor: data.Asesor || "",
            categoria: data.Categoria || "",
            integrantes: data.Integrantes || []
        };
    });
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
    const modalidad = document.getElementById("modalidad-combobox").value;
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
    if (modo === "equipos") {
        if (!evento || !modalidad) {
            alert("Selecciona evento y modalidad.");
            return;
        }

        const equipos = await obtenerEquipos(año, evento, modalidad);
        mostrarEquiposEnTabla(equipos, "Equipos");
    }

};

function mostrarEquiposEnTabla(datos, titulo = "Equipos") {
    const tbodyWeb = document.querySelector("#tabla-eventos tbody");
    const tituloWeb = document.getElementById("tituloTablaVisual");

    // Limpieza
    datosEventos = datos;
    tbodyWeb.innerHTML = "";
    tituloWeb.textContent = `Lista de ${titulo}`;

    if (!datos || datos.length === 0) {
        const fila = `<tr><td colspan="8" style="text-align:center;">No se encontraron ${titulo.toLowerCase()}.</td></tr>`;
        tbodyWeb.innerHTML = fila;
        return;
    }

    // Cabecera manual (porque cambia)
    const thead = document.querySelector("#tabla-eventos thead");
   thead.innerHTML = `
    <tr>
        <th style="border: 1px solid #ccc; padding: 8px;">#</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Equipo</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Asesor</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Categoría</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Integrante 1</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Integrante 2</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Integrante 3</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Integrante 4</th>
        <th style="border: 1px solid #ccc; padding: 8px;">Observación</th>
    </tr>
`;


    datos.forEach((equipo, index) => {
        const fila = `
            <tr>
                <td style="border: 1px solid #ccc; padding: 6px;">${index + 1}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${equipo.nombre}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${equipo.asesor}</td>
                <td style="border: 1px solid #ccc; padding: 6px;">${equipo.categoria}</td>
                ${[0, 1, 2, 3].map(i => `
                    <td style="border: 1px solid #ccc; padding: 6px;">
                        ${equipo.integrantes[i] || ""}
                    </td>
                `).join('')}
                <td style="border: 1px solid #ccc; padding: 6px;"></td>
            </tr>
        `;
        tbodyWeb.innerHTML += fila;
    });
}



document.addEventListener("DOMContentLoaded", async () => {
    const añoSelect = document.getElementById("año-combobox");
    const eventoSelect = document.getElementById("evento-combobox");
    const modalidadSelect = document.getElementById("modalidad-combobox");
    const btnEventos = document.getElementById("btnEventos");
    const btnModalidades = document.getElementById("btnModalidades");
    const btnEquipos = document.getElementById("btnEquipos");
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

    btnEquipos.addEventListener("click", async () => {
        window.modoSeleccionado = "equipos";
        await llenarAños();
        limpiarCombos();
        añoSelect.style.display = "block";
        eventoSelect.style.display = "block";
        modalidadSelect.style.display = "block";
    });



    añoSelect.addEventListener("change", async () => {
        const año = añoSelect.value;
        const modo = window.modoSeleccionado;

        if (!año || (modo !== "modalidades" && modo !== "equipos")) {
            eventoSelect.style.display = "none";
            modalidadSelect.style.display = "none";
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
        modalidadSelect.style.display = "none";
    });
    eventoSelect.addEventListener("change", async () => {
        const año = añoSelect.value;
        const evento = eventoSelect.value;
        const modo = window.modoSeleccionado;

        if (modo !== "equipos" || !año || !evento) {
            modalidadSelect.style.display = "none";
            return;
        }

        const modalidades = await obtenerModalidades(año, evento);
        modalidadSelect.innerHTML = `<option value="">Selecciona Modalidad</option>`;
        modalidades.forEach(mod => {
            const option = document.createElement("option");
            option.value = mod;
            option.textContent = mod;
            modalidadSelect.appendChild(option);
        });

        modalidadSelect.style.display = "block";
    });



    if (btnDescargarPDF) {
        document.getElementById("btnDescargarPDF").addEventListener("click", imprimirPlantillaComoPDF);
    }
    window.XLSX = XLSX;

});

document.getElementById("btnDescargarExcel").addEventListener("click", () => {
    const modo = window.modoSeleccionado || "eventos";
    const tabla = document.querySelector("#tabla-eventos");

    if (!tabla) {
        alert("No se encontró la tabla.");
        return;
    }

    const filas = Array.from(tabla.querySelectorAll("tr"));
    if (filas.length <= 1) {
        alert("No hay datos para exportar.");
        return;
    }

    const datos = filas.map(row =>
        Array.from(row.querySelectorAll("th, td")).map(cell => cell.textContent.trim())
    );

    // Agregar columna de Observación si es modo equipos
    if (modo === "equipos" && datos.length > 0) {
        datos[0].push("Observación");
        for (let i = 1; i < datos.length; i++) {
            datos[i].push("");
        }
    }

    const fecha = new Date().toLocaleDateString("es-MX", {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    const encabezado = [
        ["INSTITUTO TECNOLÓGICO SUPERIOR DE PUERTO PEÑASCO"],
        [`Departamento de Gestión – Reporte de ${modo}`],
        [`Fecha: ${fecha}`],
        [],
    ];

    const hoja = window.XLSX.utils.aoa_to_sheet([...encabezado, ...datos]);

    hoja["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }
    ];

    const range = window.XLSX.utils.decode_range(hoja["!ref"]);
    const filaEncabezados = encabezado.length;

    for (let R = 0; R <= range.e.r; ++R) {
        for (let C = 0; C <= range.e.c; ++C) {
            const celda = hoja[window.XLSX.utils.encode_cell({ r: R, c: C })];
            if (!celda) continue;

            celda.s = {
                font: {
                    name: "Calibri",
                    sz: R === 0 ? 16 : R <= 2 ? 12 : 11,
                    bold: R <= 2 || R === filaEncabezados,
                    color: R === filaEncabezados ? { rgb: "FFFFFF" } : { rgb: "000000" }
                },
                alignment: {
                    horizontal: "center",
                    vertical: "center",
                    wrapText: true
                },
                fill: R === filaEncabezados
                    ? { fgColor: { rgb: "1E88E5" } }  // Azul para encabezados
                    : R <= 2
                        ? { fgColor: { rgb: "ECEFF1" } }
                        : { fgColor: { rgb: "FFFFFF" } },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } }
                }
            };
        }
    }

    // Ajustar ancho de columnas (hasta 9 si es modo equipos)
    hoja["!cols"] = [
        { wch: 6 },   // #
        { wch: 25 },  // Equipo
        { wch: 25 },  // Asesor
        { wch: 20 },  // Categoría
        { wch: 20 },  // Int 1
        { wch: 20 },  // Int 2
        { wch: 20 },  // Int 3
        { wch: 20 },  // Int 4
        ...(modo === "equipos" ? [{ wch: 30 }] : []) // Observación solo si aplica
    ];

    const libro = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(libro, hoja, "Reporte");

    window.XLSX.writeFile(libro, `reporte_${modo}.xlsx`);
});
