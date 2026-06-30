'use strict';

// ================================================================
// DATA  —  4 units × 3 equipment = 12 sensors
// health & risk are computed from sensors; prediction is dynamic
// ================================================================
const unitsData = [
  {
    id: 'turbine', nameEn: 'Turbine', nameAr: 'التوربين', icon: '⚙',
    equipment: [
      {
        id: 'tb1', nameEn: 'Main Bearing',   nameAr: 'المحمل الرئيسي',
        temp: 145, tempRange: [80,  200],
        vib:  1.8, vibRange:  [0.5, 6.0],
        pres: 12.5, presRange: [8,   22],
        confidence: 94, budgetImpact: 28000, budgetNote: 'تكلفة استبدال المحمل'
      },
      {
        id: 'tb2', nameEn: 'Rotor Blades',   nameAr: 'ريش الدوار',
        temp: 182, tempRange: [100, 220],
        vib:  3.2, vibRange:  [0.5, 6.0],
        pres: 18.1, presRange: [8,   22],
        confidence: 88, budgetImpact: 75000, budgetNote: 'تكلفة إصلاح الريش'
      },
      {
        id: 'tb3', nameEn: 'Shaft Seal',     nameAr: 'ختم العمود',
        temp: 98,  tempRange: [60,  150],
        vib:  0.9, vibRange:  [0.2, 4.0],
        pres: 9.8,  presRange: [5,   18],
        confidence: 97, budgetImpact: 12000, budgetNote: 'استبدال الختم'
      }
    ]
  },
  {
    id: 'generator', nameEn: 'Generator', nameAr: 'المولّد', icon: '⚡',
    equipment: [
      {
        id: 'gn1', nameEn: 'Stator Winding', nameAr: 'ملفات الستاتور',
        temp: 118, tempRange: [60,  140],
        vib:  2.1, vibRange:  [0.3, 4.0],
        pres: 3.2,  presRange: [1,   5],
        confidence: 91, budgetImpact: 95000, budgetNote: 'إعادة تغليف الملفات'
      },
      {
        id: 'gn2', nameEn: 'Cooling System', nameAr: 'نظام التبريد',
        temp: 72,  tempRange: [40,  110],
        vib:  0.7, vibRange:  [0.2, 3.0],
        pres: 2.1,  presRange: [0.5, 4],
        confidence: 96, budgetImpact: 18000, budgetNote: 'صيانة دورية للمبرد'
      },
      {
        id: 'gn3', nameEn: 'Exciter',        nameAr: 'المُثير الكهربائي',
        temp: 134, tempRange: [60,  140],
        vib:  3.8, vibRange:  [0.3, 4.0],
        pres: 4.7,  presRange: [1,   5],
        confidence: 98, budgetImpact: 140000, budgetNote: 'استبدال عاجل للمثير'
      }
    ]
  },
  {
    id: 'boiler', nameEn: 'Boiler', nameAr: 'المرجل', icon: '🔥',
    equipment: [
      {
        id: 'bl1', nameEn: 'Heat Exchanger', nameAr: 'المبادل الحراري',
        temp: 485, tempRange: [200, 580],
        vib:  4.2, vibRange:  [1.0, 8.0],
        pres: 195,  presRange: [40,  250],
        confidence: 92, budgetImpact: 62000, budgetNote: 'تنظيف وصيانة المبادل'
      },
      {
        id: 'bl2', nameEn: 'Steam Drum',     nameAr: 'طبل البخار',
        temp: 310, tempRange: [200, 420],
        vib:  1.8, vibRange:  [0.5, 5.0],
        pres: 168,  presRange: [80,  220],
        confidence: 95, budgetImpact: 38000, budgetNote: 'فحص وإحكام الوصلات'
      },
      {
        id: 'bl3', nameEn: 'Feed Pump',      nameAr: 'مضخة التغذية',
        temp: 88,  tempRange: [25,  120],
        vib:  6.8, vibRange:  [0.5, 8.0],
        pres: 238,  presRange: [40,  250],
        confidence: 99, budgetImpact: 210000, budgetNote: 'استبدال عاجل للمضخة'
      }
    ]
  },
  {
    id: 'fuelSystem', nameEn: 'Fuel System', nameAr: 'نظام الوقود', icon: '⛽',
    equipment: [
      {
        id: 'fs1', nameEn: 'Fuel Pump',       nameAr: 'مضخة الوقود',
        temp: 52,  tempRange: [25,  85],
        vib:  1.1, vibRange:  [0.2, 3.0],
        pres: 14.2, presRange: [2,   18],
        confidence: 95, budgetImpact: 22000, budgetNote: 'صيانة دورية للمضخة'
      },
      {
        id: 'fs2', nameEn: 'Filter Assembly', nameAr: 'مجموعة الفلاتر',
        temp: 38,  tempRange: [20,  70],
        vib:  0.6, vibRange:  [0.1, 2.0],
        pres: 11.8, presRange: [2,   15],
        confidence: 89, budgetImpact: 8500, budgetNote: 'تغيير الفلاتر'
      },
      {
        id: 'fs3', nameEn: 'Injection Nozzles', nameAr: 'فوهات الحقن',
        temp: 65,  tempRange: [30,  85],
        vib:  1.4, vibRange:  [0.2, 3.0],
        pres: 16.5, presRange: [5,   18],
        confidence: 91, budgetImpact: 31000, budgetNote: 'تنظيف وضبط الفوهات'
      }
    ]
  }
];

// ================================================================
// STATE
// ================================================================
const openUnits   = new Set();
let selectedUnit  = null;
let selectedEqId  = null;

// ================================================================
// HELPERS
// ================================================================
function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function randDelta(range, factor) {
  return (Math.random() * 2 - 1) * (range[1] - range[0]) * factor;
}

function stressRatio(val, range) {
  return (val - range[0]) / (range[1] - range[0]);
}

function computeHealth(eq) {
  const t = stressRatio(eq.temp, eq.tempRange);
  const v = stressRatio(eq.vib,  eq.vibRange);
  const p = stressRatio(eq.pres, eq.presRange);
  const combined = t * 0.35 + v * 0.45 + p * 0.20;
  return Math.round(clamp(100 - combined * 70, 5, 99));
}

function computeRisk(health) {
  return health >= 75 ? 'low' : health >= 55 ? 'medium' : 'high';
}

function computePrediction(health) {
  if (health >= 85) return Math.round(40 + (health - 85) * 4);
  if (health >= 70) return Math.round(15 + (health - 70) * 1.67);
  if (health >= 55) return Math.round(7  + (health - 55) * 0.53);
  if (health >= 45) return Math.round(3  + (health - 45) * 0.4);
  return Math.max(1, Math.round(health * 0.07));
}

function riskLabel(risk) {
  return { low: 'سليم', medium: 'تحذير', high: 'خطر' }[risk];
}

function riskNote(risk) {
  return {
    low:    'مستوى الخطورة منخفض',
    medium: 'مستوى الخطورة متوسط — يتطلب مراقبة',
    high:   'مستوى الخطورة عالٍ — تدخل عاجل'
  }[risk];
}

function formatVal(v, decimals) { return Number(v).toFixed(decimals); }

function formatBudget(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + ' مليون';
  if (n >= 1000)    return (n / 1000).toFixed(0) + 'K';
  return String(n);
}

function getUnit(id) { return unitsData.find(u => u.id === id); }
function getEq(uid, eid) {
  const u = getUnit(uid);
  return u ? u.equipment.find(e => e.id === eid) : null;
}

function unitTopRisk(unit) {
  const order = { high: 0, medium: 1, low: 2 };
  return unit.equipment.reduce(
    (worst, eq) => order[eq.risk] < order[worst] ? eq.risk : worst,
    'low'
  );
}

// ================================================================
// RENDER — SIDEBAR
// ================================================================
function renderUnits() {
  let html = '';

  unitsData.forEach(unit => {
    const isOpen  = openUnits.has(unit.id);
    const uRisk   = unitTopRisk(unit);

    html += `
      <div class="unit-card ${isOpen ? 'is-open' : ''}">
        <div class="unit-header" data-unit="${unit.id}">
          <span class="unit-icon">${unit.icon}</span>
          <div class="unit-names">
            <div class="unit-name-en">${unit.nameEn}</div>
            <div class="unit-name-ar">${unit.nameAr}</div>
          </div>
          <span class="unit-risk-badge ${uRisk}">${riskLabel(uRisk)}</span>
          <span class="unit-chevron">▾</span>
        </div>
        <div class="eq-list">
          ${unit.equipment.map(eq => {
            const sel = selectedUnit === unit.id && selectedEqId === eq.id;
            return `
              <div class="eq-item ${sel ? 'is-selected' : ''}"
                   id="eq-${eq.id}" data-unit="${unit.id}" data-eq="${eq.id}">
                <span class="eq-dot ${eq.risk}"></span>
                <div class="eq-names">
                  <div class="eq-name-en">${eq.nameEn}</div>
                  <div class="eq-name-ar">${eq.nameAr}</div>
                </div>
                <span class="eq-health">${eq.health}%</span>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  });

  document.getElementById('unitsList').innerHTML = html;
  renderAlertSummary();
}

// ================================================================
// RENDER — ALERT SUMMARY (sidebar footer)
// ================================================================
function renderAlertSummary() {
  let high = 0, med = 0, low = 0;
  unitsData.forEach(u => u.equipment.forEach(eq => {
    if      (eq.risk === 'high')   high++;
    else if (eq.risk === 'medium') med++;
    else                           low++;
  }));

  document.getElementById('alertSummary').innerHTML = `
    <div class="alert-count">
      <span class="alert-dot high"></span>
      <span style="color:var(--red)">${high} خطر</span>
    </div>
    <div class="alert-count">
      <span class="alert-dot medium"></span>
      <span style="color:var(--amber)">${med} تحذير</span>
    </div>
    <div class="alert-count">
      <span class="alert-dot low"></span>
      <span style="color:var(--green)">${low} سليم</span>
    </div>`;
}

// ================================================================
// RENDER — DETAIL PANEL
// ================================================================
function renderDetail(eq) {
  const unit     = unitsData.find(u => u.equipment.includes(eq));
  const predDays = computePrediction(eq.health);
  const predColor =
    predDays <= 7  ? 'var(--red)'   :
    predDays <= 21 ? 'var(--amber)' : 'var(--cyan)';

  const tTrend = eq._dt > 0 ? '<span class="trend-up">▲</span>'   :
                 eq._dt < 0 ? '<span class="trend-down">▼</span>' :
                              '<span class="trend-flat">—</span>';
  const vTrend = eq._dv > 0 ? '<span class="trend-up">▲</span>'   :
                 eq._dv < 0 ? '<span class="trend-down">▼</span>' :
                              '<span class="trend-flat">—</span>';
  const pTrend = eq._dp > 0 ? '<span class="trend-up">▲</span>'   :
                 eq._dp < 0 ? '<span class="trend-down">▼</span>' :
                              '<span class="trend-flat">—</span>';

  const tDec = eq.temp >= 100 ? 0 : 1;
  const pDec = eq.pres >= 100 ? 0 : 1;

  document.getElementById('detailEmpty').style.display   = 'none';
  const content = document.getElementById('detailContent');
  content.style.display = 'flex';

  content.innerHTML = `
    <div class="detail-header">
      <div class="detail-eq-name">${eq.nameEn}</div>
      <div class="detail-eq-ar">${eq.nameAr}</div>
      <div class="detail-unit-path">${unit ? unit.nameEn + ' › ' + unit.nameAr : ''}</div>
    </div>

    <div class="health-block">
      <div class="health-row">
        <span class="health-label">HEALTH INDEX</span>
        <span class="health-value ${eq.risk}">${eq.health}<small style="font-size:13px;font-family:var(--font-body)">%</small></span>
      </div>
      <div class="health-bar-track">
        <div class="health-bar-fill ${eq.risk}" style="width:${eq.health}%"></div>
      </div>
      <div class="risk-row">
        <span class="risk-note">${riskNote(eq.risk)}</span>
        <span class="risk-badge ${eq.risk}">${riskLabel(eq.risk)}</span>
      </div>
    </div>

    <div class="sensor-grid">
      <div class="sensor-card">
        <div class="sensor-label">TEMP</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${formatVal(eq.temp, tDec)}</span>
          <span class="sensor-unit">°C</span>
        </div>
        <div class="sensor-trend">${tTrend}</div>
      </div>
      <div class="sensor-card">
        <div class="sensor-label">VIBRATION</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${formatVal(eq.vib, 2)}</span>
          <span class="sensor-unit">mm/s</span>
        </div>
        <div class="sensor-trend">${vTrend}</div>
      </div>
      <div class="sensor-card">
        <div class="sensor-label">PRESSURE</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${formatVal(eq.pres, pDec)}</span>
          <span class="sensor-unit">bar</span>
        </div>
        <div class="sensor-trend">${pTrend}</div>
      </div>
    </div>

    <div class="pred-block">
      <div class="pred-header">
        <span class="pred-icon">⚠</span>
        <span class="pred-title">AI FAILURE PREDICTION</span>
      </div>
      <div class="pred-days" style="color:${predColor}">${predDays}</div>
      <div class="pred-sub">يوماً حتى الفشل المتوقع</div>
      <div class="pred-conf-row">
        <span>دقة التنبؤ: ${eq.confidence}%</span>
        <div class="pred-conf-bar">
          <div class="pred-conf-fill" style="width:${eq.confidence}%"></div>
        </div>
      </div>
    </div>

    <div class="budget-block">
      <div class="budget-label">BUDGET IMPACT</div>
      <div>
        <span class="budget-val">${formatBudget(eq.budgetImpact)}</span>
        <span class="budget-unit"> SAR</span>
      </div>
      <div class="budget-note">${eq.budgetNote}</div>
    </div>`;
}

// ================================================================
// RENDER — SVG HOTSPOTS
// ================================================================
function updateHotspots() {
  unitsData.forEach(unit => {
    const g = document.getElementById('hs-' + unit.id);
    if (!g) return;
    const risk = unitTopRisk(unit);
    const sel  = selectedUnit === unit.id ? ' hs-selected' : '';
    g.className.baseVal = 'hotspot-group hs-' + risk + sel;
  });
}

// ================================================================
// INTERACTION
// ================================================================
function openUnit(unitId) {
  openUnits.has(unitId) ? openUnits.delete(unitId) : openUnits.add(unitId);
  renderUnits();
}

function selectEquipment(unitId, eqId) {
  selectedUnit = unitId;
  selectedEqId = eqId;
  openUnits.add(unitId);
  renderUnits();
  updateHotspots();
  const eq = getEq(unitId, eqId);
  if (eq) renderDetail(eq);
}

function initEvents() {
  // Sidebar: delegation
  document.getElementById('unitsList').addEventListener('click', e => {
    const eqEl  = e.target.closest('.eq-item');
    const hdrEl = e.target.closest('.unit-header');
    if      (eqEl)  selectEquipment(eqEl.dataset.unit, eqEl.dataset.eq);
    else if (hdrEl) openUnit(hdrEl.dataset.unit);
  });

  // SVG map: delegation
  document.getElementById('plantMap').addEventListener('click', e => {
    const g = e.target.closest('.hotspot-group');
    if (!g) return;
    const unitId = g.dataset.unit;
    const unit   = getUnit(unitId);
    if (unit && unit.equipment.length)
      selectEquipment(unitId, unit.equipment[0].id);
  });

  // Keyboard on hotspots
  document.getElementById('plantMap').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('.hotspot-group');
    if (g) { e.preventDefault(); g.click(); }
  });
}

// ================================================================
// HIGH-RISK ALERT  (CSS only — adds .alert-new class)
// ================================================================
function triggerAlert(eqId) {
  const el = document.getElementById('eq-' + eqId);
  if (!el) return;
  el.classList.remove('alert-new');
  void el.offsetWidth;            // force reflow to restart animation
  el.classList.add('alert-new');
  el.addEventListener('animationend', () => el.classList.remove('alert-new'), { once: true });
}

// ================================================================
// LIVE SIMULATION  — ticks every 4–6 s
// ================================================================
function tickSimulation() {
  const alerts = [];

  unitsData.forEach(unit => {
    unit.equipment.forEach(eq => {
      const prevRisk = eq.risk;

      // Small random drift  ≈ ±1.5-2% of range
      eq._dt = randDelta(eq.tempRange, 0.018);
      eq._dv = randDelta(eq.vibRange,  0.020);
      eq._dp = randDelta(eq.presRange, 0.015);

      eq.temp = clamp(eq.temp + eq._dt, eq.tempRange[0], eq.tempRange[1]);
      eq.vib  = clamp(eq.vib  + eq._dv, eq.vibRange[0],  eq.vibRange[1]);
      eq.pres = clamp(eq.pres + eq._dp, eq.presRange[0], eq.presRange[1]);

      eq.health = computeHealth(eq);
      eq.risk   = computeRisk(eq.health);

      if (eq.risk === 'high' && prevRisk !== 'high') alerts.push(eq.id);
    });
  });

  // Re-render sidebar (preserves open/selected state via module variables)
  renderUnits();
  updateHotspots();

  // Apply alert animations AFTER DOM rebuilt
  alerts.forEach(triggerAlert);

  // Refresh detail panel if selection is active
  if (selectedUnit && selectedEqId) {
    const eq = getEq(selectedUnit, selectedEqId);
    if (eq) renderDetail(eq);
  }

  setTimeout(tickSimulation, 4000 + Math.random() * 2000);
}

// ================================================================
// CLOCK
// ================================================================
function updateClock() {
  const n = new Date();
  const pad = x => String(x).padStart(2, '0');
  const el = document.getElementById('systemTime');
  if (el) el.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}

// ================================================================
// INIT
// ================================================================
function init() {
  // Seed derived fields & delta trackers
  unitsData.forEach(u => u.equipment.forEach(eq => {
    eq._dt = 0; eq._dv = 0; eq._dp = 0;
    eq.health = computeHealth(eq);
    eq.risk   = computeRisk(eq.health);
  }));

  renderUnits();
  updateHotspots();
  initEvents();

  updateClock();
  setInterval(updateClock, 1000);

  // Start simulation after 5 s so user sees initial state first
  setTimeout(tickSimulation, 5000);
}

init();
