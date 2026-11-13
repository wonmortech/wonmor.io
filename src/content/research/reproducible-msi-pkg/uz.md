---
title: "Takrorlanadigan MSI va .pkg yigʻish hamda ichidagi vaqt tuzoqlari"
description: "bitg oʻrnatuvchilarini bitta commitʼdan ikki marta yigʻsak, ikki xil fayl chiqardi. Farqlarni qatlamma-qatlam olib tashladik: kompilyator, linker, WiX, OLE konteyneri va har bir macOS paketi ortidagi xar arxivi. Oxirgi toʻrt baytni tuzatishimizni saqlagan chaqiruvning oʻzi yozayotgan ekan."
date: 2026-11-13
kind: engineering
area: supply-chain
featured: false
source:
  - "https://github.com/dtwinuz/bitg/pull/48"
  - "https://github.com/dtwinuz/bitg/commit/f410210edb7520090b6cebc5456ba7d5571d840d"
  - "dtwinuz/bitg installer/build.ps1, macos/build.sh, tools/xar_normalize.py, linux/build-deb.sh"
  - "https://github.com/dtwinuz/bitg/actions/runs/43315704109"
  - "https://github.com/dtwinuz/bitg/actions/runs/43367788719"
reproduce:
  repo: "https://github.com/dtwinuz/bitg"
  commit: "2de5c94"
  note: "libibus-1.0-dev va dpkg-dev oʻrnatilgan Ubuntuʼda ikkala yigʻish bir xil SHA-256 chiqaradi; oxirgi buyruq chiqarilgan paketning imzolangan kelib chiqishini tekshiradi."
  commands:
    - "git worktree add --detach ../bitg-second HEAD"
    - "linux/build-deb.sh && (cd ../bitg-second && linux/build-deb.sh)"
    - "sha256sum target/deb/*.deb ../bitg-second/target/deb/*.deb"
    - "pwsh installer/build.ps1 -Version 0.3.1   # Windows: run in both worktrees, then compare Get-FileHash dist/*.msi"
    - "gh release download v0.3.1 -R dtwinuz/bitg -p 'bitg_0.3.1_amd64.deb' && gh attestation verify bitg_0.3.1_amd64.deb -R dtwinuz/bitg"
---

bitg — kiritish usuli: Windows uni siz yozadigan har bir dastur ichiga yuklaydigan DLL. Bu katta ishonch talab qiladi, shuning uchun har bitg relizi imzolangan build provenance bilan chiqadi: u har bir faylni qaysi workflow qaysi commitʼdan yigʻganini aytadi. Provenance faylni kim yigʻganini aytadi, lekin bu daʼvoni oʻzingiz tekshirishga imkon bermaydi. Takrorlanadigan yigʻish esa beradi: istalgan odam oʻsha commitʼni yigʻib, xeshlarni solishtira oladi.

Linux uchun `.deb` paketlarimiz v0.3.1 dayoq takrorlanadigan edi. Windows MSI va macOS `.pkg` esa yoʻq: bitta commitʼdan ikki yigʻish ikki xil fayl berardi. Bu maqola nima farq qilgani, qatlamma-qatlam, va yoʻlda duch kelgan tuzoqlar haqida. Ish 2026-yil 13-noyabrda PR #48 bilan qoʻshildi.

## Qanday qidirdik

Usul ataylab zerikarli edi: bitta commitʼning ikkita git worktreeʼsi, har birida bir xil yigʻish skripti, SHA-256 ni solishtirish, farq boʻlsa bir qatlam pastga tushish. Endi buni qoʻriqlaydigan CI tekshiruvlari ham xuddi shunday qiladi: runnerʼda ikkinchi worktree ochadi, yana yigʻadi va xeshlar farq qilsa jobʼni yiqitadi, keyingi farqni topish oson boʻlishi uchun har bir binar xeshini chiqaradi.

```steps
Binarlar :: Avval kompilyatsiya qilingan DLL va dasturlarni bir xil qilish kerak; aks holda ulardan yuqoridagi hech narsa barqaror boʻlmaydi.
Jadvallar :: Oʻrnatuvchi bazasini bir xil qilish: mahsulot kodlari, paket kodi, fayl vaqtlari.
Metamaʼlumot :: Oʻrnatuvchi vositasi joriy vaqt bilan belgilaydigan summary maʼlumotini qotirish.
Konteyner :: Hammasini saqlaydigan fayl formatidagi vaqtlarni tuzatish: MSI uchun OLE, .pkg uchun xar.
Qoʻriqlash :: Har tegishli oʻzgarishda CIʼda ikki marta yigʻish va istalgan farqda yiqilish.
```

Windowsʼda boshlangʻich holat — xeshlari `52E6606B` va `536D7B00` bilan boshlanadigan ikkita MSI.

## Birinchi qatlam: binarlar

Rust binarlari worktreeʼlar orasida uch sababga koʻra farq qilardi. PE sarlavhasida linklash vaqti bor. Debug katalogida PDB GUID va PDB faylining toʻliq yoʻli bor. Panic xabarlari va debug maʼlumot esa manba fayllarning toʻliq yoʻlini saqlaydi, worktree boshqa papkada boʻlsa, ular farq qiladi.

MSVC linker dastlabki ikkitasini `/Brepro` (vaqt belgisini natija xeshi bilan almashtiradi) va `/PDBALTPATH:%_PDB%` (faqat PDB fayl nomini saqlaydi) bilan hal qiladi. Ikkalasi uchala Windows targetʼi uchun `.cargo/config.toml` ga yozildi. Yoʻllarni `--remap-path-prefix` hal qiladi: repozitoriy ildizini `/build/bitg` ga, cargo papkasini `/cargo` ga almashtiradi. Bu toʻliq yoʻllar faqat yigʻish paytida maʼlum boʻlgani uchun `installer/build.ps1` ularni commit qilmasdan, buyruq qatorida `cargo --config` orqali beradi.

Shundan keyin toʻrtala binar, jumladan eski dasturlar uchun chiqaradigan 32-bitli matn xizmati DLLʼi ham bir xil boʻldi. MSIʼlar esa hali ham farq qilardi.

## Ikkinchi qatlam: WiX va mahsulot kodi nimani anglatishi kerak

MSI jadvallarini solishtirish uchta farqni koʻrsatdi: ProductCode, PackageCode va sanalar. WiX boshqacha aytilmasa, har yigʻishda yangi tasodifiy ProductCode va PackageCode yaratadi, kabinetga esa fayllarning oʻzgartirilgan vaqtini yozadi.

Fayl vaqtlari oson edi: yigʻishdan oldin har bir oʻrnatiladigan faylning oʻzgartirilgan vaqti commit vaqtiga (yoki berilgan boʻlsa `SOURCE_DATE_EPOCH` ga) tenglanadi. Mahsulot kodi esa koʻproq oʻylashni talab qildi, chunki u shunchaki raqam emas. Windows Installer u orqali paket yangi mahsulotmi, oʻsha mahsulotmi yoki yangilanishmi, shuni hal qiladi. Doimiy kod takrorlanadigan, lekin notoʻgʻri boʻlardi: oʻsha versiyaning tuzatilgan yigʻishi eskisi bilan bir xil koʻrinardi.

Ikkala kodni nomga asoslangan UUID (5-versiya) sifatida chiqaramiz: nomlar maydoni — oʻrnatuvchining oʻzgarmas UpgradeCodeʼi, nom esa versiya va har bir oʻrnatiladigan fayl hamda WiX manbasining SHA-256 xeshlaridan tuziladi:

```text
seed        = "bitg-x64|<version>|" + sha256(each payload file, Package.wxs) joined by "|"
ProductCode = UUIDv5(UpgradeCode, seed + "|product")
PackageCode = UUIDv5(UpgradeCode, seed + "|package")
```

Kirish bir xil — kodlar bir xil. Oʻsha versiyada qayta yigʻilgan binar yangi kod oladi va yangilanish sifatida oʻrnatiladi, oʻrnatuvchi bunga allaqachon ruxsat beradi. Loyiha fayli endi ProductCodeʼsiz yigʻilmaydi, shuning uchun MSIʼni faqat uni hisoblaydigan skript orqali chiqarish mumkin.

## Uchinchi qatlam: summary oqimi va toʻrt bayt

WiX bu yerda muhim boʻlgan uchta summary-information xossasini yozadi: PackageCode (9-xossa) hamda yaratilgan va oxirgi saqlangan vaqtlar (12 va 13), ularni «hozir» qilib qoʻyadi. `build.ps1` tayyor MSIʼni `WindowsInstaller.Installer` COM obyekti orqali ochadi, shu uch xossani yozadi, summary oqimini saqlaydi va bazani commit qiladi.

Birinchi tuzoq oddiy edi. `Join-Path` qaytargan yoʻl aniq `[string]` ga keltirilmaguncha `OpenDatabase` `DISP_E_TYPEMISMATCH` bilan yiqilardi; ehtimol, PowerShell kech bogʻlanadigan COMʼga oddiy satr emas, oʻralgan obyekt beradi.

Ikkinchi tuzoq qiziqroq edi. Yuqoridagilarning hammasidan keyin ikki MSI aynan toʻrt baytda, 8300-ofsetda farq qildi. MSI — OLE compound fayl, yaʼni fayl ichidagi kichik fayl tizimi, oʻsha ofset esa uning ildiz katalog yozuvining oʻzgartirilgan vaqti edi. Skriptimizdagi hech narsa uni yozmasdi. Uni `Commit` yozardi: bazani saqlash konteynerning ildiz yozuviga joriy vaqtni qoʻyadi. Qolgan barcha vaqtlarni qotiradigan tuzatishning oʻzi yangi vaqt yozayotgan edi.

Shuning uchun COM obyektlari boʻshatilgandan keyin skript faylni toʻgʻridan-toʻgʻri tahrirlaydi. Compound fayl sarlavhasidan katalogning birinchi sektori va sektor oʻlchamini oʻqiydi, ildiz yozuvini topadi, uning nomi haqiqatan `Root Entry` ekanini tekshiradi va commit vaqtini FILETIME sifatida shu yozuv ichidagi 108-ofsetga yozadi. Shundan keyin ikkala worktree ham `13d83566…50ac` berdi. CIʼda uchidan-uchiga workflow MSIʼni Windows runnerʼda ikki marta yigʻdi va ikkala safar ham bir xil xesh oldi (`50d53ccb…37f4`, run 43315704109).

## .pkg: sozlamasi yoʻq arxiv formati

macOSʼda xuddi shu binar ishi oʻz shevasida kerak boʻldi: Rust uchun `--remap-path-prefix`, Swift uchun `-file-prefix-map` (aks holda u `#file` yoʻllarini saqlaydi), statik kutubxonalar aʼzolarida sana boʻlmasligi uchun `ZERO_AR_DATE=1`, linker statik kutubxonaning toʻliq yoʻli va vaqtinchalik obyekt fayllar nomini saqlaydigan debug map yozmasligi uchun `-Xlinker -S`. `pkgbuild` ishga tushishidan oldin paketning tayyorlov papkasidagi har bir fayl, oʻrnatish skriptlari ham, commit vaqtiga tenglanadi.

Arxivning oʻzi tufayli bu yetarli boʻlmadi. `.pkg` — xar arxivi: binar sarlavha, zlib bilan siqilgan XML mundarija (TOC), keyin fayl maʼlumotlari uyumi (heap). `pkgbuild` mundarijaga arxiv yaratilgan vaqtni, ichki fayllarning (Bom, Payload, Scripts, PackageInfo) ctime, mtime va atime qiymatlarini hamda yigʻuvchining foydalanuvchi, guruh, qurilma va inode raqamlarini yozadi. Bularning birortasini boshqarish uchun parametr yoʻq.

`tools/xar_normalize.py` bu maydonlarni keyin qayta yozadi: har bir vaqt tegi commit vaqtiga aylanadi, egalar 0 id bilan `root`/`wheel` boʻladi, qurilma raqamlari 0 ga tushadi, inodeʼlar esa yagona qolishi uchun tartib bilan qayta raqamlanadi. Soʻng mundarijani qayta siqadi va uning nazorat yigʻindisini — uyumning 0-ofsetidagi SHA-1 ni — qayta hisoblaydi. Fayl maʼlumotlari va alohida fayllarning nazorat yigʻindilariga tegilmaydi. Imzolangan arxivda skript ishlashdan bosh tortadi, chunki mundarijani oʻzgartirish imzoni buzadi. Normallashtirgandan keyin yigʻish macOS paketni hali ham oʻqiy olishini tasdiqlash uchun `pkgutil --payload-files` ni ishga tushiradi. Skriptga ishonishdan oldin uni v0.3.1 relizidagi haqiqiy `.pkg` da sinadik: yangi nazorat yigʻindisi toʻgʻri, uyum esa bayt-mayt oʻzgarmagan edi. Keyinroq `main` ga qilingan pushʼda (run 43367788719) macOS jobʼi paketni ikki marta yigʻdi va ikkala safar `ffd25c79…0e0c` oldi.

## Cheklovlar

- **Faqat imzosiz.** Kafolat imzosiz MSI va ad-hoc imzolangan `.pkg` uchun. Authenticode va Developer ID imzolari oʻz vaqt belgilari va sertifikat maʼlumotini qoʻshadi; imzolangan reliz uchun «imzoni olib tashlab, keyin solishtirish» qadami kerak, uni hali yozmaganmiz.
- **Bir mashina, bir xil vositalar.** CI tekshiruvlari bitta runnerʼda ikki marta yigʻadi. Bu vaqt va yoʻllarni ushlaydi, lekin kompilyator versiyalari, SDK yoki runner imageʼlari orasidagi farqni emas. Loyihadan tashqaridagi hech kim hali relizni qayta yigʻib solishtirmagan.
- **Topgan formatlarimizni tuzatdik.** CFB ildiz yozuvi ofseti va xar maydonlari diff ularni koʻrsatgani uchun hal qilingan. WiX, `pkgbuild` yoki linkerning yangi versiyasi biz bilmaydigan maydon qoʻshishi mumkin. CI tekshiruvi buni ushlaydi, lekin oʻzgarishdan keyingina.
- **Bitta yigʻish yoʻli.** MSI endi faqat `build.ps1` orqali yigʻiladi. Bu ataylab, lekin loyiha faylini oʻzi alohida ishlatib boʻlmaydi.

Toʻrt baytdan olgan saboqimiz: vaqtlarni qotirayotganda saqlashning oʻzi nima yozishini tekshiring.
