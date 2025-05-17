
import { db } from './Firebase.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Cargar usuarios desde Firestore y mostrarlos en el contenedor
// Asegúrate de que el contenedor tenga el ID 'contenedorUsuarios' en tu HTML
// y que el script de Firebase esté correctamente importado.
// Este script se ejecutará cuando el DOM esté completamente cargado
// y listo para ser manipulado.
document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('contenedorUsuarios');

  if (!contenedor) return;

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
          <!-- Botones futuros aquí -->
        </footer>
      `;

      contenedor.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    contenedor.innerHTML = '<p>Ocurrió un error al cargar los usuarios.</p>';
  }
});
