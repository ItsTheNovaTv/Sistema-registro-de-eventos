async function incluirComponente(id, ruta) {
    const contenedor = document.getElementById(id);
    if (contenedor) {
      const res = await fetch(ruta);
      const html = await res.text();
      contenedor.innerHTML = html;
    }
  }
  
  document.addEventListener("DOMContentLoaded", async () => {
    await incluirComponente("header-placeholder", "/Assets/Pages/components/header.html");
    await incluirComponente("sidebar-placeholder", "/Assets/Pages/components/sidebar.html");
  });
  