---
title: "Koʻp agentli orkestratsiya amalda"
description: "Bitta orkestrator, uchta tor rol va alohida worktreeʼlar. Sakkiz agent bitta branchʼda sakkiz modul qurganda nima ishladi va yoʻlda qanday nosozlik turlariga duch keldik."
date: 2026-10-26
kind: research
area: agents
featured: false
source:
  - "Agent role definitions in ~/.claude/agents (deep-reasoner, fast-worker, critic), 2026-07"
  - "dtwinuz/dtwin PR #16 (eight modules, merged 2026-10-26) and PR #38 (callback prefix fix, 2026-10-26)"
  - "dtwinuz/med-dtwin issues #57 to #99 (closed as not planned, 2026-11-02)"
  - "Internal engineering notes, 2026-07 to 2026-11"
reproduce:
  note: "Repozitoriylar yopiq; bu buyruqlar istalgan git repozitoriyda xuddi shu ajratish naqshini (har agentga bitta worktree va branch) quradi."
  commands:
    - "git worktree add ../app-habits -b life/habits"
    - "git worktree list"
    - "mkdir -p ~/.claude/agents"
---

Bir vaqtda bir nechta kod yozuvchi agentni ishga tushirish oson, ishni oxiriga yetkazish qiyin. Muammo kamdan-kam hollarda tezlikda boʻladi. Muammo ularning ishi uchrashganda chiqadi: ikki agent bitta faylni tahrirlaydi, bir agentning skripti boshqasinikini ustidan yozib yuboradi yoki qayta ishga tushirilgan agent ikki nusxada ishlaydi. Bu maqolada 2026-yil iyul va noyabr oraligʻida kelgan tartibimiz, sakkiz agent shaxsiy ilovaning sakkiz modulini bitta branchʼda qurgan aniq bir holat va yoʻl-yoʻlakay qayd etgan nosozlik turlarimiz haqida.

## Gala emas, uchta rol

Biz oʻzaro teng agentlarni erkin ishlashga qoʻyib yubormaymiz. Bitta sessiya **orkestrator**. U rejalashtiradi, ishni boʻlaklaydi, eng qiyin fikrlashni oʻzi bajaradi va xavfli kodni oʻzi yozadi. Subagentlar faqat ikki sabab bilan bor: orkestrator kontekstini kichik saqlash va uning fikriga bogʻlanib qolmagan mustaqil qarashni olish. Har rol tool roʻyxati va model sozlamasi yozilgan qisqa Markdown fayl.

| Rol | Model | Toollar | Shartnoma |
|---|---|---|---|
| Chuqur tahlilchi | sessiya modeli bilan bir xil | faqat oʻqish (Read, Grep, Glob, Bash) | **Xulosa**, `file:line` bilan **dalil**, **xavf va nomaʼlumlar**, **rad etilgan variantlar** qaytaradi. Fayl uyumi emas, xulosa. |
| Tez ijrochi | kichik, arzon model | toʻliq tahrirlash toollari | Koʻrsatmani soʻzma-soʻz bajaradi. Biror narsa noaniq boʻlsa yoki oldingi shart bajarilmasa, oʻzicha yaxshilamay, **toʻxtab xabar beradi**. |
| Tanqidchi | sessiya modeli bilan bir xil | faqat oʻqish | Artefaktni rad etishga urinadi. Faqat bloklovchi yoki jiddiy topilmalarni, **koʻpi bilan beshta**, har birini aniq buzilish stsenariysi bilan beradi. Topilma boʻlmasa, shuni ochiq aytadi. |

Ikki dizayn qarori tajribadan kelgan. Birinchidan, chuqur tahlilchi orkestrator bilan bir xil modelda ishlaydi. Odatiy maslahat fikrlashni kuchliroq modelga topshirish, lekin bizda orkestratorning oʻzi eng kuchli model. Topshirishning qiymati qoʻshimcha aql emas, **kontekstni ajratish va mustaqil ikkinchi fikr**. Ikkinchidan, tanqidchining chegaralari uning vazifa taʼrifining bir qismi. Chegarasiz tanqidchi uzun uslub izohlari roʻyxatini beradi va yagona haqiqiy xato shu roʻyxat ichida yoʻqolib ketadi. “Muhim topilma yoʻq” degan javob ham toʻgʻri javob boʻlishi kerak, aks holda tanqidchi nimadir toʻqib chiqaradi.

## Holat: sakkiz agent, bitta branch

2026-yil 26-oktabrda shaxsiy hayotni rejalashtirish ilovasi uchun katta funksiyalar toʻplamini bir yoʻla qurdik. Funksiyalar sakkiz sohaga boʻlindi: odatlar, ibodat, oʻsish, tana, moliya, yaqinlar, ruhiy holat va platforma. Ketma-ketlik:

```steps
Poydevor :: Orkestrator avval umumiy shartnomalarni commit qiladi: interfeyslar, assembly skanlash orqali roʻyxatga olish, modul qoliplari.
Ajratish :: Har agent oʻz git worktree, branch, API va web porti hamda bazasini oladi.
Qurish :: Agentlar yozma shartnoma asosida parallel ishlaydi, migratsiya yaratishga ruxsat yoʻq.
Birlashtirish :: Orkestrator sakkiz branchni birlashtiradi, choklarni tuzatadi va bitta migratsiya yaratadi.
Chiqarish :: Bitta pull request, bitta review, bitta deploy, oldidan baza zaxirasi olinadi.
```

Parallel ishni xavfsiz qilishning katta qismini **poydevor commiti** bajardi. Birorta agent ish boshlashidan oldin orkestrator har modulga kerak boʻladigan kengaytirish nuqtalarini qoʻshdi: bot buyruqlari, matn, media va tugma callbackʼlari uchun interfeyslar; har eslatma oʻtadigan yagona xabarnoma servisi; MCP toollarini assemblyʼni skanlash orqali roʻyxatga olish, shunda yangi tool sinfi markaziy faylni tahrirlashni talab qilmaydi. Har soha uchun modul qolipi ham yaratildi. Shu tayyor boʻlgach, agent boshqa agentga tegishli faylga tegmasdan butun funksiyani qoʻsha oldi.

**Shartnoma** portlar, baza nomlari, ishga tushirish skriptlari va qoidalar yozilgan qisqa umumiy hujjat edi. Bitta qoida hal qiluvchi boʻldi: agentlar baza migratsiyasini yaratmaydi. Sakkiz agentning har biri bitta model snapshotʼiga nisbatan migratsiya yaratsa, birlashtirishda ular toʻqnashardi. Buning oʻrniga orkestrator sakkizta branchni birlashtirdi, bitta integratsiya commiti yozdi va umumiy modeldan yagona migratsiya yaratdi. Natija sarlavhasida sakkiz soha sanalgan bitta pull request sifatida chiqdi va oʻsha kuni merge hamda deploy qilindi.

## Baribir nima sindi

Choklar shartnoma jim qolgan joyda sindi. Bot tugma bosilishini callback maʼlumotidagi qisqa prefiks boʻyicha yoʻnaltiradi. Alohida worktreeʼlarda ishlagan ikki agent ikkalasi ham `md` prefiksini tanladi: biri dori tugmalari uchun, ikkinchisi kayfiyat tugmalari uchun. Har modul oʻz testlaridan oʻtdi. Birga ishlaganda esa bir modul ikkinchisining tugmalarini jimgina yutib yubordi. Tuzatish ham 26-oktabrda chiqdi: bitta prefiks qayta nomlandi va ikki modul bir xil prefiksni roʻyxatga olsa yiqiladigan test qoʻshildi. Umumiy saboq: **har umumiy nomlar maydoniga reyestr va noyoblik testi kerak**. Bu callback prefikslari, route yoʻllari, tool nomlari va sozlama kalitlariga taalluqli. Shartnomadagi bitta gap yetarli emas.

Oʻsha deploydan oldin sakkizta suiteʼni birlashgan kodda toʻliq end-to-end yurgizishni ham oʻtkazib yubordik. Prefiks toʻqnashuvi aynan shunday yugurish ushlaydigan xato turi. Endi birlashgan koddagi integratsiya testlarini ixtiyoriy pardoz emas, merge jarayonining bir qismi deb hisoblaymiz.

## Qayd etgan nosozlik turlarimiz

Bular haqiqiy vaqtimizni olganlari, har biri yonida undan chiqqan qoida.

- **Umumiy qoralama papka.** Bitta sessiyadagi subagentlar bitta qoralama papkani boʻlishadi. Bir agent umumiy nomli yordamchi skriptni import qildi, lekin boshqa agent bu faylni allaqachon oʻz versiyasi bilan almashtirgan edi va u boshqa repozitoriyga qaratilgan edi. Natijada notoʻgʻri repozitoriyda 43 ta dublikat issue ochildi. Ularning hammasi oʻchirilmadi, “not planned” sifatida yopildi, shunda tarix halol qoladi. *Qoida:* har agent loyiha nomidagi ichki papkada ishlaydi, skript nomlarida loyiha prefiksi boʻladi, tashqi tizimga yozadigan har skript manzilni aniq argument sifatida oladi.
- **Arvoh qayta ishga tushirishlar.** Qayta yuklanishdan keyin interfeys bir nechta agent “tugatmadi” deb xabar berdi. Biz ularni qayta ishga tushirdik. Aslida asl sessiya hali tirik edi va endi har agent bitta worktreeʼda ikki nusxada ishlayotgan edi. Agentlardan biri oʻzi qilmagan tahrirlarni sezib, toʻxtab soʻradi. *Qoida:* qayta ishga tushirishdan oldin tirik qoʻshni sessiya va yaqindagi fayl oʻzgarishlarini tekshirish. Har topshiriqda yana shu yoziladi: git oʻzing qilmagan tahrirlarni koʻrsatsa, ularga tegma va xabar ber.
- **Butun tizim boʻylab toʻxtatish buyruqlari.** Agentning “APIʼni toʻxtat” qadami ishlab turgan barcha .NET jarayonlarini, jumladan boshqa agentlarning serverlarini ham oʻldirdi. *Qoida:* jarayonlarni nomi boʻyicha emas, port boʻyicha toʻxtatish.
- **Resurs shiftlari.** Har lokal API taxminan 1–2 GB xotira oldi, shuning uchun bitta ish stantsiyasida bir vaqtda sakkiz API va sakkiz brauzer real emas edi. *Qoida:* bir vaqtda koʻpi bilan bitta API va bitta headless brauzer, navbatni orkestrator belgilaydi.
- **Juda koʻp kichik pull requestʼlar.** Bir repozitoriyda bitta soʻrov bir kunda 12 ta pull request tugʻdirdi. Har biri end-to-end joblari bilan toʻliq CI ishga tushirdi. Cheklangan CI byudjetida bu qimmat. *Qoida:* bitta soʻrov, bitta branch, alohida commitlar, bitta pull request, bitta CI, bitta deploy va kamroq push.

## Endi har topshiriqqa nima yoziladi

Subagent faqat topshiriqda yozilganini biladi, shuning uchun bu qoidalarning aksariyati topshiriqda yashaydi:

1. Maqsad va allaqachon nima istisno qilingani.
2. U egalik qiladigan aniq fayllar, worktree, port va baza hamda nimaga tegmasligi kerakligi.
3. Natija shartnomasi: tahlil uchun xulosa va dalil, ijro uchun aniq oʻzgarishlar roʻyxati va test natijalari.
4. Toʻxtash shartlari: noaniqlik, kutilmagan tahrirlar, bajarilmagan oldingi shart.
5. Tashqi yozuvlar uchun manzil tizim aniq nomlanadi, hech qachon umumiy fayllardan taxmin qilinmaydi.

## Hali nimani bilmaymiz

- Bir xil ishni bitta agent va sakkiz agent bajarganini nazoratli solishtirmaganmiz, shuning uchun tezlanish raqamini keltira olmaymiz.
- Tanqidchining besh topilma chegarasi baholashga asoslangan qaror. U muhim oltinchi topilmani qanchalik tez-tez yashirishini oʻlchamaganmiz.
- Dalillarimiz bitta ish stantsiyasi va bir nechta yopiq repozitoriydan. Masofaviy, sandbox ichidagi runnerʼlarda umumiy holat muammolari boshqacha koʻrinishi mumkin.
