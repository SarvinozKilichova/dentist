/**
 * Booking sahifasi: xizmat -> shifokor -> sana -> vaqt -> ma'lumotlar -> yuborish.
 * Backend bilan aloqa faqat api.js orqali amalga oshiriladi.
 */
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktabr', 'noyabr', 'dekabr'];

const MESSAGES = {
  network: 'Internet connection bilan muammo yuz berdi. Iltimos, qayta urinib ko‘ring.',
  server: 'Bookingni yuborishda xatolik yuz berdi. Iltimos, birozdan so‘ng qayta urinib ko‘ring.',
  slotTaken: 'Bu vaqt hozirgina band qilindi. Iltimos, boshqa vaqtni tanlang.',
  slotsFailed: 'Vaqtlarni yuklab bo‘lmadi. Sanani qayta tanlab ko‘ring.',
  noSlots: 'Bu kunga bo‘sh vaqt qolmagan. Boshqa sanani tanlang.',
  nameRequired: 'Ismingizni kiriting.',
  phoneRequired: 'Telefon raqamingizni kiriting.',
  phoneInvalid: 'Telefonni +998 XX XXX XX XX formatida kiriting.'
};

// Tanlangan qiymatlar
const state = { service: null, doctor: null, date: '', time: '' };
let receipt = null;

const params = new URLSearchParams(location.search);
const pad = (n) => String(n).padStart(2, '0');
const connectionError = () => (navigator.onLine ? MESSAGES.server : MESSAGES.network);

/* ---------- Yordamchi funksiyalar ---------- */
function toggle(id, visible = true) {
  document.getElementById(id).hidden = !visible;
}

function setText(id, text = '') {
  document.getElementById(id).textContent = text;
}

// "2026-10-05" -> "5-oktabr, 2026"
function formatDate(iso) {
  const [year, month, day] = iso.split('-');
  return `${Number(day)}-${MONTHS[month - 1]}, ${year}`;
}

// Ish vaqtidan 30 daqiqalik slotlar ro'yxatini yaratadi: ['09:00', '09:30', ...]
function buildSlots() {
  const toMinutes = (hhmm) => hhmm.split(':').reduce((h, m) => h * 60 + Number(m));
  const { start, end, step } = CONFIG.WORK;
  const slots = [];
  for (let t = toMinutes(start); t < toMinutes(end); t += step) {
    slots.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return slots;
}

// Telefonni "+998XXXXXXXXX" ko'rinishiga keltiradi, noto'g'ri bo'lsa null
function normalizePhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 9) digits = '998' + digits;
  return /^998\d{9}$/.test(digits) ? `+${digits}` : null;
}

const prettyPhone = (phone) => phone.replace(/(\+998)(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');

function optionsHtml(items, label) {
  return items.map((item) => `
    <button type="button" class="opt" data-id="${item.id}" aria-pressed="false">${label(item)}</button>`).join('');
}

function markSelected(container, id) {
  container.querySelectorAll('.opt').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.id === id));
  });
}

/* ---------- Qadamlar ---------- */
function selectService(id) {
  state.service = SERVICES.find((s) => s.id === id);
  state.doctor = null;
  state.time = '';
  markSelected($('#services'), id);

  const doctors = DOCTORS.filter((d) => d.services.includes(id));
  $('#doctors').innerHTML = optionsHtml(doctors, (d) => `<b>${d.name}</b><small>${d.spec} · ${d.exp} yil</small>`);

  toggle('step-doctor');
  ['step-date', 'step-time', 'form'].forEach((step) => toggle(step, false));
  renderSummary();
}

function selectDoctor(id) {
  state.doctor = DOCTORS.find((d) => d.id === id);
  state.time = '';
  markSelected($('#doctors'), id);

  toggle('step-date');
  if (state.date) loadSlots();
  renderSummary();
}

async function loadSlots() {
  if (!state.doctor || !state.date) return;

  state.time = '';
  toggle('step-time');
  toggle('form', false);
  setText('slots-error');

  const box = $('#slots');
  box.innerHTML = '<p class="muted">Yuklanmoqda...</p>';

  try {
    const response = await API.availability(state.doctor.name, state.date);
    if (response.result !== 'success') throw new Error(response.message);

    const free = new Set(response.slots);
    box.innerHTML = buildSlots().map((time) => {
      const isFree = free.has(time);
      return `<button type="button" class="slot" data-time="${time}" aria-pressed="false" ${isFree ? '' : 'disabled'}>
        ${time}${isFree ? '' : '<small>Band</small>'}
      </button>`;
    }).join('');

    if (!free.size) setText('slots-error', MESSAGES.noSlots);
  } catch (error) {
    box.innerHTML = '';
    setText('slots-error', navigator.onLine ? MESSAGES.slotsFailed : MESSAGES.network);
  }
  renderSummary();
}

function selectTime(button) {
  state.time = button.dataset.time;
  $('#slots').querySelectorAll('.slot').forEach((slot) => {
    slot.setAttribute('aria-pressed', String(slot === button));
  });
  toggle('form');
  renderSummary();
}

function renderSummary() {
  const phone = normalizePhone($('#phone').value);
  const rows = [
    ['Xizmat', state.service?.name],
    ['Shifokor', state.doctor?.name],
    ['Sana', state.date && formatDate(state.date)],
    ['Vaqt', state.time],
    ['Ism', $('#name').value.trim()],
    ['Telefon', phone && prettyPhone(phone)]
  ];
  $('#summary').innerHTML = rows.map(([label, value]) => `<dt>${label}:</dt><dd>${value || '—'}</dd>`).join('');
}

/* ---------- Yuborish ---------- */
function validateForm() {
  const name = $('#name').value.trim();
  const rawPhone = $('#phone').value.trim();
  const phone = normalizePhone(rawPhone);

  setText('name-error', name ? '' : MESSAGES.nameRequired);
  if (!rawPhone) setText('phone-error', MESSAGES.phoneRequired);
  else setText('phone-error', phone ? '' : MESSAGES.phoneInvalid);

  const complete = state.service && state.doctor && state.date && state.time;
  return name && phone && complete ? { name, phone } : null;
}

async function handleSubmit(event) {
  event.preventDefault();

  const contact = validateForm();
  if (!contact) return;

  const button = $('#submit');
  button.disabled = true; // ikki marta bosishdan himoya
  button.textContent = 'Yuborilmoqda...';
  setText('form-error');

  try {
    const response = await API.createBooking({
      date: state.date,
      time: state.time,
      doctor: state.doctor.name,
      service: state.service.name,
      name: contact.name,
      phone: contact.phone,
      comment: $('#comment').value.trim()
    });

    if (response.result === 'success') {
      showSuccess(response.bookingId, contact.phone);
    } else if (/already booked/i.test(response.message || '')) {
      setText('form-error', MESSAGES.slotTaken);
      loadSlots(); // band vaqtlarni yangilaymiz
    } else {
      setText('form-error', MESSAGES.server);
    }
  } catch (error) {
    setText('form-error', connectionError());
  } finally {
    button.disabled = false;
    button.textContent = 'Qabulga yozilish';
  }
}

/* ---------- Success modal va saqlash ---------- */
function showSuccess(bookingId, phone) {
  receipt = {
    id: bookingId,
    doctor: state.doctor.name,
    service: state.service.name,
    date: formatDate(state.date),
    time: state.time,
    phone: prettyPhone(phone)
  };

  const rows = [
    ['Booking №', receipt.id],
    ['Shifokor', receipt.doctor],
    ['Muolaja', receipt.service],
    ['Sana', receipt.date],
    ['Vaqt', receipt.time]
  ];
  $('#receipt').innerHTML = rows.map(([label, value]) => `<dt>${label}:</dt><dd>${value}</dd>`).join('');
  $('#modal').showModal(); // <dialog>: ESC va focus boshqaruvi brauzer tomonidan
}

// Bron kartasini canvas orqali PNG qilib yuklab beradi
function saveReceipt() {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 520;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, 640, 520);
  ctx.fillStyle = '#0b2a4a';
  ctx.fillRect(0, 0, 640, 90);
  ctx.fillStyle = '#fff';
  ctx.font = '700 30px sans-serif';
  ctx.fillText(CONFIG.CLINIC.name, 32, 56);

  ctx.fillStyle = '#0b2a4a';
  ctx.font = '700 34px sans-serif';
  ctx.fillText(receipt.id, 32, 150);

  const rows = [
    ['Shifokor', receipt.doctor],
    ['Muolaja', receipt.service],
    ['Sana', receipt.date],
    ['Vaqt', receipt.time],
    ['Telefon', receipt.phone]
  ];
  rows.forEach(([label, value], i) => {
    const y = 215 + i * 50;
    ctx.fillStyle = '#5b7a99';
    ctx.font = '20px sans-serif';
    ctx.fillText(label, 32, y);
    ctx.fillStyle = '#0b2a4a';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(value, 220, y);
  });

  ctx.fillStyle = '#5b7a99';
  ctx.font = '18px sans-serif';
  ctx.fillText(`${CONFIG.CLINIC.name} · ${CONFIG.CLINIC.phone}`, 32, 490);

  const link = document.createElement('a');
  link.download = `${receipt.id}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/* ---------- Ishga tushirish ---------- */
function init() {
  $('#services').innerHTML = optionsHtml(SERVICES, (s) => `<b>${s.name}</b><small>${s.min} min · ${priceText(s)}</small>`);

  // O'tgan sanalar tanlanmasin
  const today = new Date();
  $('#date').min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  $('#services').addEventListener('click', (e) => {
    const btn = e.target.closest('.opt');
    if (btn) selectService(btn.dataset.id);
  });
  $('#doctors').addEventListener('click', (e) => {
    const btn = e.target.closest('.opt');
    if (btn) selectDoctor(btn.dataset.id);
  });
  $('#slots').addEventListener('click', (e) => {
    const btn = e.target.closest('.slot');
    if (btn && !btn.disabled) selectTime(btn);
  });
  $('#date').addEventListener('change', (e) => {
    const valid = e.target.value >= e.target.min;
    state.date = valid ? e.target.value : '';
    if (!valid) e.target.value = '';
    loadSlots();
  });

  ['name', 'phone', 'comment'].forEach((id) => $('#' + id).addEventListener('input', renderSummary));
  $('#form').addEventListener('submit', handleSubmit);
  $('#save').addEventListener('click', saveReceipt);
  $('#ok').addEventListener('click', () => {
    $('#modal').close();
    location.href = 'index.html';
  });

  // Landing'dan kelgan ?service=... yoki ?doctor=... ni oldindan tanlash
  if (SERVICES.some((s) => s.id === params.get('service'))) selectService(params.get('service'));
  const preselected = DOCTORS.find((d) => d.id === params.get('doctor'));
  if (preselected) {
    selectService(preselected.services[0]);
    selectDoctor(preselected.id);
  }
  renderSummary();
}

init();
