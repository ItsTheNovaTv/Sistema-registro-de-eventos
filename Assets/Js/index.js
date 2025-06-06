import { auth, db } from "./components/Firebase.js";
import { doc, getDoc, serverTimestamp, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { mostrarToast } from "./components/toast.js";
import { registrarBitacora } from "/Assets/Js/components/registrobitacora.js";

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

        ///////////////////////////////////////////////
        await addDoc(collection(db, "bitacora"), {
          usuarioId: user.uid,
          nombre: datos.nombre,
          accion: "Inicio de sesión",
          timestamp: serverTimestamp(),
          ruta: "index.html"
        });
        

        mostrarToast(`Bienvenido ${datos.nombre}`, "success");
        await registrarBitacora("Inicio de sesión", "el usuario inicio sesion en el sistema", "index.html");



        setTimeout(() => {
          
          window.location.href = "/Assets/Pages/Inicio.html";
        }, 1500)
      } else {
        mostrarToast("No se encontraron los datos del usuario en Firestore.", "error");
      }

    } catch (error) {
      console.error("Error al iniciar sesión: ", error);
      mostrarToast("Correo o contraseña incorrectos.", "error");
    }
  });
});


// ...

