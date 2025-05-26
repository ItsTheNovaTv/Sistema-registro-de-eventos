
import { db } from './components/Firebase.js';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const selectAnio = document.getElementById('anio');
  const selectEvento = document.getElementById('evento');
  const selectModalidad = document.getElementById('modalidad');
  const formSeleccion = document.getElementById('formSeleccion');
  const formDinamico = document.getElementById('formDinamico');
  const contenedorCampos = document.getElementById('contenedorCamposDinamicos');

  let camposConfig = [];

  const anioActual = new Date().getFullYear();
  for (let y = anioActual; y >= 2023; y--) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    selectAnio.appendChild(option);
  }

  selectAnio.addEventListener('change', async () => {
    const anio = selectAnio.value;
    selectEvento.innerHTML = '<option value="">Selecciona un evento</option>';
    selectModalidad.innerHTML = '<option value="">Selecciona una modalidad</option>';
    const eventosSnapshot = await getDocs(collection(db, `${anio}_eventos`));
    eventosSnapshot.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = doc.id;
      selectEvento.appendChild(opt);
    });
  });

  selectEvento.addEventListener('change', async () => {
    const anio = selectAnio.value;
    const evento = selectEvento.value;
    selectModalidad.innerHTML = '<option value="">Selecciona una modalidad</option>';
    const modalidadesSnapshot = await getDocs(collection(db, `${anio}_eventos/${evento}/modalidad`));
    modalidadesSnapshot.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = doc.id;
      selectModalidad.appendChild(opt);
    });
  });

  formSeleccion.addEventListener('submit', async (e) => {
    e.preventDefault();
    const anio = selectAnio.value;
    const evento = selectEvento.value;
    const modalidad = selectModalidad.value;

    const configRef = doc(db, `${anio}_eventos/${evento}/modalidad/${modalidad}/campos_config/config`);
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      alert('No hay configuración de campos para esta modalidad.');
      return;
    }

    const { campos } = configSnap.data();
    camposConfig = campos;
    contenedorCampos.innerHTML = '';
    formDinamico.style.display = 'block';

    campos.forEach(campo => {
    

    const div = document.createElement('div');
    div.classList.add('campo-dinamico');
    div.style.marginBottom = '1rem';

    const label = document.createElement('label');
    label.textContent = campo.nombre;
    div.appendChild(label);

    if (campo.tipo === 'lista' && campo.cantidad) {
      for (let i = 0; i < campo.cantidad; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.name = `${campo.nombre}_${i}`;
        input.placeholder = `${campo.nombre} ${i + 1}`;
        input.classList.add('input');
        if (campo.requerido) input.required = true;
        div.appendChild(input);
      }
    } else if (campo.tipo === 'select' && campo.opciones) {
      const select = document.createElement('select');
      select.name = campo.nombre;
      select.required = campo.requerido;
      campo.opciones.forEach(op => {
        const opt = document.createElement('option');
        opt.value = op;
        opt.textContent = op;
        select.appendChild(opt);
      });
      select.classList.add('input');
      div.appendChild(select);
    } else if (campo.tipo === 'boolean') {
      const select = document.createElement('select');
      select.name = campo.nombre;
      select.required = campo.requerido;
      ['Sí', 'No'].forEach(op => {
        const opt = document.createElement('option');
        opt.value = op;
        opt.textContent = op;
        select.appendChild(opt);
      });
      select.classList.add('input');
      div.appendChild(select);
    } else {
      const input = document.createElement(campo.tipo === 'textarea' ? 'textarea' : 'input');
      input.type = 'text';
      input.name = campo.nombre;
      input.required = campo.requerido;
      input.classList.add('input');
      div.appendChild(input);
      }

    contenedorCampos.appendChild(div);
  });

  });

  formDinamico.addEventListener('submit', (e) => {
    e.preventDefault();

    const datos = {};
    camposConfig.forEach(campo => {
      if (campo.tipo === 'lista' && campo.cantidad) {
        const valores = [];
        for (let i = 0; i < campo.cantidad; i++) {
          const input = formDinamico.querySelector(`[name="${campo.nombre}_${i}"]`);
          if (input && input.value.trim()) {
            valores.push(input.value.trim());
          }
        }
        datos[campo.nombre] = valores;
      } else {
        const input = formDinamico.elements[campo.nombre];
        if (input) {
          datos[campo.nombre] = input.value.trim();
        }
      }
    });

    console.log("📤 Datos recopilados para guardar:", datos);
    alert('✅ Datos preparados para guardar. (Guardar real aún no implementado)');
  });
});
