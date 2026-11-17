// SPDX-FileCopyrightText: 2026 Wonmor and Tilo contributors
// SPDX-License-Identifier: Apache-2.0

/* Tilo concept demo: fictional sample data. No real person, organisation, phone number or video. Times are
   relative to now, so the demo never ages. Sign "videos" are animated placeholders: in the product every
   sign is recorded by a Deaf signer and checked by two Deaf experts (docs/06_Platforma_rejasi/06a). */

export function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const r = rng(4417);
const pick = (a) => a[Math.floor(r() * a.length)];

/* ---------- Latin <-> Cyrillic (Uzbek) ---------- */
const L2C = [["o'", 'ў'], ["g'", 'ғ'], ['sh', 'ш'], ['ch', 'ч'], ['ng', 'нг'], ['yo', 'ё'], ['yu', 'ю'], ['ya', 'я'], ['ye', 'е'],
  ['a', 'а'], ['b', 'б'], ['d', 'д'], ['e', 'е'], ['f', 'ф'], ['g', 'г'], ['h', 'ҳ'], ['i', 'и'], ['j', 'ж'], ['k', 'к'], ['l', 'л'], ['m', 'м'],
  ['n', 'н'], ['o', 'о'], ['p', 'п'], ['q', 'қ'], ['r', 'р'], ['s', 'с'], ['t', 'т'], ['u', 'у'], ['v', 'в'], ['x', 'х'], ['y', 'й'], ['z', 'з'], ["'", 'ъ']];
export function toCyr(text) {
  let out = '';
  const s = String(text).replace(/[ʻʼ‘’`]/g, "'");
  for (let i = 0; i < s.length;) {
    const low = s.slice(i).toLowerCase();
    const hit = L2C.find(([l]) => low.startsWith(l));
    if (!hit) { out += s[i]; i++; continue; }
    const src = s.slice(i, i + hit[0].length);
    const word = i === 0 || /[\s(«"-]/.test(s[i - 1]);
    let c = hit[0] === 'e' && word ? 'э' : hit[1];
    if (src[0] !== src[0].toLowerCase()) c = c[0].toUpperCase() + c.slice(1);
    out += c; i += hit[0].length;
  }
  return out;
}
export function toLat(text) {
  const map = Object.fromEntries(L2C.filter(([l]) => l !== 'ng' && l !== 'ye').map(([l, c]) => [c, l]));
  Object.assign(map, { э: 'e', ц: 's', щ: 'sh', ы: 'i', ь: '' });
  return String(text).split('').map((ch) => { const low = ch.toLowerCase(); const m = map[low]; if (m == null) return ch; return ch === low ? m : m.charAt(0).toUpperCase() + m.slice(1); }).join('');
}
export const norm = (s) => toLat(String(s).toLowerCase()).replace(/[ʻʼ‘’`]/g, "'");

/* ---------- interpreters, queue, bookings ---------- */
const FIRST = ['Dilnoza', 'Sardor', 'Malika', 'Jasur', 'Nilufar', 'Bobur', 'Gulnora', 'Otabek', 'Shahnoza', 'Ulugʻbek', 'Madina', 'Rustam', 'Kamola', 'Aziz', 'Feruza', 'Sherzod', 'Zarina', 'Behruz', 'Lola', 'Javlon', 'Sevara', 'Anvar', 'Mohira', 'Doniyor'];
const LAST = ['R.', 'T.', 'K.', 'A.', 'M.', 'S.', 'Y.', 'N.', 'X.', 'O.', 'B.', 'Q.'];
const REGIONS = ['Toshkent sh.', 'Toshkent vil.', 'Samarqand', 'Buxoro', 'Fargʻona', 'Andijon', 'Namangan', 'Qashqadaryo', 'Surxondaryo', 'Xorazm', 'Navoiy', 'Jizzax', 'Sirdaryo', 'Qoraqalpogʻiston'];
export const regions = REGIONS;

export const interpreters = FIRST.slice(0, 18).map((f, i) => ({
  id: 'i' + i, name: f + ' ' + LAST[i % LAST.length],
  status: i < 7 ? 'online' : i < 11 ? 'busy' : i < 13 ? 'break' : 'offline',
  langs: i % 3 === 0 ? ['Oʻzbek', 'Rus'] : i % 3 === 1 ? ['Oʻzbek'] : ['Rus', 'Oʻzbek'],
  topics: [['Tibbiyot', 'Bank'], ['Idora', 'Huquq'], ['Taʼlim', 'Ish suhbati'], ['Tibbiyot', 'Oila']][i % 4],
  minutesWeek: 180 + Math.round(r() * 900), streak: Math.round(r() * 200) / 60, rating: (4.5 + r() * 0.5).toFixed(1),
  region: REGIONS[i % 6],
}));

export const hours = { open: 8, close: 22, days: 'Dushanba–Shanba', sunday: '10:00–18:00 (navbatchi)' };

const TOPICS = ['Shifoxona', 'Bank', 'Idora', 'Ish suhbati', 'Taʼlim', 'Oila', 'Huquq', 'Transport', 'Dorixona'];
export const topics = TOPICS;
export function bookings(now) {
  const list = [];
  const statuses = ['confirmed', 'confirmed', 'pending', 'confirmed', 'inperson', 'confirmed', 'cancelled'];
  for (let i = 0; i < 16; i++) {
    const d = new Date(now); d.setDate(d.getDate() + Math.floor(i / 3) - 1); d.setHours(9 + (i * 2) % 11, i % 2 ? 30 : 0, 0, 0);
    list.push({ id: 'b' + i, at: d, minutes: [15, 30, 45, 60][i % 4], topic: TOPICS[i % TOPICS.length], interpreter: interpreters[i % 11].name,
      status: statuses[i % statuses.length], note: i % 5 === 0 ? 'Yuzma-yuz tarjimon tavsiya qilindi (operatsiya oldi suhbati)' : '' });
  }
  return list.sort((a, b) => a.at - b.at);
}
export function queue(now) {
  return Array.from({ length: 9 }, (_, i) => ({ id: 'q' + i, who: 'Foydalanuvchi #' + (4810 + i * 7), topic: TOPICS[(i * 4) % TOPICS.length], waited: 1 + i * 2 + Math.round(r() * 2),
    region: REGIONS[(i * 3) % REGIONS.length], device: i % 3 ? 'PWA (telefon)' : 'Android', since: new Date(now.getTime() - (1 + i * 2) * 60000) }));
}

/* ---------- situation cards (M3) ---------- */
export const situations = [
  { id: 'hospital', name: 'Shifoxona', icon: '✚', cards: ['Men karman. Iltimos, yozib yoki imo-ishora bilan tushuntiring', 'Bu yerim ogʻriyapti', 'Ogʻriq kuchli', 'Ogʻriq 3 kundan beri', 'Menda allergiya bor', 'Qaysi dorini qanday ichaman?', 'Tarjimon chaqira olasizmi?', 'Navbatim qachon?', 'Qon tahlili kerakmi?', 'Natijani yozib bering', 'Homiladorman', 'Isitmam bor'] },
  { id: 'pharmacy', name: 'Dorixona', icon: '℞', cards: ['Shu retsept boʻyicha dori kerak', 'Arzonroq analogi bormi?', 'Kuniga necha marta?', 'Ovqatdan oldinmi yoki keyinmi?', 'Bolaga mumkinmi?', 'Narxini yozib bering', 'Chek kerak', 'Bosim oʻlchagich bormi?'] },
  { id: 'bank', name: 'Bank', icon: '▤', cards: ['Kartam bloklandi', 'Kartani qayta tiklash kerak', 'Pul oʻtkazmoqchiman', 'Hisob raqamimni bilmoqchiman', 'SMS-xabarnoma ulang', 'Kredit haqida maʼlumot', 'Pensiya kartaga tushdimi?', 'Iltimos, sekin va yozib tushuntiring', 'Shartnoma nusxasini bering', 'Bankomat kartani yutib yubordi'] },
  { id: 'taxi', name: 'Taksi', icon: '➜', cards: ['Men karman, yozib gaplashamiz', 'Shu manzilga boramiz', 'Shu yerda toʻxtang', 'Qancha boʻladi?', 'Karta bilan toʻlayman', 'Konditsionerni yoqing', 'Sekinroq yuring, iltimos', 'Kutib turing, 5 daqiqa'] },
  { id: 'police', name: 'Politsiya', icon: '⛨', cards: ['Men karman, tarjimon kerak', 'Hujjatlarim shu yerda', 'Telefonimni oʻgʻirlashdi', 'Yoʻl-transport hodisasi boʻldi', 'Bayonnomani yozib bering', 'Advokat bilan gaplashmoqchiman', 'Shikoyat yozmoqchiman', 'Yoʻqolgan narsa haqida ariza'] },
  { id: 'mahalla', name: 'Mahalla', icon: '⌂', cards: ['Maʼlumotnoma kerak', 'Moddiy yordam haqida soʻramoqchiman', 'Fuqarolar qabuliga yozilmoqchiman', 'Qabulda surdotarjimon boʻlishi kerak', 'Ariza yozishga yordam bering', 'Uy-joy masalasi', 'Bolalar bogʻchasi navbati', 'Yoshlar daftari haqida'] },
  { id: 'shop', name: 'Doʻkon', icon: '◫', cards: ['Buning narxi qancha?', 'Boshqa oʻlchami bormi?', 'Qaytarib bersam boʻladimi?', 'Chek bering', 'Paket kerak emas', 'Chegirma bormi?', 'Karta bilan toʻlayman', 'Qayerda kassasi?'] },
  { id: 'work', name: 'Ish', icon: '◆', cards: ['Men karman, yozma muloqot qulay', 'Uchrashuvga tarjimon olib kelaman', 'Ish vaqti qanday?', 'Vazifani yozib bering', 'Tushunmadim, qayta yozing', 'Maosh qachon?', 'Taʼtil olsam boʻladimi?'] },
];

/* ---------- office helper (M4) ---------- */
export const offices = [
  { id: 'dxm', name: 'Davlat xizmatlari markazi', services: [
    { name: 'Pasport (ID-karta) olish', docs: ['Eski pasport', 'Tugʻilganlik haqida guvohnoma', 'Davlat boji toʻlovi kvitansiyasi', '1 dona rasm (markazda olinadi)'], days: '10 ish kuni' },
    { name: 'Nogironlik guruhini rasmiylashtirish', docs: ['Pasport', 'TMEK xulosasi', 'Tibbiy karta koʻchirmasi', 'Ariza'], days: '15 ish kuni' },
    { name: 'Yashash joyidan roʻyxatga olish', docs: ['Pasport', 'Uy-joy hujjati yoki ijara shartnomasi', 'Ariza'], days: '3 ish kuni' }] },
  { id: 'mahalla', name: 'Mahalla fuqarolar yigʻini', services: [
    { name: 'Moddiy yordam olish', docs: ['Pasport', 'Oila tarkibi haqida maʼlumotnoma', 'Daromad haqida maʼlumot', 'Ariza'], days: '30 kun ichida koʻriladi' },
    { name: 'Oila tarkibi maʼlumotnomasi', docs: ['Pasport', 'Uy daftari'], days: 'Shu kuni' }] },
  { id: 'tax', name: 'Soliq inspeksiyasi', services: [
    { name: 'Soliq imtiyozi (nogironlik)', docs: ['Pasport', 'Nogironlik guvohnomasi', 'STIR', 'Ariza'], days: '10 ish kuni' },
    { name: 'Oʻzini oʻzi band qilgan sifatida roʻyxatdan oʻtish', docs: ['Pasport', 'Telefon raqami (SMS uchun)'], days: 'Onlayn, shu kuni' }] },
  { id: 'pension', name: 'Pensiya jamgʻarmasi', services: [
    { name: 'Nogironlik pensiyasi tayinlash', docs: ['Pasport', 'TMEK xulosasi', 'Mehnat daftarchasi', 'Bank kartasi rekvizitlari'], days: '10 ish kuni' },
    { name: 'Pensiyani boshqa kartaga oʻtkazish', docs: ['Pasport', 'Yangi karta rekvizitlari', 'Ariza'], days: '5 ish kuni' }] },
  { id: 'zags', name: 'FHDYo (ZAGS)', services: [
    { name: 'Nikohni roʻyxatdan oʻtkazish', docs: ['Ikkala tomon pasporti', 'Tibbiy koʻrik xulosasi', 'Davlat boji'], days: 'Ariza bergandan 1 oy keyin' },
    { name: 'Tugʻilganlik guvohnomasi', docs: ['Ota-ona pasporti', 'Tugʻruqxona maʼlumotnomasi'], days: 'Shu kuni' }] },
  { id: 'clinic', name: 'Oilaviy poliklinika', services: [
    { name: 'Shifokorga yozilish', docs: ['Pasport yoki ID', 'Tibbiy sugʻurta (boʻlsa)'], days: 'Onlayn yoki registraturada' },
    { name: 'Eshitish apparati uchun yoʻllanma', docs: ['Pasport', 'LOR shifokor xulosasi', 'Audiogramma'], days: '2–4 hafta' }] },
];

/* ---------- video messages (M5) ---------- */
const PEOPLE = ['Onam', 'Akam Jamshid', 'Nodira (ishxona)', 'Karlar toʻgaragi', 'Sardor', 'Opam Dildora', 'Mahalla raisi', 'Doʻstim Bekzod', 'Kursdoshlar', 'Shifokor yordamchisi', 'Murod aka', 'Gulchehra', 'Oila guruhi', 'Ustoz Ra’no', 'Tarjimon Dilnoza R.', 'Qoʻshni Zuhra opa', 'Futbol jamoasi', 'Xolam', 'Elyor', 'Sevinch'];
export function threads(now) {
  return PEOPLE.map((p, i) => {
    const n = 2 + (i % 5);
    const msgs = Array.from({ length: n }, (_, k) => ({ mine: (k + i) % 2 === 1, sec: 6 + Math.round(r() * 40), at: new Date(now.getTime() - (i * 95 + (n - k) * 23) * 60000), seen: k < n - 1 || i > 3, kind: k % 3 === 2 ? 'text' : 'video',
      text: k % 3 === 2 ? pick(['Tushundim, rahmat!', 'Ertaga koʻrishamiz', 'Videoni yana yuboring, sekinroq', 'Ha, boraman', 'Juda yaxshi!', 'Soat nechada?']) : '', variant: (i + k) % 6 }));
    return { id: 't' + i, name: p, unread: i < 4 ? 1 + (i % 3) : 0, group: /guruh|toʻgarak|jamoa|Kursdosh/.test(p), msgs };
  });
}

/* ---------- AAC (M6) ---------- */
export const aac = {
  Asosiy: ['Men', 'Sen', 'Xohlayman', 'Kerak emas', 'Ha', 'Yoʻq', 'Yordam bering', 'Rahmat', 'Kuting', 'Tushunmadim', 'Yana', 'Tugadi'],
  Ovqat: ['Suv', 'Choy', 'Non', 'Osh', 'Sut', 'Olma', 'Shoʻrva', 'Ochman', 'Toʻydim', 'Shirinlik', 'Achchiq', 'Issiq'],
  Tuygʻu: ['Xursandman', 'Xafaman', 'Charchadim', 'Qoʻrqyapman', 'Ogʻriyapti', 'Zerikdim', 'Sovqotdim', 'Issiq', 'Tinch', 'Asabiy', 'Uyqum keldi', 'Yaxshi'],
  Shifoxona: ['Bosh', 'Tish', 'Qorin', 'Yurak', 'Dori', 'Shifokor', 'Hamshira', 'Ukol', 'Isitma', 'Yoʻtal', 'Bosh aylanyapti', 'Allergiya'],
  Joylar: ['Uy', 'Maktab', 'Doʻkon', 'Hojatxona', 'Avtobus', 'Taksi', 'Bogʻ', 'Masjid', 'Bozor', 'Ishxona', 'Mahalla', 'Shifoxona'],
};

/* ---------- learning (M7) ---------- */
export const lessons = ['Salomlashish', 'Oila aʼzolari', 'Sonlar 1–10', 'Ranglar', 'Ovqat va ichimlik', 'His-tuygʻular', 'Kundalik buyruqlar', 'Uy va xonalar', 'Kiyimlar', 'Hayvonlar',
  'Vaqt va kunlar', 'Ob-havo', 'Oʻyinlar', 'Maktab', 'Xavfsizlik', 'Tana aʼzolari', 'Sonlar 11–100', 'Daktil: lotin alifbosi', 'Daktil: kirill alifbosi', 'Bayramlar']
  .map((t, i) => ({ id: 'l' + (i + 1), n: i + 1, title: t, minutes: 4 + (i % 3), signs: 6 + (i % 4), done: i < 7 ? 1 : i === 7 ? 0.6 : i === 8 ? 0.2 : 0, teacher: ['Kamola K.', 'Rustam O.', 'Zarina Y.'][i % 3] }));

/* ---------- dictionary (M8) ---------- */
const WORDS = [
  ['salom', 'Salomlashish'], ['rahmat', 'Salomlashish'], ['xayr', 'Salomlashish'], ['kechirasiz', 'Salomlashish'], ['iltimos', 'Salomlashish'],
  ['ona', 'Oila'], ['ota', 'Oila'], ['aka', 'Oila'], ['opa', 'Oila'], ['bola', 'Oila'], ['buvi', 'Oila'], ['bobo', 'Oila'], ['oila', 'Oila'],
  ['shifokor', 'Tibbiyot'], ['dori', 'Tibbiyot'], ['ogʻriq', 'Tibbiyot'], ['shifoxona', 'Tibbiyot'], ['isitma', 'Tibbiyot'], ['tish', 'Tibbiyot'], ['qon', 'Tibbiyot'], ['allergiya', 'Tibbiyot'],
  ['pul', 'Bank'], ['karta', 'Bank'], ['bank', 'Bank'], ['hisob', 'Bank'], ['kredit', 'Bank'], ['toʻlov', 'Bank'],
  ['suv', 'Ovqat'], ['non', 'Ovqat'], ['choy', 'Ovqat'], ['osh', 'Ovqat'], ['olma', 'Ovqat'], ['sut', 'Ovqat'],
  ['uy', 'Joylar'], ['maktab', 'Joylar'], ['ishxona', 'Joylar'], ['mahalla', 'Joylar'], ['bozor', 'Joylar'], ['masjid', 'Joylar'],
  ['bir', 'Sonlar'], ['ikki', 'Sonlar'], ['uch', 'Sonlar'], ['toʻrt', 'Sonlar'], ['besh', 'Sonlar'], ['oʻn', 'Sonlar'],
  ['bugun', 'Vaqt'], ['ertaga', 'Vaqt'], ['kecha', 'Vaqt'], ['hafta', 'Vaqt'], ['soat', 'Vaqt'], ['yil', 'Vaqt'],
  ['xursand', 'Tuygʻular'], ['xafa', 'Tuygʻular'], ['qoʻrqinch', 'Tuygʻular'], ['charchoq', 'Tuygʻular'], ['sevgi', 'Tuygʻular'],
  ['yordam', 'Muhim'], ['xavf', 'Muhim'], ['politsiya', 'Muhim'], ['tez yordam', 'Muhim'], ['yongʻin', 'Muhim'], ['tarjimon', 'Muhim'], ['kar', 'Muhim'],
];
export const dictionary = WORDS.map(([w, topic], i) => ({
  id: 'd' + i, word: w, topic, ru: ['привет', 'спасибо', 'пока', 'извините', 'пожалуйста'][i] || '',
  variants: i % 7 === 0 ? 2 : 1, region: i % 7 === 0 ? 'Toshkent / Samarqand varianti' : 'Umumiy', dactyl: i % 9 === 0 ? 'Daktil bilan ham koʻrsatiladi' : '',
  verified: i % 11 !== 5, variant: i % 6, hand: i % 2 ? 'Bir qoʻl' : 'Ikki qoʻl',
}));

/* ---------- organisations directory (M9) ---------- */
const ORG = [
  ['Ishonch banki (namuna)', 'Bank'], ['Yashil vodiy banki (namuna)', 'Bank'], ['Kumush bank (namuna)', 'Bank'], ['Shahar 7-oilaviy poliklinikasi', 'Tibbiyot'],
  ['Bolalar koʻp tarmoqli markazi (namuna)', 'Tibbiyot'], ['Yunusobod DXM filiali', 'Davlat xizmati'], ['Chilonzor DXM filiali', 'Davlat xizmati'], ['Mirobod tuman hokimligi qabulxonasi', 'Davlat xizmati'],
  ['Shahar pensiya boʻlimi (namuna)', 'Davlat xizmati'], ['Mobil aloqa operatori A (namuna)', 'Aloqa'], ['Mobil aloqa operatori B (namuna)', 'Aloqa'], ['Internet provayder (namuna)', 'Aloqa'],
  ['Karlar kutubxonasi (namuna)', 'Taʼlim'], ['Imo-ishora kurslari markazi (namuna)', 'Taʼlim'], ['Inklyuziv kollej (namuna)', 'Taʼlim'], ['Toshkent metro maʼlumot xizmati (namuna)', 'Transport'],
  ['Shaharlararo avtovokzal (namuna)', 'Transport'], ['Temir yoʻl kassasi (namuna)', 'Transport'], ['Kar tikuvchilar ustaxonasi', 'Kar tadbirkorlar'], ['Sukut qahvaxonasi', 'Kar tadbirkorlar'],
  ['Qoʻl ustasi: mebel taʼmiri', 'Kar tadbirkorlar'], ['Imo dizayn studiyasi', 'Kar tadbirkorlar'], ['Kommunal xizmat markazi (namuna)', 'Davlat xizmati'], ['Sugʻurta kompaniyasi (namuna)', 'Bank'],
];
export const orgs = ORG.map(([name, type], i) => ({ id: 'o' + i, name: type === 'Kar tadbirkorlar' || name.includes('(namuna)') ? name : name + ' (namuna)', type, district: ['Yunusobod', 'Chilonzor', 'Mirobod', 'Yakkasaroy', 'Shayxontohur', 'Olmazor'][i % 6] + ' tumani',
  hours: i % 5 === 4 ? '10:00–16:00' : '09:00–18:00', open: i % 5 === 4 ? 10 : 9, close: i % 5 === 4 ? 16 : 18, paid: type !== 'Kar tadbirkorlar', via: i % 3 === 0 ? 'Tashkilot toʻlaydi' : 'Hamkor tarjimon', partner: i % 4 !== 3 }));

/* ---------- funder statistics (M18) ---------- */
export function monthly(now) {
  const out = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const grow = 1 + (11 - i) * 0.14;
    out.push({ d, calls: Math.round((120 + r() * 60) * grow), minutes: Math.round((1700 + r() * 600) * grow), wait: +(6.5 - (11 - i) * 0.38 + r() * 0.8).toFixed(1), users: Math.round((80 + r() * 30) * grow) });
  }
  return out;
}
export const regionStats = REGIONS.map((name, i) => ({ name, calls: Math.round(1600 / (1 + i * 0.55) + r() * 40), wait: +(2.8 + i * 0.35 + r()).toFixed(1), users: Math.round(700 / (1 + i * 0.5)) }));
export const topicStats = TOPICS.map((t, i) => [t, Math.round(900 / (1 + i * 0.45))]);
