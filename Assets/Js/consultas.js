import { db } from "./Firebase.js";
import {
  collection,
  doc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";


// 🔹 AÑOS DISPONIBLES
export async function obtenerAños() {
  const añoActual = new Date().getFullYear();
  const años = [];
  for (let año = 2000; año <= añoActual; año++) {
    años.push(año.toString());
  }
  return años.reverse(); // orden del más nuevo al más viejo
}


// 🔹 USUARIOS
export async function obtenerUsuarios() {
  const ref = collection(db, "usuarios");
  const snapshot = await getDocs(ref);
  const usuarios = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log("Usuarios:", usuarios);
  return usuarios;
}


export async function obtenerEventos(año) {
    if (!año) throw new Error("❌ El año no puede estar vacío.");
  
    // Este es el documento "eventos", no una colección
    const eventoRuta = `${año}/eventos`; // ← documento
    const programacionRef = collection(db, `${eventoRuta}/programacion`); // ← una de las colecciones internas
  
    // 🔎 TRUCO: listar manualmente las subcolecciones que tú sepas que existen
    // Como no puedes hacer listCollections desde CDN, aquí solo puedes devolver una lista manual o fija
    // O, si sabes que "programacion", "robotica" son las subcolecciones:
    return ["programacion", "robotica"];
  }


// 🔹 MODALIDADES por evento
// Dentro de: /2025/eventos/{evento} → accedemos a los documentos: estructuras complejas, hacka, etc.
export async function obtenerModalidades(año, evento) {
  const modalidadesRef = collection(db, `${año}/eventos/${evento}`);
  const snapshot = await getDocs(modalidadesRef);
  return snapshot.docs.map(doc => doc.id); // nombres de las modalidades (documentos)
}


// 🔹 EQUIPOS por modalidad
// Dentro de: /2025/eventos/{evento}/{modalidad}/equipos
export async function obtenerEquipos(año, evento, modalidad) {
  const equiposRef = collection(db, `${año}/eventos/${evento}/${modalidad}/equipos`);
  const snapshot = await getDocs(equiposRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
