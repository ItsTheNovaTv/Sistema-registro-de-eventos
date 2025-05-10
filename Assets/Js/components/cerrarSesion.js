import { auth } from "./Firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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