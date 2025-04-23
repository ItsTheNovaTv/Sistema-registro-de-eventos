import { db } from "./Firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔹 AÑOS DISPONIBLES (2000 hasta el año actual)
export async function obtenerAños() {
  const añoActual = new Date().getFullYear();
  const años = [];
  for (let año = 2000; año <= añoActual; año++) {
    años.push(año.toString());
  }
  return años.reverse(); // Más reciente primero
}

// 🔹 USUARIOS
export async function obtenerUsuarios() {
  const ref = collection(db, "usuarios");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// 🔹 EVENTOS por año
// Ruta: /2025_eventos/
export async function obtenerEventos(año) {
  if (!año) throw new Error("❌ El año no puede estar vacío.");
  const eventosRef = collection(db, `${año}_eventos`);
  const snapshot = await getDocs(eventosRef);
  return snapshot.docs.map(doc => doc.id); // Ej: ["programacion", "robotica"]
}

// 🔹 MODALIDADES
export async function obtenerModalidades(año, evento) {
  const modalidadesRef = collection(db, `${año}_eventos/${evento}/modalidad`);
  const snapshot = await getDocs(modalidadesRef);
  return snapshot.docs.map(doc => doc.id);
}

// 🔹 EQUIPOS
export async function obtenerEquipos(año, evento, modalidad) {
  const equiposRef = collection(db, `${año}_eventos/${evento}/modalidad/${modalidad}/equipos`);
  const snapshot = await getDocs(equiposRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}