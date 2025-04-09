const toggle = document.querySelector('.menu-toggle');
const sidebar = document.querySelector('.sidebar');

toggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

//Conexion a bdd para boton purbea de imprimir en consola los usuarios
import { db } from "./Firebase.js"; // ruta relativa desde Inicio.js a Firebase.js
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

async function obtenerUsuarios() {
  const ref = collection(db, "usuarios");
  const snapshot = await getDocs(ref);
  const usuarios = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log("Usuarios:", usuarios);
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("miBoton");
  if (btn) {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      obtenerUsuarios();
    });
  }
});
