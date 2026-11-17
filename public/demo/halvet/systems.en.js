/* avtomatik: tools/i18n.mjs build (en); manba systems.js */
(function () {
  'use strict';

  var root = document.querySelector('[data-systems]');
  if (!root) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-system-tab]'));
  var scene = root.querySelector('[data-system-scene]');
  var title = root.querySelector('[data-system-title]');
  var copy = root.querySelector('[data-system-copy]');
  var eyebrow = root.querySelector('[data-system-eyebrow]');
  var metrics = root.querySelector('[data-system-metrics]');
  var steps = root.querySelector('[data-system-steps]');
  var stepNo = root.querySelector('[data-system-step-no]');
  var stepTitle = root.querySelector('[data-system-step-title]');
  var stepCopy = root.querySelector('[data-system-step-copy]');
  var stage = root.querySelector('.hv-sys__stage');
  var active = 'pool';
  var currentStep = 0;
  var timer = null;

  var defs = '' +
    '<defs>' +
      '<linearGradient id="sys-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#35d4df" stop-opacity=".82"/><stop offset="1" stop-color="#087282" stop-opacity=".92"/></linearGradient>' +
      '<linearGradient id="sys-wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8c522c"/><stop offset="1" stop-color="#3c2119"/></linearGradient>' +
      '<linearGradient id="sys-stone" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dfd0b8"/><stop offset="1" stop-color="#8d7b67"/></linearGradient>' +
      '<radialGradient id="sys-heat"><stop stop-color="#ffcf78" stop-opacity=".78"/><stop offset="1" stop-color="#ee5b2b" stop-opacity="0"/></radialGradient>' +
      '<filter id="sys-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<pattern id="sys-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="rgba(109,210,216,.08)" stroke-width="1"/></pattern>' +
    '</defs>';

  var hotspot = function (n, x, y) {
    return '<g class="sys-hot" data-hot="' + n + '" transform="translate(' + x + ' ' + y + ')" role="button" tabindex="0" aria-label="' + n + '-bosqich">' +
      '<circle class="sys-hot__halo" r="24"/><circle class="sys-hot__dot" r="15"/><text y="5">' + n + '</text></g>';
  };

  var frame = function (label, body) {
    return '<svg viewBox="0 0 1080 640" role="img" aria-label="' + label + '">' + defs +
      '<rect width="1080" height="640" fill="#071418"/><rect width="1080" height="640" fill="url(#sys-grid)"/>' +
      '<g class="sys-camera">' + body + '</g></svg>';
  };

  var pool = frame('Three-dimensional section of the pool water circulation system',
    '<g class="sys-pool">' +
      '<path class="sys-shadow" d="M64 400L502 530 804 430 362 302Z"/>' +
      '<path class="sys-shell" d="M72 125L508 244V430L72 311Z"/>' +
      '<path class="sys-shell sys-shell--side" d="M508 244L712 177V360L508 430Z"/>' +
      '<path class="sys-water" d="M92 134L505 247 690 187 280 78Z"/>' +
      '<path class="sys-waterline" d="M92 134L505 247 690 187"/>' +
      '<path class="sys-skimmer" d="M498 255l38-13v30l-38 13z"/><path class="sys-drain" d="M305 318l48 13 30-10-48-13z"/>' +
      '<g class="sys-bubbles"><circle cx="562" cy="278" r="3"/><circle cx="585" cy="272" r="2"/><circle cx="607" cy="264" r="3"/><circle cx="629" cy="257" r="2"/></g>' +
      '<path class="sys-pipe sys-pipe--suction" d="M525 268C600 298 598 436 674 470H738"/>' +
      '<path class="sys-pipe sys-pipe--suction" d="M350 327C442 362 512 450 674 470"/>' +
      '<g class="sys-machine sys-pump" transform="translate(746 438)"><rect x="-20" y="10" width="72" height="48" rx="10"/><circle cx="0" cy="34" r="24"/><path d="M52 22h25v25H52"/></g>' +
      '<path class="sys-pipe sys-pipe--suction" d="M823 470H858V414"/>' +
      '<g class="sys-machine sys-filter" transform="translate(858 310)"><path d="M0 104V30C0-12 92-12 92 30v74z"/><ellipse cx="46" cy="30" rx="46" ry="19"/><path class="sys-sand" d="M8 74q38-18 76 0v29H8z"/></g>' +
      '<path class="sys-pipe sys-pipe--return" d="M950 366H995V298H905"/>' +
      '<g class="sys-machine sys-heat" transform="translate(830 260)"><rect width="78" height="64" rx="8"/><path d="M18 15v34m14-34v34m14-34v34m14-34v34"/></g>' +
      '<path class="sys-pipe sys-pipe--return" d="M830 292H768V220H715"/>' +
      '<g class="sys-machine sys-dose" transform="translate(744 152)"><rect width="84" height="64" rx="8"/><circle cx="25" cy="25" r="10"/><circle cx="58" cy="25" r="10"/><path d="M25 35v18m33-18v18"/></g>' +
      '<path class="sys-pipe sys-pipe--dose" d="M768 216v19"/>' +
      '<path class="sys-pipe sys-pipe--return" d="M715 220C636 212 617 306 550 303"/>' +
      '<path class="sys-return-jet" d="M550 303l-36 10"/><path class="sys-return-jet" d="M584 292l-36 10"/>' +
      '<text class="sys-label" x="118" y="390">BASSEYN KOSASI</text><text class="sys-label" x="737" y="534">TEXNIK XONA</text>' +
      hotspot(1, 518, 233) + hotspot(2, 352, 300) + hotspot(3, 776, 430) + hotspot(4, 906, 295) + hotspot(5, 862, 234) + hotspot(6, 785, 138) + hotspot(7, 596, 280) +
    '</g>'
  );

  var sauna = frame('Section of a Finnish sauna: air, heat and wall layers',
    '<g class="sys-sauna">' +
      '<path class="sys-shadow" d="M155 515L640 600 900 450 418 365Z"/>' +
      '<path class="sys-room sys-room--back" d="M165 110L655 194V474L165 390Z"/>' +
      '<path class="sys-room sys-room--side" d="M655 194L863 74V352L655 474Z"/>' +
      '<g class="sys-boards">' + Array.from({length:12}, function(_,i){ return '<path d="M'+(185+i*38)+' 122v272"/>'; }).join('') + '</g>' +
      '<g class="sys-bench"><path d="M216 318L586 382 586 434 216 370Z"/><path d="M248 257L586 315 586 358 248 301Z"/><path d="M586 315L665 270V313L586 358Z"/></g>' +
      '<g class="sys-heater" transform="translate(684 292)"><ellipse cx="55" cy="15" rx="48" ry="20"/><path d="M7 15v100c0 28 96 28 96 0V15"/><g class="sys-stones"><circle cx="24" cy="8" r="15"/><circle cx="48" cy="1" r="17"/><circle cx="73" cy="7" r="16"/><circle cx="92" cy="15" r="12"/></g><path class="sys-coil" d="M27 35v72m20-77v82m20-82v82m20-77v72"/></g>' +
      '<circle class="sys-heatfield" cx="742" cy="312" r="155"/>' +
      '<path class="sys-air sys-air--hot" d="M748 268C760 195 694 137 596 142C493 148 434 208 406 277"/>' +
      '<path class="sys-air sys-air--hot" d="M740 250C723 174 613 129 511 165"/>' +
      '<path class="sys-air sys-air--fresh" d="M858 194C818 190 796 226 784 273"/>' +
      '<path class="sys-air sys-air--exhaust" d="M391 388C365 430 316 451 262 434"/>' +
      '<g class="sys-sensor" transform="translate(622 143)"><rect width="28" height="38" rx="5"/><circle cx="14" cy="12" r="5"/><path d="M14 17v12"/></g>' +
      '<g class="sys-layers" transform="translate(880 100)"><path class="la la-1" d="M0 0l34-20v250l-34 20z"/><path class="la la-2" d="M46-26l28-16v250l-28 16z"/><path class="la la-3" d="M86-50l25-15v250l-25 15z"/><path class="la la-4" d="M123-72l35-20v250l-35 20z"/><text x="-5" y="286">yog‘och · havo · folga · izolyatsiya</text></g>' +
      '<text class="sys-label" x="193" y="465">QURUQ ISSIQLIK</text>' +
      hotspot(1, 915, 198) + hotspot(2, 742, 296) + hotspot(3, 620, 124) + hotspot(4, 410, 268) + hotspot(5, 876, 166) + hotspot(6, 370, 404) + hotspot(7, 969, 92) +
    '</g>'
  );

  var hammam = frame('Section of a Turkish hammam: steam, condensate, heating and waterproofing',
    '<g class="sys-hammam">' +
      '<path class="sys-shadow" d="M144 502L628 592 907 435 419 347Z"/>' +
      '<path class="sys-ham-shell" d="M198 425V238C198 97 578 116 653 270V484Z"/>' +
      '<path class="sys-ham-inner" d="M220 419V250C220 132 548 143 630 278V463Z"/>' +
      '<path class="sys-membrane" d="M212 421V246C212 119 564 132 642 274V473"/>' +
      '<g class="sys-stars"><circle cx="342" cy="174" r="5"/><circle cx="405" cy="153" r="4"/><circle cx="471" cy="158" r="5"/><circle cx="529" cy="184" r="4"/></g>' +
      '<path class="sys-gobek" d="M294 405L488 439 570 397 378 365Z"/><path class="sys-gobek-top" d="M307 394L486 425 553 391 375 361Z"/>' +
      '<path class="sys-heatloop" d="M336 392c34-16 68 26 101 10s64 23 94 9"/>' +
      '<path class="sys-floor" d="M220 419L630 491 630 531 220 459Z"/><path class="sys-slope" d="M220 419l410 72"/>' +
      '<g class="sys-trap" transform="translate(576 466)"><path d="M0 0l38 7 25-13-38-7z"/><path d="M9-2l38 7m-25-13l38 7"/></g>' +
      '<g class="sys-generator" transform="translate(38 330)"><rect width="118" height="125" rx="12"/><path d="M22 26h74v52H22z"/><circle cx="82" cy="101" r="7"/><text x="59" y="153" text-anchor="middle">BUG‘ GENERATORI</text></g>' +
      '<path class="sys-steamline" d="M156 368H182L214 384"/><path class="sys-steam-head" d="M214 370v28l18-6v-28z"/>' +
      '<g class="sys-steam"><path d="M226 376c-22-42 24-45 4-82s30-50 9-91"/><path d="M254 370c-14-36 28-42 10-73s24-45 9-77"/><path d="M282 366c-12-31 24-38 9-65s22-38 8-67"/></g>' +
      '<path class="sys-air sys-air--exhaust" d="M502 190C602 168 686 183 760 141"/>' +
      '<path class="sys-air sys-air--fresh" d="M770 403C713 407 687 430 645 455"/>' +
      '<g class="sys-dryfan" transform="translate(764 94)"><circle cx="28" cy="28" r="26"/><path d="M28 28c-6-25 17-23 12-7s-12 17-12 7c25-6 23 17 7 12s-17-12-7-12c6 25-17 23-12 7s12-17 12-7c-25 6-23-17-7-12s17 12 7 12z"/></g>' +
      '<g class="sys-drops"><path d="M420 196v47"/><path d="M475 210v39"/><path d="M523 231v31"/></g>' +
      '<text class="sys-label" x="307" y="546">BUG‘ → KONDENSAT → DRENAJ</text>' +
      hotspot(1, 94, 306) + hotspot(2, 225, 350) + hotspot(3, 388, 170) + hotspot(4, 430, 348) + hotspot(5, 596, 442) + hotspot(6, 792, 80) + hotspot(7, 645, 282) +
    '</g>'
  );

  var data = {
    pool: {
      eyebrow: '01 · HYDRAULIC CYCLE',
      title: 'Every liter passes through control',
      copy: 'Water is drawn from the basin, mechanically filtered, heated, chemically balanced and returned evenly under pressure.',
      metrics: [['Q = V ÷ t', 'design flow'], ['1–3 mg/l', 'free chlorine*'], ['7,2–7,6', 'working pH']],
      note: '* Typical working range for a private pool; the final value follows local codes and the project.',
      svg: pool,
      steps: [
        ['Skimmer', 'Surface oils, dust and leaves are drawn into the suction line with the water.'],
        ['Main drain', 'Drawing water from the bottom reduces dead zones; an anti-entrapment grate and calculated velocity are required.'],
        ['Pump + pre-filter', 'The strainer basket catches coarse debris, while the pump builds the pressure needed to overcome the resistance of the whole circuit.'],
        ['Sand filter', 'Water passes down through the filter media. When pressure rises, the flow is reversed to backwash it.'],
        ['Heat exchange', 'The boiler or heat-pump circuit never mixes with pool water; energy passes through the plates.'],
        ['pH and disinfection', 'Probes measure a sample stream. Chemicals are micro-dosed into the return line, after the heater.'],
        ['Return inlets', 'Clean, warm water is directed into the basin; inlet placement eliminates “dead” zones.']
      ]
    },
    sauna: {
      eyebrow: '02 · HEAT + AIR',
      title: 'The heater is only half the system',
      copy: 'A good sauna is a room where the right heater output, safe clearances, a continuous vapor barrier and controlled air exchange all work together.',
      metrics: [['≈1 kW/m³', 'base output'], ['6×/soat', 'air changes'], ['80–100 °C', 'working temperature']],
      note: 'Shisha, beton va boshqa izolyatsiyasiz sirtlar hisobiy hajmni oshiradi; model manuali ustun.',
      svg: sauna,
      steps: [
        ['Fresh air', 'With mechanical ventilation, supply air is introduced above or beside the heater, but must not cool the temperature sensor.'],
        ['Heater and stones', 'Output is sized to the room volume. Air paths are left between the stones, and the elements are protected from the weight of the stones.'],
        ['Temperature sensor', 'A misplaced sensor can let the heater overheat; its position is taken from each model’s manual.'],
        ['Hot air circulation', 'Heater convection carries air upward; the top bench places the bather in an even layer of heat.'],
        ['Exhaust air', 'The exhaust sits low and away from the heater, so air sweeps diagonally across the room.'],
        ['Drying mode', 'After a session, a high drying vent or an open door clears the moisture and extends the life of the timber.'],
        ['The wall “build-up”', 'Thermowood, ventilated cavity, aluminum foil, thermal insulation and framing form one seamless envelope.']
      ]
    },
    hammam: {
      eyebrow: '03 · STEAM + CONDENSATE',
      title: 'Making steam is easy. Controlling it is engineering',
      copy: 'The generator supplies steam; the dome and slopes gather condensate; the vapor barrier protects the structure and the drain protects the room.',
      metrics: [['40–50 °C', 'wet heat'], ['≈100 %', 'relative humidity'], ['1,5–2 %', 'floor fall']],
      note: 'A continuously operated steam room needs a membrane with stricter vapor permeance than a residential steam shower.',
      svg: hammam,
      steps: [
        ['Generator outside', 'Sits in a dry, ventilated, serviceable plant space — never inside the hammam.'],
        ['Steam line', 'The steam line has no valves or water-trapping “pockets”; its fall lets condensate drain back freely.'],
        ['Dome and ceiling', 'A curved or sloped surface carries droplets to the edges instead of dripping them onto bathers.'],
        ['Heated platform', 'Göbek taşı va pol konturlari marmarni iliq tutadi; konturlar alohida balanslanadi.'],
        ['Floor drain', 'Pol 1,5–2 % qiyalik bilan trapga keladi; generator drenaji ham xavfsiz kanalizatsiyaga ulanadi.'],
        ['Ventilation / drying', 'After a session, the humid air is extracted. The air balance is calculated so steam does not reach adjacent rooms.'],
        ['Vapor and water barrier', 'The membrane forms a continuous, sealed envelope across floor, walls, dome, corners and pipe penetrations.']
      ]
    }
  };

  function clearTimer() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function startTimer() {
    clearTimer();
    if (reduce) return;
    timer = window.setInterval(function () {
      var d = data[active];
      selectStep((currentStep + 1) % d.steps.length, false);
    }, 5200);
  }

  function selectStep(index, restart) {
    var d = data[active];
    currentStep = Math.max(0, Math.min(d.steps.length - 1, index));
    var pair = d.steps[currentStep];
    stepNo.textContent = String(currentStep + 1).padStart(2, '0');
    stepTitle.textContent = pair[0];
    stepCopy.textContent = pair[1];
    root.style.setProperty('--sys-step', currentStep);
    Array.prototype.forEach.call(scene.querySelectorAll('[data-hot]'), function (el) {
      var on = Number(el.getAttribute('data-hot')) === currentStep + 1;
      el.classList.toggle('is-on', on);
      el.setAttribute('aria-pressed', String(on));
    });
    Array.prototype.forEach.call(steps.querySelectorAll('button'), function (el, i) {
      var on = i === currentStep;
      el.classList.toggle('is-on', on);
      el.setAttribute('aria-current', on ? 'step' : 'false');
    });
    if (restart !== false) startTimer();
  }

  function bindScene() {
    Array.prototype.forEach.call(scene.querySelectorAll('[data-hot]'), function (el) {
      var activate = function () { selectStep(Number(el.getAttribute('data-hot')) - 1); };
      el.addEventListener('click', activate);
      el.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); activate(); }
      });
    });
  }

  function render(key) {
    active = key;
    currentStep = 0;
    var d = data[key];
    tabs.forEach(function (tab) {
      var on = tab.getAttribute('data-system-tab') === key;
      tab.classList.toggle('is-on', on);
      tab.setAttribute('aria-selected', String(on));
    });
    eyebrow.textContent = d.eyebrow;
    title.textContent = d.title;
    copy.textContent = d.copy;
    scene.innerHTML = d.svg;
    metrics.innerHTML = d.metrics.map(function (m) { return '<div><b>' + m[0] + '</b><span>' + m[1] + '</span></div>'; }).join('') + '<small>' + d.note + '</small>';
    steps.innerHTML = d.steps.map(function (s, i) { return '<li><button type="button"><span>' + String(i + 1).padStart(2, '0') + '</span>' + s[0] + '</button></li>'; }).join('');
    Array.prototype.forEach.call(steps.querySelectorAll('button'), function (button, i) {
      button.addEventListener('click', function () { selectStep(i); });
    });
    bindScene();
    selectStep(0);
    root.classList.remove('is-swapping');
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-system-tab');
      if (key === active) return;
      clearTimer();
      root.classList.add('is-swapping');
      window.setTimeout(function () { render(key); }, reduce ? 0 : 180);
    });
  });

  if (stage && window.matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    stage.addEventListener('pointermove', function (event) {
      var r = stage.getBoundingClientRect();
      root.style.setProperty('--sys-x', (((event.clientX - r.left) / r.width - .5) * 2).toFixed(3));
      root.style.setProperty('--sys-y', (((event.clientY - r.top) / r.height - .5) * 2).toFixed(3));
    }, { passive: true });
    stage.addEventListener('pointerleave', function () {
      root.style.setProperty('--sys-x', '0');
      root.style.setProperty('--sys-y', '0');
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearTimer(); else startTimer();
  });

  render('pool');
})();
