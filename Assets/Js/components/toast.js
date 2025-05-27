export function mostrarToast(mensaje, tipo = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
  
    const toast = document.createElement("div");
    toast.classList.add("toast", tipo);
    toast.textContent = mensaje;
  
    container.appendChild(toast);
  
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
  