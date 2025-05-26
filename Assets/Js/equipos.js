import {
  obtenerAños,
  obtenerEventos,
  obtenerModalidades,
  obtenerEquipos
} from "./components/consultas.js";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
let equipoEnEdicion = null; // al inicio del archivo

import { db } from "../Js/components/Firebase.js";

// 🔹 Renderizar equipos con configuración dinámica
const formEditar = document.getElementById("formEditarEquipo");
formEditar?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!equipoEnEdicion) {
    mostrarToast("⚠️ No hay equipo seleccionado para editar.", "warning");
    return;
  }

  const configRef = doc(db, `${equipoEnEdicion.año}_eventos/${equipoEnEdicion.evento}/modalidad/${equipoEnEdicion.modalidad}/campos_config/config`);
  const configSnap = await getDoc(configRef);
  if (!configSnap.exists()) return;

  const { campos } = configSnap.data();
  const nuevoDoc = {};

  campos.forEach((campo, i) => {
    if (campo.tipo === "lista") {
      nuevoDoc[campo.nombre] = [];
      for (let j = 0; j < campo.cantidad; j++) {
        const val = formEditar[`campo_${i}_${j}`]?.value || "";
        nuevoDoc[campo.nombre].push(val);
      }
    } else {
      nuevoDoc[campo.nombre] = formEditar[`campo_${i}`]?.value || "";
    }
  });

  try {
    const equipoRef = doc(db, `${equipoEnEdicion.año}_eventos/${equipoEnEdicion.evento}/modalidad/${equipoEnEdicion.modalidad}/equipos/${equipoEnEdicion.equipoId}`);
    await updateDoc(equipoRef, nuevoDoc);
    mostrarToast("✅ Equipo actualizado correctamente.", "success");
    document.getElementById("modalEditarEquipo").classList.add("oculto");
    document.getElementById("contenedorCamposEditar").innerHTML = ""; // Limpia campos al guardar
  } catch (err) {
    console.error("Error al actualizar equipo:", err);
    mostrarToast("❌ Error al actualizar equipo.", "error");
  }
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

document.addEventListener("DOMContentLoaded", async () => {
  const añoSelect = document.getElementById("año-combobox");
  const eventoSelect = document.getElementById("evento-combobox");
  const modalidadSelect = document.getElementById("modalidad-combobox");
  const contenedorEquipos = document.getElementById("contenedor-equipos");
  const btnBuscar = document.getElementById("btnUsuariosFiltro");

  const años = await obtenerAños();
  años.forEach(año => {
    const option = document.createElement("option");
    option.value = año;
    option.textContent = año;
    añoSelect.appendChild(option);
  });

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

  btnBuscar.addEventListener("click", async () => {
    const año = añoSelect.value;
    const evento = eventoSelect.value;
    const modalidad = modalidadSelect.value;

    if (!año || !evento || !modalidad) {
      contenedorEquipos.innerHTML = `<p>Por favor, selecciona año, evento y modalidad.</p>`;
      return;
    }

    const equipos = await obtenerEquipos(año, evento, modalidad);
    await renderizarEquiposConConfig(año, evento, modalidad, equipos);
  });
});

// Reimplementación de renderizado dinámico
async function renderizarEquiposConConfig(año, evento, modalidad, equipos) {
  const contenedorEquipos = document.getElementById("contenedor-equipos");
  contenedorEquipos.innerHTML = "";

  const configRef = doc(db, `${año}_eventos/${evento}/modalidad/${modalidad}/campos_config/config`);
  const configSnap = await getDoc(configRef);

  if (!configSnap.exists()) {
    contenedorEquipos.innerHTML = "<p>No se encontró la configuración para esta modalidad.</p>";
    return;
  }

  const { campos } = configSnap.data();

  equipos.forEach(eq => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "module";

    let camposHTML = campos.map(campo => {
      let valor = eq[campo.nombre];
      if (Array.isArray(valor)) {
        valor = valor.join("<br>");
      }
      return `
        <p><strong>${campo.nombre}:</strong> ${valor || "No disponible"}</p>
      `;
    }).join("");

    tarjeta.innerHTML = `
      <div class="module-header">
        <h3>Equipo: ${eq.id}</h3>
        <p><strong>Evento:</strong> ${evento}</p>
        <p><strong>Modalidad:</strong> ${modalidad}</p>
      </div>
      <div class="module-body">
        ${camposHTML}
      </div>
      <div class="module-footer">
        <button class="btn-generar-constancia">Imprimir Constancia</button>
        <button class="btn-editar-equipo" data-id="${eq.id}">Editar</button>
      </div>
    `;

    tarjeta.querySelector(".btn-generar-constancia")?.addEventListener("click", () => {
      generarConstancia(eq, evento, modalidad);
    });

    tarjeta.querySelector(".btn-editar-equipo")?.addEventListener("click", () => {
      abrirModalEdicion(año, evento, modalidad, eq.id);
    });

    contenedorEquipos.appendChild(tarjeta);
  });
}

// Modal de edición de equipo
async function abrirModalEdicion(año, evento, modalidad, equipoId) {
  const configRef = doc(db, `${año}_eventos/${evento}/modalidad/${modalidad}/campos_config/config`);
  const configSnap = await getDoc(configRef);
  if (!configSnap.exists()) {
    mostrarToast("❌ No se encontró la configuración de la modalidad.", "error");
    return;
  }

  const equipoRef = doc(db, `${año}_eventos/${evento}/modalidad/${modalidad}/equipos/${equipoId}`);
  const equipoSnap = await getDoc(equipoRef);
  if (!equipoSnap.exists()) {
    mostrarToast("❌ No se encontró el equipo.", "error");
    return;
  }

  equipoEnEdicion = { año, evento, modalidad, equipoId }; // Actualiza el equipo en edición

  const datosEquipo = equipoSnap.data();
  const { campos } = configSnap.data();
  const contenedor = document.getElementById("contenedorCamposEditar");
  contenedor.innerHTML = "";

  campos.forEach((campo, i) => {
    const div = document.createElement("div");
    div.classList.add("campo-editable");

    if (campo.tipo === "text" || campo.tipo === "boolean") {
      div.innerHTML = `
        <label>${campo.nombre}:</label>
        <input type="text" name="campo_${i}" class="input" value="${datosEquipo[campo.nombre] || ''}" />
      `;
    } else if (campo.tipo === "select") {
      div.innerHTML = `
        <label>${campo.nombre}:</label>
        <select name="campo_${i}" class="input">
          ${campo.opciones.map(op => `<option value="${op}" ${datosEquipo[campo.nombre] === op ? 'selected' : ''}>${op}</option>`).join('')}
        </select>
      `;
    } else if (campo.tipo === "lista") {
      div.innerHTML = `
        <label>${campo.nombre}:</label>
        <div class="lista-campos" style="display: flex; flex-direction: column; gap: 5px;">
          ${[...Array(campo.cantidad)].map((_, j) => {
            const val = Array.isArray(datosEquipo[campo.nombre]) ? (datosEquipo[campo.nombre][j] || '') : '';
            return `<input type="text" name="campo_${i}_${j}" class="input" value="${val}" />`;
          }).join('')}
        </div>
      `;
    }

    contenedor.appendChild(div);
  });

  document.getElementById("modalEditarEquipo").classList.remove("oculto");
}

// Botón para cerrar el modal de edición
const btnCancelar = document.getElementById("btnCancelarEditar");
btnCancelar?.addEventListener("click", () => {
  document.getElementById("modalEditarEquipo").classList.add("oculto");
  document.getElementById("contenedorCamposEditar").innerHTML = "";
});