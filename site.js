/* Shared behaviour for every page. Currently just the mobile nav —
   the wireframe note for direction 1a says the nav collapses to ☰. */
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close the menu on Escape, and whenever the viewport grows back to
  // desktop width so the panel can't be left stranded open.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  window.matchMedia('(min-width: 621px)').addEventListener('change', function (event) {
    if (event.matches) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
