
import { db, auth } from './components/Firebase.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRegistroUsuario');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = form.correo.value.trim();
    const password = form.password.value.trim();
    const nombre = form.nombre.value.trim();
    const admin = form.admin.checked;

    try {
      const credencial = await createUserWithEmailAndPassword(auth, correo, password);
      const uid = credencial.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        nombre,
        admin
      });

      alert('✅ Usuario registrado exitosamente.');
      form.reset();
    } catch (error) {
      console.error('❌ Error al registrar:', error);
      alert('⚠️ Error: ' + error.message);
    }
  });
});
