'use strict';

// ================================================================
// DATA  —  4 units × 3 equipment = 12 sensors
// ================================================================
const HIST = 28;   // history points per sensor

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
        id: 'fs1', nameEn: 'Fuel Pump',         nameAr: 'مضخة الوقود',
        temp: 52,  tempRange: [25,  85],
        vib:  1.1, vibRange:  [0.2, 3.0],
        pres: 14.2, presRange: [2,   18],
        confidence: 95, budgetImpact: 22000, budgetNote: 'صيانة دورية للمضخة'
      },
      {
        id: 'fs2', nameEn: 'Filter Assembly',   nameAr: 'مجموعة الفلاتر',
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
const openUnits  = new Set();
let selectedUnit  = null;
let selectedEqId  = null;
let activeTab     = 'diag';   // 'diag' | 'analytics'

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
  return Math.round(clamp(100 - (t * 0.35 + v * 0.45 + p * 0.20) * 70, 5, 99));
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

function riskLabel(r) { return { low: 'سليم', medium: 'تحذير', high: 'خطر' }[r]; }

function riskNote(r) {
  return {
    low:    'مستوى الخطورة منخفض',
    medium: 'مستوى الخطورة متوسط — يتطلب مراقبة',
    high:   'مستوى الخطورة عالٍ — تدخل عاجل'
  }[r];
}

function fmtVal(v, dec)  { return Number(v).toFixed(dec); }
function fmtBudget(n) {
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
  const ord = { high: 0, medium: 1, low: 2 };
  return unit.equipment.reduce(
    (worst, eq) => ord[eq.risk] < ord[worst] ? eq.risk : worst, 'low'
  );
}

// ================================================================
// SPARKLINE SVG
// ================================================================
function sparklineSVG(values, range, color, uid) {
  const W = 300, H = 54;
  const [lo, hi] = range;
  const span = (hi - lo) || 1;
  const n = values.length;

  const pts = values.map((v, i) => {
    const x = (i / (n - 1)) * W;
    const y = H - 4 - ((v - lo) / span) * (H - 10);
    return [+x.toFixed(1), +y.toFixed(1)];
  });

  const ptStr   = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const fillStr = `0,${H} ${ptStr} ${W},${H}`;
  const lastPt  = pts[n - 1];
  const gid     = `sg_${uid}`.replace(/\W/g, '_');

  // Threshold line at 75% stress = risk boundary
  const threshY = H - 4 - (0.75 * span / span) * (H - 10);

  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"
              style="width:100%;height:${H}px;display:block" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity=".22"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="0" y1="${threshY.toFixed(1)}" x2="${W}" y2="${threshY.toFixed(1)}"
          stroke="${color}" stroke-width="0.8" stroke-dasharray="4,3" opacity="0.35"/>
    <polygon points="${fillStr}" fill="url(#${gid})"/>
    <polyline points="${ptStr}" fill="none" stroke="${color}"
              stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="4" fill="${color}" stroke="#fff" stroke-width="1.5"/>
  </svg>`;
}

// ================================================================
// RENDER — SIDEBAR
// ================================================================
function renderUnits() {
  let html = '';
  unitsData.forEach(unit => {
    const isOpen = openUnits.has(unit.id);
    const uRisk  = unitTopRisk(unit);
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
            return `<div class="eq-item ${sel ? 'is-selected' : ''}"
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
// RENDER — ALERT SUMMARY
// ================================================================
function renderAlertSummary() {
  let hi = 0, md = 0, lo = 0;
  unitsData.forEach(u => u.equipment.forEach(eq => {
    if      (eq.risk === 'high')   hi++;
    else if (eq.risk === 'medium') md++;
    else                           lo++;
  }));
  document.getElementById('alertSummary').innerHTML = `
    <div class="alert-count"><span class="alert-dot high"></span>
      <span style="color:var(--red)">${hi} خطر</span></div>
    <div class="alert-count"><span class="alert-dot medium"></span>
      <span style="color:var(--amber)">${md} تحذير</span></div>
    <div class="alert-count"><span class="alert-dot low"></span>
      <span style="color:var(--green)">${lo} سليم</span></div>`;
}

// ================================================================
// RENDER — DETAIL PANEL
// ================================================================
function diagHTML(eq) {
  const tDec = eq.temp >= 100 ? 0 : 1;
  const pDec = eq.pres >= 100 ? 0 : 1;
  const predDays  = computePrediction(eq.health);
  const predColor = predDays <= 7 ? 'var(--red)' : predDays <= 21 ? 'var(--amber)' : 'var(--blue)';

  const arrow = d =>
    d > 0 ? '<span class="trend-up">▲</span>'   :
    d < 0 ? '<span class="trend-down">▼</span>' :
            '<span class="trend-flat">—</span>';

  return `
    <div class="sensor-grid">
      <div class="sensor-card">
        <div class="sensor-label">TEMP</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${fmtVal(eq.temp, tDec)}</span>
          <span class="sensor-unit">°C</span>
        </div>
        <div class="sensor-trend">${arrow(eq._dt)}</div>
      </div>
      <div class="sensor-card">
        <div class="sensor-label">VIBRATION</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${fmtVal(eq.vib, 2)}</span>
          <span class="sensor-unit">mm/s</span>
        </div>
        <div class="sensor-trend">${arrow(eq._dv)}</div>
      </div>
      <div class="sensor-card">
        <div class="sensor-label">PRESSURE</div>
        <div class="sensor-val-row">
          <span class="sensor-val">${fmtVal(eq.pres, pDec)}</span>
          <span class="sensor-unit">bar</span>
        </div>
        <div class="sensor-trend">${arrow(eq._dp)}</div>
      </div>
    </div>

    <div class="pred-block">
      <div class="pred-header">
        <span class="pred-icon">⚠</span>
        <span class="pred-title">AI Failure Prediction</span>
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
      <div class="budget-label">Budget Impact</div>
      <div>
        <span class="budget-val">${fmtBudget(eq.budgetImpact)}</span>
        <span class="budget-unit"> SAR</span>
      </div>
      <div class="budget-note">${eq.budgetNote}</div>
    </div>`;
}

function analyticsHTML(eq) {
  const h = eq._hist;
  return `
    <div class="chart-section">
      <div class="chart-header">
        <span class="chart-label">درجة الحرارة</span>
        <span class="chart-current" style="color:var(--chart-t)">
          ${fmtVal(eq.temp, eq.temp >= 100 ? 0 : 1)} °C
        </span>
      </div>
      <div class="chart-wrap">
        ${sparklineSVG(h.temp, eq.tempRange, 'var(--chart-t)', eq.id + 't')}
      </div>
      <div class="chart-range">
        <span>${eq.tempRange[0]}°C</span><span>${eq.tempRange[1]}°C</span>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-header">
        <span class="chart-label">الاهتزاز</span>
        <span class="chart-current" style="color:var(--chart-v)">
          ${fmtVal(eq.vib, 2)} mm/s
        </span>
      </div>
      <div class="chart-wrap">
        ${sparklineSVG(h.vib, eq.vibRange, 'var(--chart-v)', eq.id + 'v')}
      </div>
      <div class="chart-range">
        <span>${eq.vibRange[0]}</span><span>${eq.vibRange[1]} mm/s</span>
      </div>
    </div>

    <div class="chart-section">
      <div class="chart-header">
        <span class="chart-label">الضغط</span>
        <span class="chart-current" style="color:var(--chart-p)">
          ${fmtVal(eq.pres, eq.pres >= 100 ? 0 : 1)} bar
        </span>
      </div>
      <div class="chart-wrap">
        ${sparklineSVG(h.pres, eq.presRange, 'var(--chart-p)', eq.id + 'p')}
      </div>
      <div class="chart-range">
        <span>${eq.presRange[0]}</span><span>${eq.presRange[1]} bar</span>
      </div>
    </div>`;
}

function renderDetail(eq) {
  const unit = unitsData.find(u => u.equipment.includes(eq));

  document.getElementById('detailEmpty').classList.add('hidden');
  const content = document.getElementById('detailContent');
  content.classList.remove('hidden');

  content.innerHTML = `
    <div class="detail-header">
      <div class="detail-eq-name">${eq.nameEn}</div>
      <div class="detail-eq-ar">${eq.nameAr}</div>
      <div class="detail-unit-path">${unit ? unit.nameEn + ' › ' + unit.nameAr : ''}</div>
    </div>

    <div class="health-block">
      <div class="health-row">
        <span class="health-label">HEALTH INDEX</span>
        <span class="health-value ${eq.risk}">${eq.health}<small style="font-size:14px">%</small></span>
      </div>
      <div class="health-bar-track">
        <div class="health-bar-fill ${eq.risk}" style="width:${eq.health}%"></div>
      </div>
      <div class="risk-row">
        <span class="risk-note">${riskNote(eq.risk)}</span>
        <span class="risk-badge ${eq.risk}">${riskLabel(eq.risk)}</span>
      </div>
    </div>

    <div class="dtabs-row">
      <button class="dtab ${activeTab === 'diag'      ? 'active' : ''}" data-pane="diag">تشخيص</button>
      <button class="dtab ${activeTab === 'analytics' ? 'active' : ''}" data-pane="analytics">تحليلات</button>
    </div>

    <div class="dtab-pane" id="pane-diag"
         style="${activeTab === 'diag' ? '' : 'display:none'}">
      ${diagHTML(eq)}
    </div>

    <div class="dtab-pane" id="pane-analytics"
         style="${activeTab === 'analytics' ? '' : 'display:none'}">
      ${analyticsHTML(eq)}
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
function openUnit(uid) {
  openUnits.has(uid) ? openUnits.delete(uid) : openUnits.add(uid);
  renderUnits();
}

function selectEquipment(uid, eid) {
  selectedUnit = uid;
  selectedEqId = eid;
  openUnits.add(uid);
  renderUnits();
  updateHotspots();
  const eq = getEq(uid, eid);
  if (eq) renderDetail(eq);
}

function initEvents() {
  // Sidebar clicks (event delegation)
  document.getElementById('unitsList').addEventListener('click', e => {
    const eqEl  = e.target.closest('.eq-item');
    const hdrEl = e.target.closest('.unit-header');
    if      (eqEl)  selectEquipment(eqEl.dataset.unit, eqEl.dataset.eq);
    else if (hdrEl) openUnit(hdrEl.dataset.unit);
  });

  // SVG map hotspot clicks
  document.getElementById('plantMap').addEventListener('click', e => {
    const g = e.target.closest('.hotspot-group');
    if (!g) return;
    const unit = getUnit(g.dataset.unit);
    if (unit && unit.equipment.length)
      selectEquipment(unit.id, unit.equipment[0].id);
  });

  // SVG keyboard support
  document.getElementById('plantMap').addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('.hotspot-group');
    if (g) { e.preventDefault(); g.click(); }
  });

  // Tab switching (event delegation on stable parent)
  document.getElementById('detailPanel').addEventListener('click', e => {
    const tab = e.target.closest('.dtab');
    if (!tab) return;
    activeTab = tab.dataset.pane;
    document.querySelectorAll('.dtab').forEach(t =>
      t.classList.toggle('active', t.dataset.pane === activeTab)
    );
    document.querySelectorAll('.dtab-pane').forEach(p => {
      p.style.display = p.id === 'pane-' + activeTab ? 'flex' : 'none';
    });
  });
}

// ================================================================
// HIGH-RISK ALERT  (CSS animation only)
// ================================================================
function triggerAlert(eqId) {
  const el = document.getElementById('eq-' + eqId);
  if (!el) return;
  el.classList.remove('alert-new');
  void el.offsetWidth;   // reflow to restart animation
  el.classList.add('alert-new');
  el.addEventListener('animationend', () => el.classList.remove('alert-new'), { once: true });
}

// ================================================================
// LIVE SIMULATION
// ================================================================
function pushHist(arr, val) {
  arr.push(val);
  if (arr.length > HIST) arr.shift();
}

function tickSimulation() {
  const alerts = [];

  unitsData.forEach(unit => {
    unit.equipment.forEach(eq => {
      const prevRisk = eq.risk;

      eq._dt = randDelta(eq.tempRange, 0.018);
      eq._dv = randDelta(eq.vibRange,  0.020);
      eq._dp = randDelta(eq.presRange, 0.015);

      eq.temp = clamp(eq.temp + eq._dt, eq.tempRange[0], eq.tempRange[1]);
      eq.vib  = clamp(eq.vib  + eq._dv, eq.vibRange[0],  eq.vibRange[1]);
      eq.pres = clamp(eq.pres + eq._dp, eq.presRange[0], eq.presRange[1]);

      // Push to history buffers
      pushHist(eq._hist.temp, eq.temp);
      pushHist(eq._hist.vib,  eq.vib);
      pushHist(eq._hist.pres, eq.pres);

      eq.health = computeHealth(eq);
      eq.risk   = computeRisk(eq.health);

      if (eq.risk === 'high' && prevRisk !== 'high') alerts.push(eq.id);
    });
  });

  renderUnits();
  updateHotspots();

  // Apply CSS alerts AFTER DOM is rebuilt
  alerts.forEach(triggerAlert);

  // Refresh detail panel (preserves tab state via activeTab variable)
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
  const n   = new Date();
  const pad = x => String(x).padStart(2, '0');
  const el  = document.getElementById('systemTime');
  if (el) el.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
}

// ================================================================
// INIT
// ================================================================
function init() {
  unitsData.forEach(u => u.equipment.forEach(eq => {
    eq._dt = 0; eq._dv = 0; eq._dp = 0;
    eq.health = computeHealth(eq);
    eq.risk   = computeRisk(eq.health);

    // Pre-fill history with slight variation around initial value
    eq._hist = {
      temp: Array.from({ length: HIST }, (_, i) =>
        clamp(eq.temp + (Math.random() - 0.5) * (eq.tempRange[1] - eq.tempRange[0]) * 0.04,
              eq.tempRange[0], eq.tempRange[1])),
      vib:  Array.from({ length: HIST }, () =>
        clamp(eq.vib  + (Math.random() - 0.5) * (eq.vibRange[1]  - eq.vibRange[0])  * 0.04,
              eq.vibRange[0],  eq.vibRange[1])),
      pres: Array.from({ length: HIST }, () =>
        clamp(eq.pres + (Math.random() - 0.5) * (eq.presRange[1] - eq.presRange[0]) * 0.04,
              eq.presRange[0], eq.presRange[1]))
    };
  }));

  renderUnits();
  updateHotspots();
  initEvents();

  updateClock();
  setInterval(updateClock, 1000);

  setTimeout(tickSimulation, 5000);
}

init();
