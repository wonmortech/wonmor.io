/* avtomatik: tools/i18n.mjs build (en); manba blueprints.js */
(function () {
  var T = function (x, y, t, cls, a) {
    return '<text class="' + (cls || 'bp-t') + '" x="' + x + '" y="' + y + '"' + (a ? ' text-anchor="' + a + '"' : '') + '>' + t + '</text>';
  };
  var B = function (x, y, w, h, t, s) {
    var cx = x + w / 2, cy = y + h / 2;
    return '<rect class="bp-fill" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3"/>' +
      T(cx, s ? cy - 2 : cy + 4, t, 'bp-t', 'middle') + (s ? T(cx, cy + 12, s, 'bp-ts', 'middle') : '');
  };
  var L = function (d, cls) { return '<path class="' + (cls || 'bp-l') + '" d="' + d + '"/>'; };
  var F = function (d, c) { return L(d, 'bp-thin') + '<path class="bp-flow bp-' + c + '" d="' + d + '"/>'; };
  var C = function (n, x, y) {
    return '<g class="bp-c" data-n="' + n + '" transform="translate(' + x + ' ' + y + ')"><circle r="11"/><text>' + n + '</text></g>';
  };
  var LG = function (items) {
    var x = 790, out = '';
    for (var i = items.length - 1; i >= 0; i--) {
      var w = items[i][1].length * 7.6 + 40;
      x -= w;
      out += '<path class="bp-flow bp-' + items[i][0] + '" d="M' + x + ' 466 h22"/>' + T(x + 28, 470, items[i][1], 'bp-ts');
    }
    return out;
  };
  var svg = function (name, body) {
    return '<svg viewBox="0 0 800 480" role="img" aria-label="' + name + '">' + body + '</svg>';
  };

  var filtr = svg('Pump and filtration schematic',
    L('M14 120 H30 V335 H330 V120 H350', 'bp-l') +
    '<rect class="bp-water" x="31" y="142" width="298" height="192"/>' +
    L('M31 142 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t10 0', 'bp-thin') +
    T(180, 250, 'POOL', 'bp-ts', 'middle') +
    '<rect class="bp-fill" x="318" y="140" width="20" height="22"/>' +
    '<rect class="bp-fill" x="165" y="330" width="30" height="8"/>' +
    '<rect class="bp-fill" x="24" y="222" width="10" height="16"/>' +
    '<circle class="bp-fill" cx="36" cy="290" r="7"/>' + L('M46 284 l12 -6 M47 290 h14 M46 296 l12 6', 'bp-thin') +
    F('M338 150 H372 V395 H400', 'cold') +
    F('M180 338 V395 H372', 'cold') +
    B(400, 370, 62, 50, 'Pump', 'pre-filter') +
    F('M462 395 H486 V268 H506', 'cold') +
    '<path class="bp-fill" d="M506 420 V270 a32 26 0 0 1 64 0 V420 Z"/>' + L('M512 360 H564', 'bp-thin bp-dash') +
    T(538, 330, 'Sand', 'bp-t', 'middle') + T(538, 344, 'filter', 'bp-t', 'middle') +
    F('M570 400 H612', 'cold') +
    B(612, 372, 96, 46, 'Heat', 'exchanger') +
    F('M650 330 V372', 'hot') + F('M676 372 V330', 'cold') + T(663, 322, 'from boiler', 'bp-ts', 'middle') +
    B(612, 232, 96, 46, 'Dosing', 'pH · chlorine') +
    F('M708 255 H760', 'el') +
    F('M708 395 H760 V80 H18 V230 H26', 'hot') +
    F('M538 420 V452 H420', 'waste') + T(414, 456, 'backwash water to sewer', 'bp-ts', 'end') +
    C(1, 352, 175) + C(2, 212, 352) + C(3, 431, 352) + C(4, 538, 238) + C(5, 660, 440) + C(6, 660, 212) + C(7, 52, 214) + C(8, 72, 312) +
    LG([['cold', 'filtrga'], ['hot', 'qaytish'], ['el', 'dozalash'], ['waste', 'drenaj']])
  );

  var isitish = svg('Heating schematic',
    B(40, 180, 100, 120, 'Boiler or', 'heat pump') +
    L('M220 110 H520', 'bp-l') + L('M220 136 H470', 'bp-l') + T(226, 102, 'MANIFOLD', 'bp-ts') +
    F('M140 205 H180 V110 H220', 'hot') +
    F('M220 136 H196 V275 H140', 'cold') +
    '<rect class="bp-fill" x="240" y="300" width="220" height="32" rx="2"/>' + T(350, 320, 'Göbek taşı: marble platform', 'bp-t', 'middle') +
    F('M260 110 V352 H300 V402 H340 V352 H380 V402 H420 V352 H446 V136', 'hot') +
    T(350, 422, 'underfloor heating loops', 'bp-ts', 'middle') +
    F('M500 110 V180', 'hot') +
    B(472, 180, 96, 60, 'Heat', 'exchanger') +
    F('M520 240 V262 H470 V136', 'cold') +
    F('M568 198 H606', 'cold') + F('M606 222 H568', 'hot') + T(612, 214, 'pool loop', 'bp-ts') +
    F('M520 110 H690 V148', 'hot') +
    '<rect class="bp-fill" x="650" y="148" width="80" height="150" rx="34"/>' +
    L('M668 180 q22 10 44 0 M668 200 q22 10 44 0 M668 220 q22 10 44 0 M668 240 q22 10 44 0', 'bp-thin') +
    T(690, 272, 'Water heater', 'bp-t', 'middle') +
    F('M670 298 V444 H170 V275 H140', 'cold') +
    F('M730 166 H786', 'hot') + T(786, 158, 'to kurna', 'bp-ts', 'end') +
    '<circle class="bp-fill" cx="90" cy="400" r="16"/>' + T(90, 404, 't°', 'bp-t', 'middle') + L('M90 384 V300', 'bp-thin bp-dash') +
    C(1, 90, 160) + C(2, 360, 88) + C(3, 236, 380) + C(4, 350, 284) + C(5, 520, 160) + C(6, 690, 124) + C(7, 124, 410) +
    LG([['hot', 'hot flow'], ['cold', 'qaytish']])
  );

  var loads = [
    [200, 'Pump', 'filtratsiya'], [300, 'Sauna heater', '3-phase'], [400, 'Steam generator', 'hammom'],
    [500, 'LED lighting', '12 V'], [600, 'Ventilation', 'suction'], [700, 'Controls', 'datchiklar']
  ];
  var el = '';
  loads.forEach(function (l, i) {
    var x = l[0] + 40;
    el += F('M' + x + ' 170 V196', 'el') +
      L('M' + (x - 6) + ' 196 L' + (x + 6) + ' 212', 'bp-l') + L('M' + x + ' 212 V232', 'bp-l') +
      '<rect class="bp-fill" x="' + (x - 26) + '" y="232" width="52" height="26" rx="2"/>' + T(x, 249, 'RCD', 'bp-ts', 'middle') +
      F('M' + x + ' 258 V' + (i === 3 ? 278 : 300), 'el') +
      (i === 3 ? '<circle class="bp-fill" cx="' + (x - 6) + '" cy="289" r="10"/><circle class="bp-fill" cx="' + (x + 6) + '" cy="289" r="10"/>' + L('M' + x + ' 300 V300') : '') +
      B(l[0] - 5, 300, 90, 56, l[1], l[2]) +
      L('M' + x + ' 356 V420', 'bp-thin bp-dash');
  });
  var elektr = svg('Single-line power diagram',
    '<rect class="bp-thin bp-dash" x="182" y="34" width="604" height="244" rx="4"/>' + T(778, 52, 'DISTRIBUTION BOARD', 'bp-ts', 'end') +
    F('M14 85 H60', 'el') + T(14, 74, '380 V', 'bp-ts') +
    B(60, 60, 80, 50, 'Meter') +
    F('M140 85 H200', 'el') +
    B(200, 60, 100, 50, 'Main breaker') +
    F('M250 110 V170', 'el') +
    '<path d="M220 170 H760" stroke="rgba(241,211,107,.9)" stroke-width="4" fill="none"/>' + T(764, 174, 'bus bar', 'bp-ts') +
    el +
    L('M220 420 H760', 'bp-l') + L('M196 420 H220 M200 430 h16 M204 438 h8', 'bp-l') + T(490, 440, 'equipotential bonding bar', 'bp-ts', 'middle') +
    C(1, 100, 42) + C(2, 314, 66) + C(3, 198, 245) + C(4, 198, 300) + C(5, 314, 380) + C(6, 414, 380) + C(7, 576, 284) + C(8, 614, 380) + C(9, 760, 400) +
    LG([['el', 'power circuit']])
  );

  var santexnika = svg('Plumbing and drainage schematic',
    F('M14 100 H60', 'cold') + T(14, 88, 'SUPPLY', 'bp-ts') +
    B(60, 80, 64, 40, 'Filter') +
    F('M124 100 H142', 'cold') +
    B(142, 80, 84, 40, 'Meter') +
    F('M226 100 H770', 'cold') +
    F('M272 100 V150', 'cold') +
    '<rect class="bp-fill" x="238" y="150" width="70" height="110" rx="30"/>' + T(273, 202, 'Water', 'bp-t', 'middle') + T(273, 216, 'heater', 'bp-t', 'middle') +
    F('M308 168 H340 V70 H770', 'hot') +
    [420, 560].map(function (x) {
      return F('M' + (x - 8) + ' 70 V184', 'hot') + F('M' + (x + 8) + ' 100 V184', 'cold') +
        '<rect class="bp-fill" x="' + (x - 14) + '" y="184" width="28" height="14" rx="3"/>' +
        L('M' + (x + 12) + ' 198 v6', 'bp-l') +
        '<path class="bp-fill" d="M' + (x - 34) + ' 212 h68 v6 a34 30 0 0 1 -68 0 Z"/>' + T(x, 268, 'Kurna', 'bp-ts', 'middle');
    }).join('') +
    F('M692 70 V150', 'hot') + F('M708 100 V150', 'cold') +
    '<rect class="bp-fill" x="686" y="150" width="28" height="14" rx="3"/>' + L('M700 164 V180 H730', 'bp-l') +
    '<path class="bp-fill" d="M722 176 h22 l-4 8 h-14 Z"/>' + L('M726 190 l-4 16 M733 190 v18 M740 190 l4 16', 'bp-thin bp-dash') + T(733, 226, 'Shower', 'bp-ts', 'middle') +
    L('M350 296 L726 316', 'bp-l') + L('M350 304 L726 324', 'bp-thin') + T(540, 296, 'floor fall 1.5–2%', 'bp-ts', 'middle') +
    '<rect class="bp-fill" x="726" y="312" width="28" height="16" rx="2"/>' + L('M730 316 h20 M730 320 h20 M730 324 h20', 'bp-thin') +
    F('M740 328 V420 H20', 'waste') +
    B(398, 404, 70, 32, 'Non-return', 'valve') +
    T(20, 412, 'SEWER', 'bp-ts') +
    C(1, 92, 62) + C(2, 184, 62) + C(3, 324, 248) + C(4, 610, 52) + C(5, 452, 188) + C(6, 762, 176) + C(7, 600, 330) + C(8, 772, 320) + C(9, 433, 456) +
    LG([['cold', 'sovuq'], ['hot', 'issiq'], ['waste', 'oqova']])
  );

  var bug = svg('Steam and ventilation schematic',
    L('M160 400 V222 M560 400 V222 M140 400 H580', 'bp-l') +
    L('M160 222 A200 132 0 0 1 560 222', 'bp-l') + L('M174 222 A186 120 0 0 1 546 222', 'bp-thin') +
    [[300, 150], [360, 128], [420, 150], [330, 180], [390, 180]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="rgba(241,211,107,.8)"/>'; }).join('') +
    '<rect class="bp-fill" x="280" y="368" width="160" height="32" rx="2"/>' + T(360, 389, 'Göbek taşı', 'bp-t', 'middle') +
    L('M220 330 q20 -16 40 0 t40 0 M300 290 q20 -16 40 0 t40 0 t40 0 M250 250 q20 -16 40 0 t40 0 t40 0 t40 0', 'bp-thin bp-dash') +
    T(360, 230, 'HAMMAM', 'bp-ts', 'middle') +
    B(40, 300, 90, 70, 'Steam', 'generator') +
    F('M130 335 H160 V360 H182', 'air') +
    '<path class="bp-fill" d="M182 352 h12 l6 8 l-6 8 h-12 Z"/>' +
    F('M85 370 V440 H20', 'waste') + T(26, 456, 'condensate', 'bp-ts') +
    F('M360 400 V440 H140', 'waste') +
    F('M360 92 V50 H574', 'air') +
    '<circle class="bp-fill" cx="590" cy="50" r="16"/>' + L('M580 44 L600 56 M580 56 L600 44', 'bp-thin') +
    F('M606 50 H680', 'air') +
    '<rect class="bp-fill" x="680" y="20" width="70" height="70" rx="3"/>' + L('M680 20 L750 90 M750 20 L680 90', 'bp-thin') +
    F('M750 40 H792', 'air') + T(792, 14, 'exhaust', 'bp-ts', 'end') +
    F('M792 76 H750', 'cold') + T(790, 100, 'fresh air', 'bp-ts', 'end') +
    F('M715 90 V370 H560', 'cold') +
    '<rect class="bp-fill" x="556" y="362" width="8" height="18"/>' +
    B(600, 400, 180, 44, 'Pool hall', 'dehumidifier') +
    C(1, 85, 284) + C(2, 210, 340) + C(3, 60, 424) + C(4, 586, 352) + C(5, 380, 72) + C(6, 590, 82) + C(7, 770, 120) + C(8, 690, 386) +
    LG([['air', 'steam / exhaust'], ['cold', 'fresh air'], ['waste', 'drenaj']])
  );

  var kimyo = svg('Water chemistry and dosing schematic',
    F('M14 330 H786', 'cold') + T(14, 318, 'FROM FILTER', 'bp-ts') + T(786, 318, 'TO POOL', 'bp-ts', 'end') +
    B(150, 306, 110, 48, 'Heat', 'exchanger') +
    '<rect class="bp-fill" x="320" y="318" width="150" height="24" rx="12"/>' + L('M334 330 H456', 'bp-thin bp-dash') + T(395, 300, 'UV lamp', 'bp-t', 'middle') +
    F('M90 330 V170 H140', 'cold') + T(96, 250, 'sample', 'bp-ts') +
    B(140, 130, 150, 80, 'Probe chamber', 'pH · Rx · T') +
    F('M290 170 H360', 'el') +
    B(360, 130, 130, 80, 'Dosing', 'controller') +
    F('M490 150 H560', 'el') + F('M490 190 H560 V230 H660', 'el') +
    B(540, 60, 80, 70, 'pH−', 'canister') + B(660, 60, 80, 70, 'Chlorine', 'canister') +
    B(560, 140, 60, 40, 'Pump 1') + B(660, 210, 60, 40, 'Pump 2') +
    L('M580 130 V140 M700 130 V210', 'bp-thin') +
    F('M590 180 V330', 'hot') + F('M690 250 V330', 'hot') +
    '<circle class="bp-fill" cx="590" cy="330" r="7"/><circle class="bp-fill" cx="690" cy="330" r="7"/>' + T(640, 360, 'injection points', 'bp-ts', 'middle') +
    C(1, 214, 120) + C(2, 425, 120) + C(3, 580, 50) + C(4, 700, 50) + C(5, 610, 200) + C(6, 395, 360) + C(7, 205, 370) + C(8, 590, 395) +
    LG([['cold', 'suv'], ['el', 'signal'], ['hot', 'dozalash']])
  );

  var sensorsL = [['pH sensor', 70], ['Chlorine (Rx)', 130], ['Water temperature', 190], ['Water level', 250], ['Hammam humidity', 310], ['Filter pressure', 370]];
  var actsR = [['Pump (VFD)', 70], ['Dosing', 130], ['Heating valve', 190], ['Steam generator', 250], ['Fan', 310], ['Lighting', 370]];
  var avto = svg('Automation schematic',
    sensorsL.map(function (s, i) { return B(24, s[1] - 20, 130, 40, s[0]) + F('M154 ' + s[1] + ' H230 V' + (190 + i * 14) + ' H330', 'cold'); }).join('') +
    B(330, 170, 140, 120, 'Controller', 'PLC · timers') +
    actsR.map(function (s, i) { return F('M470 ' + (190 + i * 14) + ' H560 V' + s[1] + ' H640', 'el') + B(640, s[1] - 20, 140, 40, s[0]); }).join('') +
    B(330, 40, 140, 54, 'Touch panel', 'remote monitoring') + F('M400 94 V170', 'air') +
    B(330, 370, 140, 50, 'Alarm', 'alert · SMS') + F('M400 290 V370', 'hot') +
    C(1, 18, 50) + C(2, 18, 170) + C(3, 18, 350) + C(4, 400, 160) + C(5, 786, 50) + C(6, 786, 170) + C(7, 786, 290) + C(8, 476, 40) + C(9, 476, 370) +
    LG([['cold', 'datchik'], ['el', 'boshqaruv'], ['air', 'aloqa']])
  );

  window.HV_BP = {
    filtr: {
      code: 'HV-01', name: 'Pumps and filtration', svg: filtr,
      notes: [
        { t: 'Skimmer', d: 'Collects leaves, dust and oils from the surface.' },
        { t: 'Main drain', d: 'Draws water from the bottom and keeps it circulating through the basin.' },
        { t: 'Pump and pre-filter', d: 'Drives water through the system; the pre-filter catches coarse debris.' },
        { t: 'Sand filter', d: 'Mayda zarrachalarni tutadi; vaqti-vaqti bilan teskari yuviladi.' },
        { t: 'Heat exchanger', d: 'Transfers boiler heat to the water, holding it at 26–28 °C all year round.' },
        { t: 'Dosing', d: 'Holds pH and chlorine levels automatically, by sensor.' },
        { t: 'Return inlets', d: 'Returns clean, warm water evenly to the basin.' },
        { t: 'Underwater lighting', d: 'LED fixtures run at safe extra-low voltage.' }
      ]
    },
    isitish: {
      code: 'HV-02', name: 'Heating', svg: isitish,
      notes: [
        { t: 'Boiler or heat pump', d: 'A single heat source for the entire complex.' },
        { t: 'Manifold', d: 'Distributes heat across the loops, each one adjusted separately.' },
        { t: 'Underfloor heating', d: 'In the hammam and shower area, the floor is warm underfoot.' },
        { t: 'Göbek taşı heating', d: 'A dedicated loop beneath the central marble platform.' },
        { t: 'Pool heat exchanger', d: 'Pool water never mixes with boiler water.' },
        { t: 'Water heater', d: 'A hot water reserve for the kurna basins and showers.' },
        { t: 'Thermostats and sensors', d: 'Each zone’s temperature is controlled separately.' }
      ]
    },
    elektr: {
      code: 'HV-03', name: 'Electrical', svg: elektr,
      notes: [
        { t: 'Service entry and meter', d: 'Three-phase supply, separately metered.' },
        { t: 'Main breaker and board', d: 'Every circuit in one board, in a dry plant room.' },
        { t: 'RCD 30 mA', d: 'Residual-current protection on every wet-zone circuit.' },
        { t: 'Pump circuit', d: 'Dedicated breaker, timer controlled.' },
        { t: 'Sauna heater', d: 'Dedicated three-phase circuit, heat-resistant cable.' },
        { t: 'Steam generator', d: 'A dedicated, protected circuit for the hammam.' },
        { t: 'LED 12 V', d: 'Safe extra-low voltage via a transformer: under water and in wet zones.' },
        { t: 'Ventilation and controls', d: 'Fan, timer and sensors, all from one panel.' },
        { t: 'Equipotential bonding', d: 'Basin rebar, pipework and metal parts are bonded to a single earth.' }
      ]
    },
    santexnika: {
      code: 'HV-04', name: 'Plumbing and drainage', svg: santexnika,
      notes: [
        { t: 'Inlet filter', d: 'Mains or well water is filtered on the way in.' },
        { t: 'Meter', d: 'The complex’s water use is metered separately.' },
        { t: 'Water heater', d: 'Hot water for the kurna basins and showers.' },
        { t: 'Cold and hot lines', d: 'Yashirin, izolyatsiyalangan quvurlar; har bir nuqtaga alohida.' },
        { t: 'Mixers and kurna basins', d: 'Copper or brass taps, marble kurna basins.' },
        { t: 'Shower', d: 'A cold-to-warm rinse point after the hammam.' },
        { t: 'Floor fall', d: 'No standing water: the floor falls 1.5–2% to the drain.' },
        { t: 'Floor drain', d: 'Floor drain with a water seal and odor trap.' },
        { t: 'Non-return valve', d: 'Sewage never flows back.' }
      ]
    },
    bug: {
      code: 'HV-05', name: 'Steam and ventilation', svg: bug,
      notes: [
        { t: 'Steam generator', d: 'Hammom tashqarisida, texnik xonada; ovozi eshitilmaydi.' },
        { t: 'Steam head', d: 'Low down, away from seating, so the steam spreads evenly.' },
        { t: 'Condensate drain', d: 'Generator and floor water run to the sewer.' },
        { t: 'Fresh air: low', d: 'Fresh air enters at floor level.' },
        { t: 'Exhaust: high', d: 'Humid air is drawn out at the top of the dome, so no mould forms on the walls.' },
        { t: 'Fan', d: 'Moisture resistant, with timer and sensor.' },
        { t: 'Heat-recovery unit', d: 'Heat from the outgoing air is passed to the incoming air.' },
        { t: 'Pool hall dehumidifier', d: 'Draws moisture from the hall air, so the glazing never fogs.' }
      ]
    },
    kimyo: {
      code: 'HV-06', name: 'Water chemistry', svg: kimyo,
      notes: [
        { t: 'Probe chamber', d: 'pH and Rx (ORP) probes measure the water continuously.' },
        { t: 'Dosing controller', d: 'Corrects itself when readings drift out of range, with no manual dosing.' },
        { t: 'pH− canister', d: 'pH within 7.2–7.6: no stinging eyes, and chlorine works effectively.' },
        { t: 'Chlorine canister', d: 'Free chlorine is usually 1–3 mg/l; the exact value depends on the project and local codes.' },
        { t: 'Peristaltic pump 1', d: 'Micro-doses, precise and silent.' },
        { t: 'UV lamp', d: 'Neutralizes microorganisms and reduces chlorine consumption.' },
        { t: 'Heat exchanger', d: 'Chemicals are added after the heater, protecting the metal.' },
        { t: 'Injection points', d: 'On the return line, before the water enters the pool.' }
      ]
    },
    avto: {
      code: 'HV-07', name: 'Automation', svg: avto,
      notes: [
        { t: 'pH and chlorine sensors', d: 'Water quality under continuous control.' },
        { t: 'Temperature and level', d: 'Heating starts if the water cools, top-up starts if the level drops.' },
        { t: 'Humidity and pressure', d: 'Hammam humidity and filter loading are monitored.' },
        { t: 'Controller', d: 'Barcha signallar bitta joyda; taymer va ssenariylar.' },
        { t: 'Pump speed', d: 'Slow at night, full by day: electricity saved.' },
        { t: 'Heating and steam', d: 'The hammam is ready before you arrive.' },
        { t: 'Fans and lighting', d: 'By scene: “hammam”, “pool”, “night”.' },
        { t: 'Touch panel', d: 'Check the status from home or from your phone.' },
        { t: 'Alarm', d: 'Alerts you if water level, pressure or temperature goes wrong.' }
      ]
    }
  };
})();
