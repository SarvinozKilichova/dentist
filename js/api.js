/* API qatlami. Django'ga o'tganda faqat shu faylni almashtiring. */
const API = {
  async availability(doctor, date) {
    const r = await fetch(`${CONFIG.API_URL}?action=availability&doctor=${encodeURIComponent(doctor)}&date=${date}`);
    return r.json();
  },
  async createBooking(b) {
    // text/plain — Apps Script uchun CORS preflight'siz yuborish
    const r = await fetch(CONFIG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(b) });
    return r.json();
  }
};
