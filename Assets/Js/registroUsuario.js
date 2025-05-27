import { db, auth } from './components/Firebase.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { cargarUsuarios } from './components/cargarUsuarios.js'; // ✅ Importación

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formRegistroUsuario');

  form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = form.correo.value.trim();
  const password = form.password.value.trim();
  const repassword = form.repassword.value.trim();
  const nombre = form.nombre.value.trim();
  const admin = form.admin.checked;

  if (!correo || !password || !repassword || !nombre) {
    alert('⚠️ Por favor, completa todos los campos.');
    return;
  }

  if (password !== repassword) {
    alert("⚠️ Las contraseñas no coinciden.");
    return;
  }

  try {
    const credencial = await createUserWithEmailAndPassword(auth, correo, password);
    const uid = credencial.user.uid;

    await setDoc(doc(db, 'usuarios', uid), {
      nombre,
      admin
    });

    alert('✅ Usuario registrado exitosamente.');
    form.reset();
    await cargarUsuarios(); // Recarga la lista si tienes esto implementado
  } catch (error) {
    console.error('❌ Error al registrar:', error);
    let mensaje = 'Error desconocido.';
    if (error.code === 'auth/email-already-in-use') {
      mensaje = 'El correo ya está registrado.';
    } else if (error.code === 'auth/weak-password') {
      mensaje = 'La contraseña es muy débil (mínimo 6 caracteres).';
    }
    alert('⚠️ ' + mensaje);
  }
});

});
