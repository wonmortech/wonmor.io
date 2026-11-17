// Fictional sample content for the component previews. People, organisations and sums are invented;
// dates are relative to the moment the page loads, so the demo never looks stale.
const DAY = 864e5;
const now = Date.now();

const people = [
  'Dilnoza Rahimova', 'Jasur Toʻxtayev', 'Malika Yoʻldosheva', 'Sardor Qodirov', 'Nigora Ismoilova', 'Bekzod Hamroyev',
  'Gulnora Saidova', 'Otabek Mirzayev', 'Zarina Nurmatova', 'Shohruh Abdullayev', 'Madina Karimova', 'Akmal Xoliqov',
  'Feruza Tursunova', 'Ulugʻbek Sobirov', 'Kamola Ergasheva', 'Rustam Jalilov', 'Nodira Fayzullayeva', 'Doniyor Rasulov',
  'Shahnoza Umarova', 'Elyor Normatov', 'Lola Axmedova', 'Temur Gʻaniyev', 'Sevara Qosimova', 'Javohir Yusupov',
  'Mohira Sultonova', 'Farrux Boboyev', 'Dildora Hakimova', 'Aziz Ochilov', 'Munisa Rahmonova', 'Sherzod Valiyev',
];
const orgs = [
  'Mirobod mahalla kutubxonasi', 'Yunusobod yoshlar markazi', 'Chilonzor kitob klubi', 'Shayxontohur hunarmandlar uyushmasi',
  'Yakkasaroy musiqa maktabi', 'Sergeli sport toʻgaragi', 'Olmazor ekologiya guruhi', 'Uchtepa robototexnika toʻgaragi',
  'Bektemir bogʻbonlar jamiyati', 'Yashnobod teatr studiyasi', 'Mirzo Ulugʻbek astronomiya klubi', 'Yangihayot kodlash maktabi',
];
const districts = ['Mirobod', 'Yunusobod', 'Chilonzor', 'Shayxontohur', 'Yakkasaroy', 'Sergeli', 'Olmazor', 'Uchtepa', 'Bektemir', 'Yashnobod', 'Mirzo Ulugʻbek', 'Yangihayot'];
const statuses = ['paid', 'paid', 'pending', 'review', 'paid', 'overdue', 'pending', 'draft', 'paid', 'review'];

export const ROWS = people.map((name, i) => ({
  id: i + 1,
  name,
  org: orgs[(i * 5) % orgs.length],
  district: districts[(i * 5) % districts.length],
  status: statuses[i % statuses.length],
  amount: (1 + ((i * 37) % 23)) * 250000 + (i % 3) * 75000,
  updated: now - ((i * 7) % 61) * DAY - (i % 5) * 36e5,
}));

export const PROJECTS = [
  { kind: 'Open data', title: 'Mahalla xaritasi', text: 'Masjid, maktab va kutubxonalarni bitta ochiq xaritada koʻrsatish.', bg: '--ill-cactus', fg: '--ill-olive', fg2: '--ill-oat', updated: now - 2 * DAY },
  { kind: 'Education', title: 'Kodlash kechasi', text: 'Yangihayotda haftalik bepul dasturlash darslari, 40 oʻrin.', bg: '--ill-heather', fg: '--ill-lapis', fg2: '--ill-sky', updated: now - 6 * DAY },
  { kind: 'Culture', title: 'Kitob bayrami', text: 'Mirobodda uch kunlik kitob almashish bayrami va mualliflar bilan uchrashuv.', bg: '--ill-oat', fg: '--ill-clay', fg2: '--ill-gold', updated: now - 11 * DAY },
  { kind: 'Ecology', title: 'Daraxt ekish', text: 'Olmazor koʻchalarida 1 200 tup koʻchat, har biri xaritada belgilangan.', bg: '--ill-cactus', fg: '--ill-olive', fg2: '--ill-gold', updated: now - 19 * DAY },
  { kind: 'Science', title: 'Osmon kuzatuvi', text: 'Mirzo Ulugʻbek tumanida teleskop bilan ochiq kuzatuv kechalari.', bg: '--ill-lapis', fg: '--ill-gold', fg2: '--ill-heather', updated: now - 27 * DAY },
  { kind: 'Crafts', title: 'Hunarmandlar bozori', text: 'Shayxontohurda 30 ta usta: kulolchilik, zardoʻzlik, yogʻoch oʻymakorligi.', bg: '--ill-coral', fg: '--ill-clay', fg2: '--ill-oat', updated: now - 40 * DAY },
];
