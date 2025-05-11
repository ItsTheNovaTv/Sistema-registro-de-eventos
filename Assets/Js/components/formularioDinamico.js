
// formularioDinamico.js
import { registrarEquipo } from "./registrarEquipoFlexible.js";

// Define configuraciones por modalidad
const configuracionesPorModalidad = {
  "hackathon": [
    { nombre: "Nombre", tipo: "text", obligatorio: true },
    { nombre: "Institucion", tipo: "text", obligatorio: true },
    { nombre: "Asesor", tipo: "text", obligatorio: false },
    { nombre: "Contacto", tipo: "text", obligatorio: true },
    { nombre: "Integrantes", tipo: "textarea", obligatorio: true }
  ],
  "lineaRecta": [
    { nombre: "nombreEquipo", tipo: "text", obligatorio: true },
    { nombre: "escuela", tipo: "text", obligatorio: true },
    { nombre: "participantes", tipo: "textarea", obligatorio: true },
    { nombre: "velocidadMedia", tipo: "text", obligatorio: false }
  ]
};

const añoSelect = document.getElementById("año");
const eventoSelect = document.getElementById("evento");
const modalidadSelect = document.getElementById("modalidad");
const camposContenedor = document.getElementById("campos-dinamicos");
const formulario = document.getElementById("formularioEquipo");

["2024", "2025"].forEach(año => {
  const op = document.createElement("option");
  op.value = año;
  op.textContent = año;
  añoSelect.appendChild(op);
});

eventoSelect.innerHTML = "<option>programacion</option><option>robotica</option>";

modalidadSelect.addEventListener("change", () => {
  const modalidad = modalidadSelect.value;
  const config = configuracionesPorModalidad[modalidad];
  camposContenedor.innerHTML = "";

  if (config) {
    config.forEach(campo => {
      const label = document.createElement("label");
      label.innerHTML = `${campo.nombre}:`;
      const input = campo.tipo === "textarea" ?
        document.createElement("textarea") :
        document.createElement("input");
      input.name = campo.nombre;
      input.required = campo.obligatorio;
      label.appendChild(input);
      camposContenedor.appendChild(label);
    });
  }
});

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const año = añoSelect.value;
  const evento = eventoSelect.value;
  const modalidad = modalidadSelect.value;
  const idEquipo = prompt("ID del equipo (ej. 001):");
  const config = configuracionesPorModalidad[modalidad];

  const datos = {};
  config.forEach(campo => {
    const valor = formulario.elements[campo.nombre].value.trim();
    datos[campo.nombre] = campo.tipo === "textarea" && valor.includes("\n")
      ? valor.split("\n").map(v => v.trim()).filter(Boolean)
      : valor;
  });

  await registrarEquipo(año, evento, modalidad, idEquipo, datos);
  alert("Equipo registrado.");
});
