import { db } from './components/Firebase.js';
import { doc, setDoc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

import { mostrarToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const contenedorCampos = document.getElementById('contenedorCampos');
  const btnAgregarCampo = document.getElementById('agregarCampo');
  const formulario = document.getElementById('formRegistroEvento');
  const inputAnio = formulario.anio;
  const inputEvento = formulario.evento;
  const inputModalidad = formulario.modalidad;
  inputModalidad.addEventListener("input", async () => {
    const anio = inputAnio?.value;
    const evento = inputEvento?.value.trim().toLowerCase().replace(/\s+/g, '_');
    const modalidad = inputModalidad.value.trim().toLowerCase().replace(/\s+/g, '_');
    if (!anio || !evento || !modalidad) return;

    const configRef = doc(db, `${anio}_eventos/${evento}/modalidad/${modalidad}/campos_config/config`);
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      mostrarToast("⚠️ Esta modalidad ya tiene una configuración. Se cargará automáticamente.", "warning");
      const data = configSnap.data();
      contenedorCampos.innerHTML = '';
      contador = 0;

      data.campos.forEach(c => {
        crearCampo(c.nombre, c.tipo, c.requerido, c.opciones || [], c.cantidad || 1);
      });
    }
  });


  let contador = 0;

  function crearCampo(nombre, tipo, requerido = false, opciones = [], cantidad = 1) {
    const campoDiv = document.createElement('div');
    campoDiv.classList.add('campo-dinamico');
    campoDiv.style.marginBottom = '1.5rem';

    campoDiv.innerHTML = `
      <label>Nombre del campo:</label>
      <input type="text" name="campo_nombre_${contador}" class="input" value="${nombre}" required>

      <label>Tipo de campo:</label>
      <select name="campo_tipo_${contador}" class="input campo-tipo">
        <option value="text" ${tipo === "text" ? "selected" : ""}>Texto</option>
        <option value="select" ${tipo === "select" ? "selected" : ""}>Lista desplegable</option>
        <option value="boolean" ${tipo === "boolean" ? "selected" : ""}>Sí / No</option>
        <option value="lista" ${tipo === "lista" ? "selected" : ""}>Lista</option>
      </select>

      <label>¿Es requerido?</label>
      <input type="checkbox" name="campo_requerido_${contador}" ${requerido ? "checked" : ""} />

      <button type="button" class="boton-secundario eliminar-campo" style="margin-top: 0.5rem;">Eliminar este campo</button>

      <div class="opciones-select" style="display: ${tipo === 'select' ? 'block' : 'none'}; margin-top: 1rem; margin-bottom: 1rem; margin-left: 3rem;">
        <label>Opciones para seleccionar:</label>
        <div class="opciones-dinamicas" style="display: flex; flex-direction:column; align-items: left; justify-content: center; margin-bottom: 1rem; gap: 10px;">
          ${opciones.map(op => `<input type="text" class="input opcion-select" value="${op}">`).join("")}
        </div>
        <button type="button" class="boton-secundario agregar-opcion">+ Agregar opción</button>
        <button type="button" class="boton-secundario eliminar-opcion">− Eliminar opción</button>
      </div>

      <div class="cantidad-lista" style="display: ${tipo === 'lista' ? 'block' : 'none'}; margin-top: 1rem;">
        <label>Cantidad esperada:</label>
        <input type="number" name="campo_cantidad_${contador}" class="input" min="1" value="${cantidad}">
      </div>

      <hr />
    `;

    const tipoSelect = campoDiv.querySelector(`select[name="campo_tipo_${contador}"]`);
    const opcionesDiv = campoDiv.querySelector('.opciones-select');
    const cantidadDiv = campoDiv.querySelector('.cantidad-lista');
    const contenedorOpciones = campoDiv.querySelector('.opciones-dinamicas');
    const btnAgregarOpcion = campoDiv.querySelector('.agregar-opcion');
    const btnEliminarOpcion = campoDiv.querySelector('.eliminar-opcion');

    tipoSelect.addEventListener('change', () => {
      opcionesDiv.style.display = tipoSelect.value === 'select' ? 'block' : 'none';
      cantidadDiv.style.display = tipoSelect.value === 'lista' ? 'block' : 'none';
    });

    btnAgregarOpcion?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'input opcion-select';
      input.placeholder = 'Nueva opción';
      contenedorOpciones.appendChild(input);
    });

    btnEliminarOpcion?.addEventListener('click', () => {
      const inputs = contenedorOpciones.querySelectorAll('.opcion-select');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].remove();
      }
    });

    const btnEliminarCampo = campoDiv.querySelector('.eliminar-campo');
    btnEliminarCampo.addEventListener('click', () => campoDiv.remove());

    contenedorCampos.appendChild(campoDiv);
    contador++;
  }

  document.getElementById("agregarCamposBase")?.addEventListener("click", () => {
    const camposBase = [
      { nombre: "Nombre del equipo", tipo: "text", requerido: true },
      { nombre: "Categoría", tipo: "select", requerido: true, opciones: ["Universidad", "Preparatoria"] },
      { nombre: "Institución", tipo: "text", requerido: true },
      { nombre: "Asesor", tipo: "text", requerido: false },
      { nombre: "Contacto", tipo: "text", requerido: true },
      { nombre: "Integrantes", tipo: "lista", requerido: true, cantidad: 4 }
    ];
    camposBase.forEach(c => crearCampo(c.nombre, c.tipo, c.requerido, c.opciones || [], c.cantidad || 1));
  });

  btnAgregarCampo.addEventListener('click', () => crearCampo('', 'text'));

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const anio = inputAnio.value;
    const evento = inputEvento.value.trim().toLowerCase().replace(/\s+/g, '_');
    const modalidad = inputModalidad.value.trim().toLowerCase().replace(/\s+/g, '_');
    const campos = [];

    const bloques = contenedorCampos.querySelectorAll('.campo-dinamico');
    bloques.forEach((bloque, i) => {
      const nombre = formulario[`campo_nombre_${i}`]?.value;
      const tipo = formulario[`campo_tipo_${i}`]?.value;
      const requerido = formulario[`campo_requerido_${i}`]?.checked || false;
      if (!nombre || !tipo) return;
      const campo = { nombre, tipo, requerido };

      if (tipo === 'select') {
        const inputs = bloque.querySelectorAll('.opcion-select');
        const opciones = Array.from(inputs).map(inp => inp.value.trim()).filter(val => val !== '');
        if (opciones.length === 0) {
          alert(`⚠️ El campo "${nombre}" necesita al menos una opción válida.`);
          return;
        }
        campo.opciones = opciones;
      }

      if (tipo === 'lista') {
        const cantidad = parseInt(formulario[`campo_cantidad_${i}`]?.value);
        if (isNaN(cantidad) || cantidad < 1) {
          alert(`⚠️ El campo "${nombre}" debe tener una cantidad válida mayor a 0.`);
          return;
        }
        campo.cantidad = cantidad;
      }

      campos.push(campo);
    });

    const rutaCampos = `${anio}_eventos/${evento}/modalidad/${modalidad}/campos_config/config`;
    const docRef = doc(db, rutaCampos);
    const existente = await getDoc(docRef);
    if (existente.exists()) {
      const confirmar = confirm("⚠️ Esta modalidad ya tiene una configuración. ¿Deseas sobrescribirla?");
      if (!confirmar) {
        alert("❌ Operación cancelada.");
        return;
      }
    }

    const eventoRef = doc(db, `${anio}_eventos/${evento}`);
    const eventoDoc = await getDoc(eventoRef);
    if (!eventoDoc.exists()) {
      await setDoc(eventoRef, {
        nombre: evento,
        creado: new Date(),
        creado_por: sessionStorage.getItem("usuarioId") || "admin"
      });
    }

    const modalidadRef = doc(db, `${anio}_eventos/${evento}/modalidad/${modalidad}`);
    const modalidadDoc = await getDoc(modalidadRef);
    if (!modalidadDoc.exists()) {
      await setDoc(modalidadRef, { activo: true });
    }

    await setDoc(docRef, { campos });
    alert('✅ Configuración guardada correctamente.');
    formulario.reset();
    contenedorCampos.innerHTML = '';
    contador = 0;
  });

  const btnLimpiar = document.getElementById('limpiarCampos');
  btnLimpiar.addEventListener('click', (e) => {
    e.preventDefault();
    contenedorCampos.innerHTML = '';
    formulario.reset();
    contador = 0;
  });

  async function cargarEventos(año) {
    const eventosRef = collection(db, `${año}_eventos`);
    const snapshot = await getDocs(eventosRef);
    const lista = document.getElementById("eventosList");
    if (!lista) return;
    lista.innerHTML = "";
    snapshot.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.id;
      lista.appendChild(option);
    });
  }

  async function cargarModalidades(año, evento) {
    const modalidadesRef = collection(db, `${año}_eventos/${evento}/modalidad`);
    const snapshot = await getDocs(modalidadesRef);
    const lista = document.getElementById("modalidadesList");
    if (!lista) return;
    lista.innerHTML = "";
    snapshot.forEach(doc => {
      const option = document.createElement("option");
      option.value = doc.id;
      lista.appendChild(option);
    });
  }

  if (inputAnio.value) cargarEventos(inputAnio.value);
  inputAnio.addEventListener("change", () => {
    if (inputAnio.value) cargarEventos(inputAnio.value);
  });

  let timeoutEvento;
  inputEvento.addEventListener("input", () => {
    clearTimeout(timeoutEvento);
    timeoutEvento = setTimeout(() => {
      const anio = inputAnio?.value;
      const evento = inputEvento.value.trim().toLowerCase().replace(/\s+/g, '_');
      if (!anio || !evento) return;
      cargarModalidades(anio, evento);
    }, 2000);
  });
});
