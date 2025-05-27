
import { db } from './components/Firebase.js';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { obtenerAños } from './components/consultas.js';

document.addEventListener('DOMContentLoaded', async () => {
  const formSeleccion = document.getElementById('formSeleccionPublica');
  const formRegistro = document.getElementById('formPublico');
  const contenedor = document.getElementById('camposFormularioPublico');

  const selectAnio = document.getElementById('anio');
  const selectEvento = document.getElementById('evento');
  const selectModalidad = document.getElementById('modalidad');

  let camposConfig = [];

async function cargarAños() {
  const años = await obtenerAños();
  selectAnio.innerHTML = '<option value="">Selecciona año</option>';
  años.reverse().forEach(año => {
    const option = document.createElement('option');
    option.value = año;
    option.textContent = año;
    selectAnio.appendChild(option);
  });
}
  //al cargar años, cargar los eventos del año actual
  selectAnio.addEventListener('change', async () => {
    selectEvento.innerHTML = '<option value="">Selecciona evento</option>';
    selectModalidad.innerHTML = '<option value="">Selecciona modalidad</option>';
    const snapshot = await getDocs(collection(db, `${selectAnio.value}_eventos`));
    snapshot.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = doc.id;
      selectEvento.appendChild(opt);
    });
  });

  selectEvento.addEventListener('change', async () => {
    selectModalidad.innerHTML = '<option value="">Selecciona modalidad</option>';
    const snapshot = await getDocs(collection(db, `${selectAnio.value}_eventos/${selectEvento.value}/modalidad`));
    snapshot.forEach(doc => {
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
      contenedor.innerHTML = '<p>No hay configuración para esta modalidad.</p>';
      return;
    }

    const { campos } = configSnap.data();
    camposConfig = campos;
    contenedor.innerHTML = '';
    formRegistro.style.display = 'block';

    campos.forEach(campo => {
      if (campo.nombre === 'Participación') return;

      const div = document.createElement('div');
      div.classList.add('campo-dinamico');

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
        const input = document.createElement('input');
        input.type = 'text';
        input.name = campo.nombre;
        input.classList.add('input');
        input.required = campo.requerido;
        div.appendChild(input);
      }

      contenedor.appendChild(div);
    });
  });

  formRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {};
    camposConfig.forEach(campo => {
      if (campo.nombre === "Participación") return;

      if (campo.tipo === 'lista') {
        const valores = [];
        for (let i = 0; i < campo.cantidad; i++) {
          const input = formRegistro.querySelector(`[name="${campo.nombre}_${i}"]`);
          if (input?.value.trim()) valores.push(input.value.trim());
        }
        datos[campo.nombre] = valores;
      } else {
        const val = formRegistro.elements[campo.nombre]?.value.trim();
        datos[campo.nombre] = val;
      }
    });

    try {
      const ruta = `${selectAnio.value}_eventos/${selectEvento.value}/modalidad/${selectModalidad.value}/equipos`;
      const ref = collection(db, ruta);
      const snapshot = await getDocs(ref);
      const ids = snapshot.docs.map(doc => parseInt(doc.id)).filter(n => !isNaN(n));
      const nuevoId = (ids.length > 0 ? Math.max(...ids) + 1 : 1).toString().padStart(4, "0");

      await setDoc(doc(db, ruta, nuevoId), datos);
      alert("✅ Equipo registrado correctamente con ID " + nuevoId);
      formRegistro.reset();
      formRegistro.style.display = "none";
    } catch (err) {
      console.error("Error al registrar equipo:", err);
      alert("❌ Error al registrar equipo.");
    }
  });
  await cargarAños();

});
