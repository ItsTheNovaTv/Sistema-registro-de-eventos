import { db } from './components/Firebase.js';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { obtenerAños, obtenerEventos, obtenerModalidades, obtenerEquipos } from './components/consultas.js';


const selectAño = document.getElementById("año-combobox");
const selectEvento = document.getElementById("evento-combobox");
const selectModalidad = document.getElementById("modalidad-combobox");
const btnBuscar = document.getElementById("btnUsuariosFiltro");
const contenedor = document.getElementById("contenedor-equipos");

document.addEventListener("DOMContentLoaded", async () => {
  const años = await obtenerAños();
  años.reverse().forEach(año => {
    const opt = document.createElement("option");
    opt.value = año;
    opt.textContent = año;
    selectAño.appendChild(opt);
  });
});

selectAño.addEventListener("change", async () => {
  selectEvento.innerHTML = '<option value="">Selecciona evento</option>';
  selectModalidad.innerHTML = '<option value="">Selecciona modalidad</option>';
  if (!selectAño.value) return;
  const eventos = await obtenerEventos(selectAño.value);
  eventos.forEach(evento => {
    const opt = document.createElement("option");
    opt.value = evento;
    opt.textContent = evento;
    selectEvento.appendChild(opt);
  });
});

selectEvento.addEventListener("change", async () => {
  selectModalidad.innerHTML = '<option value="">Selecciona modalidad</option>';
  if (!selectAño.value || !selectEvento.value) return;
  const modalidades = await obtenerModalidades(selectAño.value, selectEvento.value);
  modalidades.forEach(modalidad => {
    const opt = document.createElement("option");
    opt.value = modalidad;
    opt.textContent = modalidad;
    selectModalidad.appendChild(opt);
  });
});

btnBuscar.addEventListener("click", async () => {
  const año = selectAño.value;
  const evento = selectEvento.value;
  const modalidad = selectModalidad.value;

  contenedor.innerHTML = "";

  if (!año || !evento) {
    contenedor.innerHTML = "<p>⚠️ Debes seleccionar al menos año y evento.</p>";
    return;
  }

  if (!modalidad) {
    const modalidades = await obtenerModalidades(año, evento);
    for (const mod of modalidades) {
      const ref = doc(db, `${año}_eventos/${evento}/modalidad/${mod}`);
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      const estaActiva = data.activo === true;

      const card = document.createElement("div");
      card.className = "modalidad-card";
      card.innerHTML = `
        <h3>${mod}</h3>
        <p><strong>Estado:</strong> <span id="estado-${mod}">${estaActiva ? "Activa ✅" : "Inactiva ❌"}</span></p>
        <label class="checkbox-label">
          <input type="checkbox" id="switch-${mod}" ${estaActiva ? "checked" : ""}>
          ¿Permitir registro de equipos?
        </label>
        <button class="boton-principal" style="margin-top:0.5rem;" data-mod="${mod}">Guardar estado</button>
      `;

      const btn = card.querySelector("button");
      btn.addEventListener("click", async () => {
        const nuevoEstado = document.getElementById(`switch-${mod}`).checked;
        await updateDoc(ref, { activo: nuevoEstado });
        document.getElementById(`estado-${mod}`).textContent = nuevoEstado ? "Activa ✅" : "Inactiva ❌";
        alert("✅ Estado actualizado.");
      });

      contenedor.appendChild(card);
    }
    return;
  }

  // Si hay modalidad
  const modRef = doc(db, `${año}_eventos/${evento}/modalidad/${modalidad}`);
  const modSnap = await getDoc(modRef);
  if (!modSnap.exists()) {
    contenedor.innerHTML = "<p>❌ Modalidad no encontrada.</p>";
    return;
  }

  const modData = modSnap.data();
  const estaActiva = modData.activo === true;

  const configRef = doc(db, `${año}_eventos/${evento}/modalidad/${modalidad}/campos_config/config`);
  const configSnap = await getDoc(configRef);
  const configData = configSnap.exists() ? configSnap.data() : {};
  const tieneParticipacion = configData.campos?.some(c => c.nombre === "Participación");

  const card = document.createElement("div");
  card.className = "modalidad-card";
  card.innerHTML = `
    <h3>${modalidad}</h3>
    <p><strong>Estado:</strong> <span id="estadoModalidad">${estaActiva ? "Activa ✅" : "Inactiva ❌"}</span></p>
    <label class="checkbox-label">
      <input type="checkbox" id="switchActivo" ${estaActiva ? "checked" : ""}>
      ¿Permitir registro de equipos?
    </label>
    <button class="boton-principal" style="margin-top:0.5rem;" id="btnGuardarEstado">Guardar estado</button>
  `;
  contenedor.appendChild(card);

  document.getElementById("btnGuardarEstado").addEventListener("click", async () => {
    const nuevoEstado = document.getElementById("switchActivo").checked;
    await updateDoc(modRef, { activo: nuevoEstado });
    document.getElementById("estadoModalidad").textContent = nuevoEstado ? "Activa ✅" : "Inactiva ❌";
    alert("✅ Estado actualizado.");
  });

  if (tieneParticipacion) {
    const equipos = await obtenerEquipos(año, evento, modalidad);
    if (equipos.length === 0) {
      contenedor.innerHTML += "<p>No hay equipos registrados.</p>";
      return;
    }

    equipos.forEach(eq => {
      const div = document.createElement("div");
      div.className = "equipo-card";
     const data = eq;
     const val = data["Participación"] || "";

        div.innerHTML = `
        <h4>Equipo: ${data["Nombre del equipo"] || eq.id}</h4>
        <p><strong>ID:</strong> ${eq.id}</p>
        <label>Participación:
            <select id="select-${eq.id}">
            <option value="">Sin asignar</option>
            <option value="Participo" ${val === "Participo" ? "selected" : ""}>Participo</option>
            <option value="1er Lugar" ${val === "1er Lugar" ? "selected" : ""}>1er Lugar</option>
            <option value="2do Lugar" ${val === "2do Lugar" ? "selected" : ""}>2do Lugar</option>
            <option value="3er Lugar" ${val === "3er Lugar" ? "selected" : ""}>3er Lugar</option>
            <option value="No participó" ${val === "No participó" ? "selected" : ""}>No participó</option>
            </select>
        </label>
        <button class="boton-principal" data-eqid="${eq.id}" style="margin-top:0.5rem;">Guardar</button>
        `;


      const btnGuardar = div.querySelector("button");
      btnGuardar.addEventListener("click", async () => {
        const nuevoValor = document.getElementById("select-" + eq.id).value;
        const equipoRef = doc(db, `${año}_eventos/${evento}/modalidad/${modalidad}/equipos/${eq.id}`);
        await updateDoc(equipoRef, { "Participación": nuevoValor });
        alert("✅ Participación actualizada.");
      });

      contenedor.appendChild(div);
    });
  }
});
