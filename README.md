1. Yangi Google Sheet oching → **Extensions → Apps Script**. `apps-script/Code.gs` ni joylang.
2. Project Settings → vaqt zonasi: `Asia/Tashkent`.
3. `setup()` funksiyasini bir marta ishga tushiring (Appointments, Doctors, Services sheetlari yaratiladi; ruxsat bering).
4. **Deploy → New deployment → Web app**: Execute as *Me*, Access *Anyone*. `/exec` URL ni nusxalang.
5. `js/config.js` da `API_URL` ga URL ni qo‘ying. Kod o‘zgarsa — yangi versiya bilan qayta deploy qiling.
6. Tekshirish: `/exec` URL brauzerda `DENTAL BACKEND ISHLAYAPTI` chiqarishi kerak. Saytni statik hostingda (yoki `python3 -m http.server`) oching.
## Eslatmalar
- Xizmat/shifokorlar hozircha `js/config.js` da; Sheets'dagi `Doctors`/`Services` kelajak uchun.
- Double-booking `LockService` bilan backendda qayta tekshiriladi. Statuslarni (`confirmed`, `cancelled`, `completed`) Sheets'da qo‘lda o‘zgartiring; `cancelled` slot qayta bo‘shaydi.
- Django'ga o‘tish: faqat `js/api.js` ni almashtiring (javob formati bir xil).
- Rasmlar `assets/images/` da (WebP, <100 KB, illyustratsiya) — haqiqiy fotolar bilan almashtirish mumkin; Google Maps iframe'ni qo‘shing.
