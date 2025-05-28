import { auth } from "./components/Firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
//Conexion a bdd para poder obtener datos de la bdd

import { obtenerEventos, obtenerModalidades, obtenerEquipos } from './components/consultas.js';


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
// Para cargar el dashboard al iniciar la página
// Se obtiene el año actual y se carga el resumen del dashboard
document.addEventListener('DOMContentLoaded', () => {
  const añoActual = new Date().getFullYear();
  cargarResumenDashboard(`${añoActual}`);
});
async function cargarResumenDashboard(año) {
  try {
    const eventos = await obtenerEventos(año);
    let totalEquipos = 0;
    let totalModalidades = 0;

    const modalidadesContador = {};

    for (const evento of eventos) {
      const modalidades = await obtenerModalidades(año, evento);
      totalModalidades += modalidades.length;

      for (const modalidad of modalidades) {
        const equipos = await obtenerEquipos(año, evento, modalidad);
        totalEquipos += equipos.length;

        const clave = `${evento.toUpperCase()} - ${modalidad}`;
        modalidadesContador[clave] = (modalidadesContador[clave] || 0) + equipos.length;
      }
    }

    // Actualizar contadores
    document.getElementById("total-equipos").textContent = totalEquipos;
    document.getElementById("total-modalidades").textContent = totalModalidades;
    document.getElementById("total-eventos").textContent = eventos.length;

    // Crear gráfica
    generarGraficaModalidades(modalidadesContador);

  } catch (error) {
    console.error("❌ Error cargando dashboard:", error);
  }
}


function generarGraficaModalidades(data) {
  const canvas = document.getElementById('graficaModalidades');
  if (!canvas) {
    console.warn("⚠️ No se encontró el canvas para la gráfica.");
    return;
  }

  const ctx = canvas.getContext('2d');

  // ✅ Destruir gráfica anterior si ya existe
  if (window.graficaModalidadesInstance instanceof Chart) {
    window.graficaModalidadesInstance.destroy();
  }

  // 🎯 Crear nueva instancia
  window.graficaModalidadesInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Cantidad de Equipos',
        data: Object.values(data),
        backgroundColor: 'rgba(25, 124, 200, 0.6)',
        borderColor: 'rgba(25, 124, 200, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0}
        }
      }
    }
  });
}
window.addEventListener('resize', () => {
  if (window.graficaModalidadesInstance) {
    window.graficaModalidadesInstance.resize();
  }
});