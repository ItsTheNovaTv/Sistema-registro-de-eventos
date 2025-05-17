export default function initSidebarToggle() {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Acordeón funcional del submenú
  const submenuLinks = document.querySelectorAll('.submenu-toggle > a');
  submenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const item = link.closest('.submenu-toggle'); // Garantiza que sea el <li>
      if (item) {
        item.classList.toggle('active');
      }
    });
  });
}
