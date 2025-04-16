import { auth, db } from "./Firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value.trim();

    try {
      // Iniciar sesión con Firebase Auth
      const credenciales = await signInWithEmailAndPassword(auth, correo, contrasena);
      const user = credenciales.user;

      // Obtener datos del usuario desde Firestore
      const refUsuario = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(refUsuario);

      if (docSnap.exists()) {
        const datos = docSnap.data();

        // Guardar en sessionStorage
        sessionStorage.setItem("usuarioId", user.uid);
        sessionStorage.setItem("esAdmin", datos.admin);
        sessionStorage.setItem("nombre", datos.nombre);

        alert(`Bienvenido ${datos.nombre}`);
        window.location.href = "../Assets/Pages/Inicio.html";
      } else {
        alert("No se encontraron los datos del usuario en Firestore.");
      }

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Correo o contraseña incorrectos.");
    }
  });
});
