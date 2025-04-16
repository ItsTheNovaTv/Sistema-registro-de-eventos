//proteccion contra volver atras del navegador
document.addEventListener("DOMContentLoaded", () => {
    const usuarioId = sessionStorage.getItem("usuarioId");
  
    if (!usuarioId) {
      // No hay sesión activa → redirigir al index
      window.location.href = "/index.html";
    }
  });
  