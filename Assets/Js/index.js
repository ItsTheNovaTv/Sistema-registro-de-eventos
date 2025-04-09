import { db } from "./Firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correoIngresado = document.getElementById("correo").value.trim();
    const contrasenaIngresada = document.getElementById("contrasena").value.trim();

    const ref = collection(db, "usuarios");
    const snapshot = await getDocs(ref);

    let usuarioValido = null;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.correo === correoIngresado && data.contraseña === contrasenaIngresada) {
        usuarioValido = {
          id: doc.id,
          nombre: data.nombre,
          admin: data.admin
        };
      }
    });

    if (usuarioValido) {
        alert(`Bienvenido ${usuarioValido.nombre}`);
      
        // Guardar en localStorage solo lo necesario: id y admin
        localStorage.setItem("usuarioId", usuarioValido.id);
        localStorage.setItem("esAdmin", usuarioValido.admin); // esto será "true" o "false" como string
      
        // Redirigir a la página de inicio
        window.location.href = "../Assets/Pages/Inicio.html";
      }
      
    else {
      alert("Correo o contraseña incorrectos");
    }
  });
});
