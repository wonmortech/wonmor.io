import type { T } from './config';

export const demoUi = {
  nav: { en: 'Demos', uz: 'Demolar', ru: 'Демо' },
  title: { en: 'Live demos', uz: 'Jonli demolar', ru: 'Живые демо' },
  description: {
    en: 'Every Wonmor product running in your browser on sample data: no sign-up, nothing sent to a server, changes reset on reload.',
    uz: 'Wonmorʼning har bir mahsuloti brauzeringizda namuna maʼlumot bilan ishlaydi: roʻyxatdan oʻtish yoʻq, serverga hech narsa ketmaydi, oʻzgarishlar sahifa yangilanganda tiklanadi.',
    ru: 'Каждый продукт Wonmor работает прямо в браузере на примерных данных: без регистрации, ничего не уходит на сервер, изменения сбрасываются при перезагрузке.',
  },
  hero: { en: 'Every product, running, with sample data.', uz: 'Har bir mahsulot ishlab turibdi, namuna maʼlumot bilan.', ru: 'Каждый продукт работает — на примерных данных.' },
  lede: {
    en: '{n} demos built from the real apps. Each one runs entirely in your browser on invented people, orders and numbers, so you can click through every screen without an account.',
    uz: 'Haqiqiy ilovalardan yigʻilgan {n} ta demo. Har biri toʻliq brauzeringizda, toʻqima odamlar, buyurtmalar va raqamlar bilan ishlaydi — akkauntsiz har bir ekranni bosib koʻrishingiz mumkin.',
    ru: '{n} демо, собранных из настоящих приложений. Каждое работает целиком в браузере на вымышленных людях, заказах и цифрах — можно пройти по всем экранам без аккаунта.',
  },
  facts: [
    { en: 'Invented people and accounts', uz: 'Toʻqima odamlar va akkauntlar', ru: 'Вымышленные люди и аккаунты' },
    { en: 'What you type stays in the browser', uz: 'Kiritganingiz brauzerda qoladi', ru: 'Введённое остаётся в браузере' },
    { en: 'Changes reset on reload', uz: 'Oʻzgarishlar yangilanganda tiklanadi', ru: 'Изменения сбрасываются при перезагрузке' },
  ] as T[],
  openDemo: { en: 'Open demo', uz: 'Demoni ochish', ru: 'Открыть демо' },
  openSite: { en: 'Open live site', uz: 'Jonli saytni ochish', ru: 'Открыть сайт' },
  liveSite: { en: 'Live site', uz: 'Jonli sayt', ru: 'Живой сайт' },
  liveDemo: { en: 'Live demo', uz: 'Jonli demo', ru: 'Живое демо' },
  source: { en: 'Source', uz: 'Manba kod', ru: 'Исходный код' },
  productPage: { en: 'Product page', uz: 'Mahsulot sahifasi', ru: 'Страница продукта' },
  autoSignIn: { en: 'Opens signed in', uz: 'Avtomatik kiradi', ru: 'Вход уже выполнен' },
  signIn: { en: 'Sign in', uz: 'Kirish', ru: 'Вход' },
  thirdParty: {
    en: 'The rest of wonmor.io loads nothing from other sites. Some demos keep what the real app uses: fonts from Google Fonts, and map tiles from OpenFreeMap and OpenStreetMap. Public product content is real, such as mosque locations, the restaurant menu and the OpenStreetMap snapshot in uz-open-data (ODbL); every person, order and account is invented.',
    uz: 'wonmor.io ning qolgan qismi boshqa saytlardan hech narsa yuklamaydi. Baʼzi demolar haqiqiy ilova ishlatadigan narsalarni saqlaydi: Google Fonts shriftlari hamda OpenFreeMap va OpenStreetMap xarita plitkalari. Ommaviy mahsulot kontenti haqiqiy: masjidlar joylashuvi, restoran menyusi va uz-open-data dagi OpenStreetMap nusxasi (ODbL); barcha odamlar, buyurtmalar va akkauntlar toʻqima.',
    ru: 'Остальной wonmor.io ничего не загружает с других сайтов. Некоторые демо сохраняют то, что использует настоящее приложение: шрифты Google Fonts и картографические тайлы OpenFreeMap и OpenStreetMap. Публичный контент продуктов настоящий: расположение мечетей, меню ресторана и снимок OpenStreetMap в uz-open-data (ODbL); все люди, заказы и аккаунты вымышлены.',
  },
} satisfies Record<string, T | T[]>;
