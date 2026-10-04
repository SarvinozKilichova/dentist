/**
 * Sayt sozlamalari va demo ma'lumotlar.
 * Hammasi shu yerda — keyinchalik Google Sheets yoki Django API'dan olinadigan qilib almashtirish oson.
 */

// Umumiy sozlamalar: backend manzili, klinika kontaktlari, ish vaqti
const CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzPk4NajKPQ423kK3XbDPdxeJqWqA4p27ORYBkBG3_vuK44NUKH6R5IZyysS8MfONrL2A/exec',
  CLINIC: {
    name: 'DENTALIS',
    phone: '+998 XX XXX XX XX',
    telegram: '@dentalis',
    instagram: '@dentalis',
    address: 'Toshkent sh., Namuna ko‘chasi 12',
    hours: 'Du–Shan: 09:00–18:00',
    off: 'Yakshanba: dam olish'
  },
  WORK: {
    start: '09:00',
    end: '18:00',
    step: 30
  }
};

// Xizmatlar (price — so'm, min — davomiylik, from — "...dan" narx)
const SERVICES = [
  {
    id: 's1',
    name: 'Konsultatsiya',
    desc: 'Ko‘rik, diagnostika va davolash rejasi.',
    price: 100000,
    min: 30
  },
  {
    id: 's2',
    name: 'Karies davolash',
    desc: 'Og‘riqsiz davolash va zamonaviy plomba.',
    price: 300000,
    min: 60,
    from: true
  },
  {
    id: 's3',
    name: 'Professional tozalash',
    desc: 'Ultratovush va Air Flow bilan tozalash.',
    price: 350000,
    min: 45,
    from: true
  },
  {
    id: 's4',
    name: 'Tish oqartirish',
    desc: 'Xavfsiz oqartirish, 1–3 tonga yorqinroq.',
    price: 800000,
    min: 60,
    from: true
  },
  {
    id: 's5',
    name: 'Implantatsiya',
    desc: 'Yo‘qolgan tishni uzoq muddatga tiklash.',
    price: 4500000,
    min: 90,
    from: true
  },
  {
    id: 's6',
    name: 'Protezlash',
    desc: 'Koronka, vinir va olinadigan protezlar.',
    price: 1200000,
    min: 60,
    from: true
  },
  {
    id: 's7',
    name: 'Ortodontiya',
    desc: 'Breket va alignerlar bilan tishlarni tekislash.',
    price: 500000,
    min: 45,
    from: true
  },
  {
    id: 's8',
    name: 'Bolalar stomatologiyasi',
    desc: 'Bolalar uchun yumshoq va xavfsiz davolash.',
    price: 150000,
    min: 30,
    from: true
  }
];

// Shifokorlar (services — ular ko'rsatadigan xizmat id'lari)
const DOCTORS = [
  {
    id: 'd1',
    name: 'Dr. Aziz Karimov',
    spec: 'Stomatolog-terapevt',
    exp: 8,
    desc: 'Karies va endodontik davolash.',
    services: ['s1', 's2', 's3', 's4'],
    photo: 'assets/images/doctor-1.webp'
  },
  {
    id: 'd2',
    name: 'Dr. Malika Yusupova',
    spec: 'Ortodont',
    exp: 10,
    desc: 'Breket va alignerlar bo‘yicha mutaxassis.',
    services: ['s1', 's7'],
    photo: 'assets/images/doctor-2.webp'
  },
  {
    id: 'd3',
    name: 'Dr. Jasur Rahimov',
    spec: 'Stomatolog-jarroh',
    exp: 12,
    desc: 'Implantatsiya va murakkab jarrohlik.',
    services: ['s1', 's5', 's6'],
    photo: 'assets/images/doctor-3.webp'
  },
  {
    id: 'd4',
    name: 'Dr. Nilufar Saidova',
    spec: 'Bolalar stomatologi',
    exp: 6,
    desc: 'Bolalar bilan mehr bilan ishlaydi.',
    services: ['s1', 's8', 's3'],
    photo: 'assets/images/doctor-4.webp'
  }
];

// Bemorlar fikrlari
const REVIEWS = [
  {
    name: 'Sarvinoz A.',
    text: 'Shifokor juda batafsil tushuntirdi va davolash jarayoni qulay o‘tdi.'
  },
  {
    name: 'Bekzod T.',
    text: 'Online yozilish juda oson bo‘ldi, navbat kutmadim.'
  },
  {
    name: 'Dilnoza M.',
    text: 'Farzandim uchun ajoyib yondashuv. Rahmat!'
  }
];

// 100000 -> "100 000 so'm"
const fmtPrice = (n) => n.toLocaleString('en-US').replace(/,/g, ' ') + ' so‘m';
