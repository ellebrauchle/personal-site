/* The Interests albums on About Me.

   Each card is a button carrying its album's folder and how many photos are
   in it; the filenames are 01.jpg upward, so the strip is built from the
   count rather than a manifest the site would have to fetch.

   The album is one horizontal strip: the photo in the middle is full size,
   its neighbours sit smaller either side. Scrolling, swiping, the arrows and
   the arrow keys all move between them. Each slide starts on the 540px
   thumbnail and swaps to the 1400px frame when it reaches the middle, so an
   album costs a few hundred KB to open rather than several megabytes.

   Only this page loads it. */
(function () {
  var cards = document.querySelectorAll('[data-album]');
  if (!cards.length) return;

  var overlay, titleEl, countEl, stripEl;
  var album = null, photos = 0, current = 1, opener = null, slides = [], wheelLock = false;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function thumb(n) { return 'assets/photos/' + album + '/sm/' + pad(n) + '.jpg'; }
  function full(n) { return 'assets/photos/' + album + '/' + pad(n) + '.jpg'; }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'album';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'album-title');
    overlay.innerHTML =
      '<div class="album-bar">' +
        '<h2 class="album-title" id="album-title"></h2>' +
        '<span class="album-count" aria-live="polite"></span>' +
        '<button type="button" class="album-close" aria-label="Close album">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" fill="none"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="album-reel">' +
        '<button type="button" class="album-nav album-prev" aria-label="Previous photo">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M15 5l-7 7 7 7"/></svg>' +
        '</button>' +
        '<div class="album-strip" tabindex="0" aria-label="Photos, scroll sideways"></div>' +
        '<button type="button" class="album-nav album-next" aria-label="Next photo">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M9 5l7 7-7 7"/></svg>' +
        '</button>' +
      '</div>';
    document.body.appendChild(overlay);

    titleEl = overlay.querySelector('.album-title');
    countEl = overlay.querySelector('.album-count');
    stripEl = overlay.querySelector('.album-strip');

    overlay.querySelector('.album-close').addEventListener('click', close);
    overlay.querySelector('.album-prev').addEventListener('click', function () { step(-1); });
    overlay.querySelector('.album-next').addEventListener('click', function () { step(1); });
    stripEl.addEventListener('pointerdown', onDown);
    stripEl.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', place);
    // the strip can change size without the window doing so, and how many
    // neighbours fit depends on its width
    if (window.ResizeObserver) new ResizeObserver(place).observe(stripEl);
  }

  function open(card) {
    if (!overlay) build();
    opener = card;
    album = card.getAttribute('data-album');
    photos = parseInt(card.getAttribute('data-count'), 10) || 0;
    titleEl.textContent = card.getAttribute('data-title') || '';

    stripEl.innerHTML = '';
    slides = [];
    for (var n = 1; n <= photos; n++) {
      var s = document.createElement('button');
      s.type = 'button';
      s.className = 'album-slide';
      s.setAttribute('data-n', n);
      s.setAttribute('aria-label', 'Photo ' + n + ' of ' + photos);
      var img = document.createElement('img');
      img.src = thumb(n);
      img.setAttribute('data-full', full(n));
      img.alt = '';
      img.decoding = 'async';
      img.addEventListener('load', place);
      s.appendChild(img);
      s.addEventListener('click', onSlideClick);
      stripEl.appendChild(s);
      slides.push(s);
    }

    overlay.hidden = false;
    document.body.classList.add('album-open');
    document.addEventListener('keydown', onKey);
    // Straight away, not in a requestAnimationFrame: a backgrounded or hidden
    // page throttles frames, and the album would open showing the previous
    // album's position with nothing marked.
    current = 1;
    goTo(1);
    overlay.querySelector('.album-close').focus();
  }

  function onSlideClick(e) {
    var n = parseInt(e.currentTarget.getAttribute('data-n'), 10);
    if (n !== current) goTo(n);
  }

  /* the albums wrap: past the last photo is the first one again */
  function wrap(n) { return ((n - 1) % photos + photos) % photos + 1; }

  function goTo(n) { mark(wrap(n)); }

  function step(d) { goTo(current + d); }

  var SCALE = [1, 0.62, 0.40];
  var TUCK = 0.60;   /* how far each photo sits behind the one in front */

  /* Lay the slides out around the middle one, overlapping. A plain row only
     ever has room for one neighbour each side at this size, and two are
     wanted either side.

     Each step is figured from the two photos' own widths -- a portrait and a
     landscape are nothing like the same width -- and then clamped so the
     outer edge stays inside the strip. Without the clamp a wide middle photo
     pushes the second neighbour off the screen entirely. */
  function place() {
    var half = stripEl.clientWidth / 2;
    /* a phone has no room for five photos: show one neighbour each side */
    var depth = half < 340 ? 1 : 2;
    var w = [];
    for (var i = 0; i < slides.length; i++) w[i] = slides[i].offsetWidth || 0;

    function widthAt(off) {
      var idx = wrap(current + off) - 1;
      return (w[idx] || w[current - 1] || 0) * SCALE[Math.abs(off)];
    }

    function offsets(dir) {
      var w0 = widthAt(0), w1 = widthAt(dir), w2 = widthAt(2 * dir);
      var o1 = (w0 + w1) / 2 * TUCK;
      o1 = Math.min(o1, half - w1 / 2 - 10);          // keep its edge on screen
      // and never let a clamp pull it back inside the middle photo
      o1 = Math.max(o1, w0 / 2 - w1 / 2 + 22);
      if (depth < 2) return [0, o1, o1];
      var o2 = o1 + (w1 + w2) / 2 * TUCK;
      o2 = Math.min(o2, half - w2 / 2 - 4);
      o2 = Math.max(o2, o1 + (w1 - w2) / 2 + 26);      // 26px of it must show
      return [0, o1, o2];
    }

    var left = offsets(-1), right = offsets(1);

    for (var j = 0; j < slides.length; j++) {
      // the shortest way round, so the photos either side of the first one
      // are the last ones rather than nothing at all
      var off = (j + 1) - current;
      if (off > photos / 2) off -= photos;
      else if (off < -photos / 2) off += photos;
      var away = Math.abs(off);
      var s = slides[j];
      if (away > depth) { s.hidden = true; continue; }
      s.hidden = false;
      var x = off < 0 ? -left[away] : right[away];
      s.style.transform = 'translate(-50%, -50%) translateX(' + Math.round(x) +
        'px) scale(' + SCALE[away] + ')';
      s.style.opacity = away === 0 ? 1 : (away === 1 ? 0.6 : 0.34);
      s.style.zIndex = 10 - away;
      s.setAttribute('aria-hidden', away === 0 ? 'false' : 'true');
      s.tabIndex = away === 0 ? -1 : 0;
    }
  }

  /* drag or swipe sideways to move one photo */
  function onDown(e) {
    if (e.button) return;
    var x0 = e.clientX, moved = false;
    function move(ev) {
      if (!moved && Math.abs(ev.clientX - x0) > 40) {
        moved = true;
        step(ev.clientX < x0 ? 1 : -1);
      }
    }
    function up() {
      stripEl.removeEventListener('pointermove', move);
      stripEl.removeEventListener('pointerup', up);
      stripEl.removeEventListener('pointercancel', up);
    }
    stripEl.addEventListener('pointermove', move);
    stripEl.addEventListener('pointerup', up);
    stripEl.addEventListener('pointercancel', up);
  }

  function onWheel(e) {
    var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12 || wheelLock) return;
    e.preventDefault();
    wheelLock = true;
    setTimeout(function () { wheelLock = false; }, 260);
    step(d > 0 ? 1 : -1);
  }

  function mark(n) {
    current = n;
    for (var i = 0; i < slides.length; i++) {
      slides[i].classList.toggle('is-active', i === n - 1);
    }
    place();
    countEl.textContent = n + ' of ' + photos;
    // the middle photo earns the full-size file
    var img = slides[n - 1] && slides[n - 1].querySelector('img');
    if (img) {
      var f = img.getAttribute('data-full');
      if (f && img.getAttribute('src') !== f) img.setAttribute('src', f);
    }
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove('album-open');
    document.removeEventListener('keydown', onKey);
    if (opener) opener.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  }

  Array.prototype.forEach.call(cards, function (card) {
    card.addEventListener('click', function () { open(card); });
  });
})();
