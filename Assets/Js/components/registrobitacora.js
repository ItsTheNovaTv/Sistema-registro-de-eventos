// archivo: ./components/registrobitacora.js

import { db } from "./Firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export async function registrarBitacora(accion, detalle = "", ruta = "") {
    const usuarioId = sessionStorage.getItem("usuarioId");
    const nombre = sessionStorage.getItem("nombre");

    if (!usuarioId || !nombre) {
        console.warn("Sesión no válida para registrar bitácora.");
        return;
    }

    try {
        await addDoc(collection(db, "bitacora"), {
            usuarioId,
            nombre,
            accion,
            detalle,
            ruta,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error al registrar bitácora:", error);
    }
}
