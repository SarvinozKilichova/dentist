/**
 * Umumiy skript: landing sectionlarini chizish, navbar, loader va animatsiyalar.
 * Har ikkala sahifada (index.html, booking.html) ishlaydi.
 */
const $ = (selector, root = document) => root.querySelector(selector);

const priceText = (service) => fmtPrice(service.price) + (service.from ? 'dan' : '');

function render(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

/* ---------- Landing ma'lumotlarini chizish ---------- */
const toothIcon = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-tooth" /></svg>';

render('services-list', SERVICES.map((s) => `
  <article class="card">
    ${toothIcon}
    <h3>${s.name}</h3>
    <p>${s.desc}</p>
    <p class="meta"><b>${priceText(s)}</b> · ${s.min} min</p>
    <a class="link" href="booking.html?service=${s.id}">Qabulga yozilish</a>
  </article>`).join(''));

render('doctors-list', DOCTORS.map((d) => `
  <article class="card doc">
    <div class="avatar">
      <img src="${d.photo}" width="400" height="400" loading="lazy" alt="${d.name}, ${d.spec}">
    </div>
    <h3>${d.name}</h3>
    <p class="spec">${d.spec} · ${d.exp} yil tajriba</p>
    <p>${d.desc}</p>
    <a class="btn sm" href="booking.html?doctor=${d.id}">Qabulga yozilish</a>
  </article>`).join(''));

render('price-rows', SERVICES.map((s) => `
  <tr>
    <td>${s.name}</td>
    <td class="r">${s.min} min</td>
    <td class="r">${priceText(s)}</td>
  </tr>`).join(''));

render('reviews-list', REVIEWS.map((r) => `
  <figure class="card">
    <span class="stars" aria-label="5 yulduz">★★★★★</span>
    <blockquote>“${r.text}”</blockquote>
    <figcaption>${r.name}</figcaption>
  </figure>`).join(''));

document.querySelectorAll('[data-clinic]').forEach((el) => {
  el.textContent = CONFIG.CLINIC[el.dataset.clinic];
});

/* ---------- Mobil menyu ---------- */
const burger = $('#burger');
const nav = $('#nav');

function setMenu(open) {
  nav.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
}

if (burger) {
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') setMenu(false);
  });
}

/* ---------- Header soyasi (scroll) ---------- */
const header = $('header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Scroll reveal ---------- */
const REVEAL_TARGETS = 'section h2, .lead, .card, .tbl, .note, .contact > *, .final p, .final .btn, #prices > .wrap > .btn, .about-img';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setupReveal() {
  const items = document.querySelectorAll(REVEAL_TARGETS);
  if (reduceMotion || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
      // Animatsiyadan keyin klassni olib tashlaymiz — hover effektlariga halal bermasin
      setTimeout(() => entry.target.classList.remove('reveal', 'in'), 1000);
      if (entry.target.matches('.stat')) countUp(entry.target.querySelector('b'));
    });
  }, { threshold: 0.15 });

  items.forEach((el) => {
    // Bir qatordagi kartalar ketma-ket paydo bo'ladi
    const index = [...el.parentElement.children].indexOf(el);
    el.style.setProperty('--d', `${Math.min(index, 5) * 0.07}s`);
    el.classList.add('reveal');
    observer.observe(el);
  });
}

/* ---------- Statistika sanagichi ---------- */
function countUp(el) {
  if (!el || reduceMotion) return;
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased).toLocaleString('en-US').replace(/,/g, ' ') + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- Loader ---------- */
const loader = $('#loader');
const loaderShownAt = performance.now();
const MIN_LOADER_MS = 700;

function hideLoader() {
  if (!loader) return;
  const wait = Math.max(0, MIN_LOADER_MS - (performance.now() - loaderShownAt));
  setTimeout(() => {
    loader.classList.add('done');
    document.body.classList.remove('loading');
    loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    setupReveal();
  }, wait);
}

if (document.readyState === 'complete') hideLoader();
else window.addEventListener('load', hideLoader);
