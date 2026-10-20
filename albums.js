/* The Interests albums on About Me.

   Each card is a button carrying its album's folder and how many photos are
   in it; the filenames are 01.jpg upward, so the grid is built from the count
   rather than a manifest the site would have to fetch. Thumbnails live in
   <album>/sm/ and the full frame beside them.

   Only this page loads it. */
(function () {
  var cards = document.querySelectorAll('[data-album]');
  if (!cards.length) return;

  var overlay, titleEl, gridEl, stageEl, stageImg, countEl;
  var album = null, photos = 0, current = -1, opener = null;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function thumb(n) { return 'assets/photos/' + album + '/sm/' + pad(n) + '.jpg'; }
  function full(n) { return 'assets/photos/' + album + '/' + pad(n) + '.jpg'; }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'album';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Photo album');
    overlay.innerHTML =
      '<div class="album-bar">' +
        '<h2 class="album-title" id="album-title"></h2>' +
        '<span class="album-count"></span>' +
        '<button type="button" class="album-close" aria-label="Close album">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" fill="none"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="album-grid"></div>' +
      '<div class="album-stage" hidden>' +
        '<button type="button" class="album-nav album-prev" aria-label="Previous photo">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M15 5l-7 7 7 7"/></svg>' +
        '</button>' +
        '<img alt="">' +
        '<button type="button" class="album-nav album-next" aria-label="Next photo">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M9 5l7 7-7 7"/></svg>' +
        '</button>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.setAttribute('aria-labelledby', 'album-title');
    titleEl = overlay.querySelector('.album-title');
    countEl = overlay.querySelector('.album-count');
    gridEl = overlay.querySelector('.album-grid');
    stageEl = overlay.querySelector('.album-stage');
    stageImg = stageEl.querySelector('img');

    overlay.querySelector('.album-close').addEventListener('click', close);
    overlay.querySelector('.album-prev').addEventListener('click', function () { step(-1); });
    overlay.querySelector('.album-next').addEventListener('click', function () { step(1); });
    stageEl.addEventListener('click', function (e) { if (e.target === stageEl) showGrid(); });
  }

  function open(card) {
    if (!overlay) build();
    opener = card;
    album = card.getAttribute('data-album');
    photos = parseInt(card.getAttribute('data-count'), 10) || 0;
    titleEl.textContent = card.getAttribute('data-title') || '';
    countEl.textContent = photos + (photos === 1 ? ' photo' : ' photos');

    gridEl.innerHTML = '';
    for (var n = 1; n <= photos; n++) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'album-thumb';
      b.setAttribute('data-n', n);
      b.setAttribute('aria-label', 'Open photo ' + n + ' of ' + photos);
      var img = document.createElement('img');
      img.src = thumb(n);
      img.alt = '';
      img.loading = 'lazy';
      b.appendChild(img);
      b.addEventListener('click', openStage);
      gridEl.appendChild(b);
    }

    showGrid();
    overlay.hidden = false;
    document.body.classList.add('album-open');
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.album-close').focus();
  }

  function openStage(e) {
    show(parseInt(e.currentTarget.getAttribute('data-n'), 10));
  }

  function show(n) {
    current = n;
    stageImg.src = full(n);
    stageImg.alt = 'Photo ' + n + ' of ' + photos;
    stageEl.hidden = false;
    gridEl.hidden = true;
  }

  function showGrid() {
    current = -1;
    stageEl.hidden = true;
    stageImg.removeAttribute('src');
    gridEl.hidden = false;
  }

  function step(d) {
    if (current < 0) return;
    show(((current - 1 + d + photos) % photos) + 1);
  }

  function close() {
    overlay.hidden = true;
    showGrid();
    document.body.classList.remove('album-open');
    document.removeEventListener('keydown', onKey);
    if (opener) opener.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') { current < 0 ? close() : showGrid(); }
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  }

  Array.prototype.forEach.call(cards, function (card) {
    card.addEventListener('click', function () { open(card); });
  });
})();
