import { db } from "./components/Firebase.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Función para formatear la fecha y hora
function formatearFecha(timestamp) {
    if (!timestamp) return { fecha: "", hora: "" };
    const fecha = timestamp.toDate();
    return {
        fecha: fecha.toLocaleDateString("es-MX"),
        hora: fecha.toLocaleTimeString("es-MX"),
    };
}

// Cargar registros de bitácora
async function cargarBitacora() {
    const tabla = document.getElementById("tabla-bitacora");
    tabla.innerHTML = ""; // Limpiar la tabla

    try {
        const q = query(collection(db, "bitacora"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const { fecha, hora } = formatearFecha(data.timestamp);

            const fila = document.createElement("tr");
            fila.innerHTML = `
        <td>${fecha}</td>
        <td>${hora}</td>
        <td>${data.nombre || "Desconocido"}</td>
        <td>${data.accion}</td>
        <td>${data.detalle || "-"}</td>
      `;

            tabla.appendChild(fila);
        });

    } catch (error) {
        console.error("Error al cargar la bitácora:", error);
    }
}

document.addEventListener("DOMContentLoaded", cargarBitacora);
