async function incluirComponente(id, url) {
  const contenedor = document.getElementById(id);
  if (contenedor) {
    try {
      const respuesta = await fetch(url);
      const html = await respuesta.text();
      contenedor.innerHTML = html;

      if (id === 'sidebar') {
        contenedor.classList.add('sidebar');

        const mod = await import('/Assets/Js/components/sidebarToggle.js');
        if (typeof mod.default === 'function') {
          mod.default();
        }

        // ✅ Esperar un ciclo de render antes de asignar eventos
        requestAnimationFrame(() => {
          const submenuLinks = contenedor.querySelectorAll('.submenu-toggle > a');
          console.log("Submenús encontrados:", submenuLinks.length);

          submenuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
              e.preventDefault();
              const item = link.closest('.submenu-toggle');
              if (item) {
                item.classList.toggle('active');
              }
            });
          });
        });
      }

      if (id === 'header') {
        const cerrarSesion = document.getElementById("cerrarSesionBtn");
        if (cerrarSesion) {
          cerrarSesion.addEventListener("click", () => {
            sessionStorage.clear();
            window.location.href = "/index.html";
          });
        }
      }
    } catch (error) {
      console.error(`Error cargando componente ${id}:`, error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  incluirComponente("header", "./components/header.html");
  incluirComponente("sidebar", "./components/sidebar.html");
});
