
import { db } from './components/Firebase.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const contenedorCampos = document.getElementById('contenedorCampos');
  const btnAgregarCampo = document.getElementById('agregarCampo');
  const formulario = document.getElementById('formRegistroEvento');

  let contador = 0;

  btnAgregarCampo.addEventListener('click', () => {
    const campoDiv = document.createElement('div');
    campoDiv.classList.add('campo-dinamico');
    campoDiv.style.marginBottom = '1.5rem';

    campoDiv.innerHTML = `
      <label>Nombre del campo:</label>
      <input type="text" name="campo_nombre_${contador}" class="input" required>

      <label>Tipo de campo:</label>
      <select name="campo_tipo_${contador}" class="input campo-tipo">
        <option value="text">Texto</option>
        <option value="select">Lista desplegable</option>
        <option value="boolean">Sí / No</option>
        <option value="lista">Lista (cantidad fija de valores)</option>
      </select>

      <label>¿Es requerido?</label>
      <input type="checkbox" name="campo_requerido_${contador}" />

      <div class="opciones-select" style="display: none; margin-top: 1rem; margin-bottom: 1rem; margin-left: 3rem;">
        <label>Opciones para seleccionar:</label>
        <div class="opciones-dinamicas" style="display: flex; flex-direction:column;  align-items: left; justify-content: center;margin-bottom: 1rem; gap: 10px;"></div>
        <button type="button" class="boton-secundario agregar-opcion">+ Agregar opción</button>
        <button type="button" class="boton-secundario eliminar-opcion">− Eliminar opción</button>
      </div>

      <div class="cantidad-lista" style="display: none; margin-top: 1rem;">
        <label>Cantidad esperada:</label>
        <input type="number" name="campo_cantidad_${contador}" class="input" min="1" value="1">
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

    btnAgregarOpcion.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'input opcion-select';
      input.placeholder = 'Nueva opción';
      contenedorOpciones.appendChild(input);
    });

    btnEliminarOpcion.addEventListener('click', () => {
      const inputs = contenedorOpciones.querySelectorAll('.opcion-select');
      if (inputs.length > 0) {
        inputs[inputs.length - 1].remove();
      }
    });

    contenedorCampos.appendChild(campoDiv);
    contador++;
  });

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const anio = formulario.anio.value;
    const evento = formulario.evento.value.trim().toLowerCase().replace(/\s+/g, '_');
    const modalidad = formulario.modalidad.value.trim().toLowerCase().replace(/\s+/g, '_');

    const campos = [];

    for (let i = 0; i < contador; i++) {
      const nombre = formulario[`campo_nombre_${i}`]?.value;
      const tipo = formulario[`campo_tipo_${i}`]?.value;
      const requerido = formulario[`campo_requerido_${i}`]?.checked || false;

      if (!nombre || !tipo) continue;

      const campo = { nombre, tipo, requerido };

      if (tipo === 'select') {
        const campoDiv = formulario.querySelectorAll('.campo-dinamico')[i];
        const inputs = campoDiv.querySelectorAll('.opcion-select');
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
    }

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
    // Crear documento de modalidad con campo activo: true
    const modalidadRef = doc(db, `${anio}_eventos/${evento}/modalidad/${modalidad}`);
    const modalidadDoc = await getDoc(modalidadRef);

    if (!modalidadDoc.exists()) {
      await setDoc(modalidadRef, {
        activo: true
      });
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
});
