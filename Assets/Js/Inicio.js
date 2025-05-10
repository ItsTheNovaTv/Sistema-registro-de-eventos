import { auth } from "./components/Firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
//Conexion a bdd para poder obtener datos de la bdd

//Para cerrar sesion
document.addEventListener("DOMContentLoaded", () => {
  const btnCerrarSesion = document.getElementById("cerrarSesionBtn");

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        // Cierra la sesión de Firebase
        await signOut(auth);

        // Limpia todo lo del sessionStorage
        sessionStorage.clear();

        // Redirige al index
        window.location.href = "/index.html";
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Hubo un problema al cerrar sesión.");
      }
    });
  }
});

//Test

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("miBoton");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      obtenerUsuarios();
      obtenerEquipos("2025", "programacion", "estructuras complejas");
    });
  }
});