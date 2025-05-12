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
    campoDiv.style.marginBottom = '1rem';

    campoDiv.innerHTML = `
      <label>Nombre del campo:</label>
      <input type="text" name="campo_nombre_${contador}" class="input" required>

      <label>Tipo de campo:</label>
      <select name="campo_tipo_${contador}" class="input campo-tipo">
        <option value="text">Texto</option>
        <option value="array">Lista de texto</option>
        <option value="select">Lista desplegable</option>
        <option value="boolean">Sí / No</option>
      </select>

      <label>¿Es requerido?</label>
      <input type="checkbox" name="campo_requerido_${contador}" />

      <div class="opciones-select" style="display: none; margin-top: 0.5rem;">
        <label>Opciones (una por línea):</label>
        <textarea name="campo_opciones_${contador}" rows="2" class="input"></textarea>
      </div>

      <div class="lista-multiple" style="display: none; margin-top: 0.5rem;">
        <label>Valores por defecto (opcional):</label>
        <div class="items-lista">
          <input type="text" class="input item-array" placeholder="Valor 1" />
        </div>
        <button type="button" class="boton-secundario agregar-item-array" style="margin-top: 0.5rem;">+ Agregar otro</button>
      </div>

      <hr />
    `;

    const tipoSelect = campoDiv.querySelector(`select[name="campo_tipo_${contador}"]`);
    const opcionesDiv = campoDiv.querySelector('.opciones-select');
    const listaDiv = campoDiv.querySelector('.lista-multiple');
    const itemsContainer = campoDiv.querySelector('.items-lista');
    const btnAgregarItem = campoDiv.querySelector('.agregar-item-array');

    tipoSelect.addEventListener('change', () => {
      opcionesDiv.style.display = tipoSelect.value === 'select' ? 'block' : 'none';
      listaDiv.style.display = tipoSelect.value === 'array' ? 'block' : 'none';
    });

    btnAgregarItem.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'input item-array';
      input.placeholder = 'Otro valor';
      itemsContainer.appendChild(input);
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
        const opcionesTexto = formulario[`campo_opciones_${i}`]?.value || '';
        campo.opciones = opcionesTexto.split('\n').map(opt => opt.trim()).filter(opt => opt !== '');
      }

      if (tipo === 'array') {
        const parentDiv = formulario.querySelectorAll('.campo-dinamico')[i];
        const items = parentDiv.querySelectorAll('.item-array');
        campo.opciones = Array.from(items).map(inp => inp.value.trim()).filter(val => val !== '');
      }

      campos.push(campo);
    }

    const rutaCampos = `${anio}_eventos/${evento}/modalidad/${modalidad}/campos_config/config`;
    const docRef = doc(db, rutaCampos);
    const existente = await getDoc(docRef);

    if (existente.exists()) {
      const confirmar = confirm("⚠️ Esta modalidad ya existe en este evento. ¿Deseas sobrescribir la configuración?");
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

    await setDoc(docRef, { campos });

    alert('✅ Evento y configuración guardados correctamente.');
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
