import { db } from './Firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

export async function cargarUsuarios() {
  const contenedor = document.getElementById('contenedorUsuarios');
  if (!contenedor) return;

  contenedor.innerHTML = ''; // Limpiar contenido previo

  try {
    const snapshot = await getDocs(collection(db, 'usuarios'));
    if (snapshot.empty) {
      contenedor.innerHTML = '<p>No hay usuarios registrados.</p>';
      return;
    }

    snapshot.forEach(doc => {
      const usuario = doc.data();

      const card = document.createElement('div');
      card.className = 'usuario-card';
      card.innerHTML = `
        <h3>${usuario.nombre || 'Sin nombre'}</h3>
        <p><strong>ID:</strong> ${doc.id}</p>
        <p><strong>Rol:</strong> ${usuario.admin ? 'Administrador' : 'Usuario'}</p>
        <footer class="usuario-footer" style="margin-top: 1rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
        </footer>
      `;

      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    contenedor.innerHTML = '<p>Ocurrió un error al cargar los usuarios.</p>';
  }
}

// Ejecutar cuando cargue el DOM
document.addEventListener('DOMContentLoaded', cargarUsuarios);
